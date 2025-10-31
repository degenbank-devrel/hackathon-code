import { Injectable } from '@nestjs/common';
import {
  Connection,
  PublicKey,
  Transaction,
  Keypair,
  SystemProgram,
  SYSVAR_RENT_PUBKEY,
  TokenAmount,
} from '@solana/web3.js';
import { DegenBank } from '../../idl/bank';
import {
  Program,
  AnchorProvider,
  BN,
  Wallet,
  setProvider,
} from '@coral-xyz/anchor';
import { ConfigService } from '@nestjs/config';
import {
  createMint,
  createTransferInstruction,
  getAssociatedTokenAddress,
  getOrCreateAssociatedTokenAccount,
  mintTo,
  TOKEN_PROGRAM_ID,
} from '@solana/spl-token';
import IDL from '../../idl/idl.json';

@Injectable()
export class BankService {
  private provider: AnchorProvider;
  private program: Program<DegenBank>;
  private connection: Connection;
  private originTokenMint: PublicKey;
  private programId: PublicKey;

  constructor(private readonly configService: ConfigService) {
    const mintToken = this.configService.get<string>('ORIGIN_TOKEN_MINT');
    const privateKey = this.configService.get<string>('OWNER_PRIVATE') || '[]';
    const programIdStr = this.configService.get<string>('PROGRAM_ID');

    // Validate required environment variables
    if (!mintToken || mintToken.trim() === '') {
      console.warn(
        'ORIGIN_TOKEN_MINT not configured, using default placeholder',
      );
      // Use a valid placeholder PublicKey for development
      this.originTokenMint = new PublicKey('11111111111111111111111111111111');
    } else {
      try {
        this.originTokenMint = new PublicKey(mintToken);
      } catch {
        console.error('Invalid ORIGIN_TOKEN_MINT format:', mintToken);
        throw new Error(`Invalid ORIGIN_TOKEN_MINT format: ${mintToken}`);
      }
    }

    if (!programIdStr || programIdStr.trim() === '') {
      console.warn('PROGRAM_ID not configured, using default placeholder');
      // Use a valid placeholder PublicKey for development
      this.programId = new PublicKey('11111111111111111111111111111111');
    } else {
      try {
        this.programId = new PublicKey(programIdStr);
      } catch {
        console.error('Invalid PROGRAM_ID format:', programIdStr);
        throw new Error(`Invalid PROGRAM_ID format: ${programIdStr}`);
      }
    }

    this.connection = new Connection(
      process.env.SOLANA_RPC_URL || 'https://api.mainnet-beta.solana.com',
    );

    let secretKeyBytes;
    try {
      secretKeyBytes = Uint8Array.from(JSON.parse(privateKey));
    } catch (error) {
      console.error('Failed to parse private key as JSON array:', error);
      try {
        if (privateKey.startsWith('[') && privateKey.endsWith(']')) {
          const cleanedKey = privateKey
            .substring(1, privateKey.length - 1)
            .split(',')
            .map((num) => parseInt(num.trim(), 10));
          secretKeyBytes = Uint8Array.from(cleanedKey);
        } else if (/^[0-9a-fA-F]+$/.test(privateKey)) {
          secretKeyBytes = Buffer.from(privateKey, 'hex');
        } else {
          console.warn('Using fallback keypair for development');
          secretKeyBytes = Keypair.generate().secretKey;
        }
      } catch (innerError) {
        console.error('Failed to parse private key:', innerError);
        console.warn('Using fallback keypair for development');
        secretKeyBytes = Keypair.generate().secretKey;
      }
    }

    if (secretKeyBytes.length !== 64) {
      console.warn(
        `Secret key has incorrect length: ${secretKeyBytes.length}, expected 64. Using fallback keypair.`,
      );
      secretKeyBytes = Keypair.generate().secretKey;
    }

    const authority = Keypair.fromSecretKey(secretKeyBytes);

    this.provider = new AnchorProvider(this.connection, new Wallet(authority));
    setProvider(this.provider);
    this.init();
  }

  async init() {
    this.program = new Program(IDL as DegenBank, this.provider);
  }

  async createSplTokenAndMint(
    decimals: number = 9,
    mintAuthority: PublicKey,
    freezeAuthority?: PublicKey,
    amount: number = 1000000000000,
  ): Promise<{ mint: PublicKey; tokenAccount: PublicKey }> {
    const mint = await createMint(
      this.connection,
      this.provider.wallet.payer!,
      mintAuthority,
      freezeAuthority || null,
      decimals,
      undefined,
      undefined,
      TOKEN_PROGRAM_ID,
    );

    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      this.connection,
      this.provider.wallet.payer!,
      mint,
      this.provider.wallet.publicKey,
      true,
      undefined,
      undefined,
      TOKEN_PROGRAM_ID,
    );

    await mintTo(
      this.connection,
      this.provider.wallet.payer!,
      mint,
      tokenAccount.address,
      mintAuthority,
      amount,
      [],
      undefined,
      TOKEN_PROGRAM_ID,
    );

    return { mint, tokenAccount: tokenAccount.address };
  }

  async getTokenAccount(mint: PublicKey, owner: PublicKey): Promise<PublicKey> {
    console.log('payer', this.provider.wallet.payer);
    const tokenAccount = await getOrCreateAssociatedTokenAccount(
      this.connection,
      this.provider.wallet.payer!,
      mint,
      owner,
      true,
      'confirmed',
      undefined,
      TOKEN_PROGRAM_ID,
    );
    return tokenAccount.address;
  }

  async getManagerPda(manager: string): Promise<PublicKey> {
    const [managerPda] = PublicKey.findProgramAddressSync(
      [Buffer.from(manager), this.provider.wallet.publicKey.toBuffer()],
      this.programId,
    );
    return managerPda;
  }

  async getManagerInfo(manager: PublicKey): Promise<{
    managerTokenAccount: PublicKey;
    vaultPda: PublicKey;
    vaultTokenAccount: PublicKey;
  }> {
    const [vaultPda] = PublicKey.findProgramAddressSync(
      [Buffer.from('vault'), manager.toBuffer()],
      this.programId,
    );

    const managerTokenAccount = await this.getTokenAccount(
      this.originTokenMint,
      manager,
    );

    const vaultTokenAccount = await this.getTokenAccount(
      this.originTokenMint,
      vaultPda,
    );

    return {
      managerTokenAccount: managerTokenAccount,
      vaultPda,
      vaultTokenAccount: vaultTokenAccount,
    };
  }

  async createVault(
    manager: PublicKey,
    managerTokenAccount: PublicKey,
    target: number,
  ): Promise<string> {
    const { vaultPda, vaultTokenAccount } = await this.getManagerInfo(manager);

    const tx = await this.program.methods
      .createVault(new BN(target))
      .accountsStrict({
        manager,
        managerTokenAccount,
        vault: vaultPda as unknown as any,
        vaultTokenAccount: vaultTokenAccount,
        authority: this.provider.wallet.publicKey,
        tokenProgram: TOKEN_PROGRAM_ID,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    return tx;
  }

  async initializeBattle(
    referee: PublicKey,
    treasuryTokenAccount: PublicKey,
    startAt: number,
    endAt: number,
  ): Promise<string> {
    const [battlePda] = PublicKey.findProgramAddressSync(
      [Buffer.from('battle'), this.provider.wallet.publicKey.toBuffer()],
      this.programId,
    );

    const tx = await this.program.methods
      .initialize(new BN(startAt), new BN(endAt))
      .accountsStrict({
        referee,
        treasuryTokenAccount,
        battle: battlePda,
        authority: this.provider.wallet.publicKey,
        rent: SYSVAR_RENT_PUBKEY,
        systemProgram: SystemProgram.programId,
      })
      .rpc();
    return tx;
  }

  async registerVault(vault: PublicKey, battle: PublicKey): Promise<string> {
    const tx = await this.program.methods
      .registerVault()
      .accounts({
        vault,
        battle,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();
    return tx;
  }

  async setWinner(
    winnerVault: PublicKey,
    winnerVaultTokenAccount: PublicKey,
    battle: PublicKey,
  ): Promise<string> {
    const tx = await this.program.methods
      .setWinner()
      .accounts({
        winnerVault,
        winnerVaultTokenAccount,
        battle,
        authority: this.provider.wallet.publicKey,
      })
      .rpc();
    return tx;
  }

  async signAndSend(tx: Transaction, payer: Keypair): Promise<string> {
    tx.feePayer = payer.publicKey;
    const { blockhash } = await this.connection.getLatestBlockhash();
    tx.recentBlockhash = blockhash;
    tx.sign(payer);
    const signature = await this.connection.sendRawTransaction(tx.serialize());
    await this.connection.confirmTransaction(
      {
        signature: signature,
        blockhash: blockhash,
        lastValidBlockHeight: (await this.connection.getLatestBlockhash())
          .lastValidBlockHeight,
      },
      'confirmed',
    );
    return signature;
  }

  async createSplToken(
    decimals: number = 9,
    mintAuthority: PublicKey,
  ): Promise<{ mint: PublicKey }> {
    const mint = await createMint(
      this.connection,
      this.provider.wallet.payer!,
      mintAuthority,
      null,
      decimals,
      undefined,
      undefined,
      TOKEN_PROGRAM_ID,
    );

    return { mint };
  }

  async getSplTokenBalance(
    mint: PublicKey,
    owner: PublicKey,
  ): Promise<TokenAmount | null> {
    try {
      const tokenAccount = await getAssociatedTokenAddress(mint, owner, true);
      const balance =
        await this.connection.getTokenAccountBalance(tokenAccount);
      return balance.value;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getSplTokenBalanceFromAccount(
    account: PublicKey,
  ): Promise<TokenAmount | null> {
    try {
      const balance = await this.connection.getTokenAccountBalance(account);
      return balance.value;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async sendInterestToken(
    destinationTokenAccount: PublicKey,
    amount: number,
    mint: PublicKey,
  ): Promise<string> {
    const sourceTokenAccount = await getAssociatedTokenAddress(
      mint,
      this.provider.wallet.publicKey,
      true,
      TOKEN_PROGRAM_ID,
    );

    const tx = new Transaction().add(
      createTransferInstruction(
        sourceTokenAccount,
        destinationTokenAccount,
        this.provider.wallet.publicKey,
        amount,
        [],
        TOKEN_PROGRAM_ID,
      ),
    );

    return this.signAndSend(tx, this.provider.wallet.payer!);
  }

  async getSplTotalSupply(mint: PublicKey): Promise<TokenAmount | null> {
    try {
      const supply = await this.connection.getTokenSupply(mint);
      return supply.value;
    } catch (error) {
      console.error(error);
      return null;
    }
  }

  async getVaultData(vaultPda: PublicKey): Promise<any> {
    const vaultAccount = await this.program.account.vault.fetch(vaultPda);
    return vaultAccount;
  }
}
