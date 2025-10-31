import { Injectable } from '@nestjs/common';
import { Keypair, PublicKey } from '@solana/web3.js';
import { BankService } from './degenbank.service';
import { ConfigService } from '@nestjs/config';
import { Battle } from 'src/models/battle.model';
import { Vault } from 'src/models/vault.model';
import { Manager } from 'src/models/manager.model';
import { InjectModel } from '@nestjs/sequelize';

@Injectable()
export class DemoService {
  constructor(
    private readonly bankService: BankService,
    private readonly configService: ConfigService,
    @InjectModel(Battle) private readonly battleModel: typeof Battle,
    @InjectModel(Vault) private readonly vaultManager: typeof Vault,
    @InjectModel(Manager) private readonly managerModel: typeof Manager,
  ) {}

  async setupBattleAndVaults(
    managerStr1: string,
    managerStr2: string,
    startAt: number,
    endAt: number,
    target: number,
  ) {
    const referee = Keypair.generate().publicKey;
    const ownerEnv = this.configService.get<string>('OWNER_PUBKEY');
    let owner: PublicKey;

    if (!ownerEnv || ownerEnv.trim() === '') {
      console.warn('OWNER_PUBKEY not configured, using default placeholder');
      owner = new PublicKey('11111111111111111111111111111111');
    } else {
      try {
        owner = new PublicKey(ownerEnv);
      } catch {
        console.error('Invalid OWNER_PUBKEY format:', ownerEnv);
        throw new Error(`Invalid OWNER_PUBKEY format: ${ownerEnv}`);
      }
    }
    const manager1 = await this.bankService.getManagerPda(managerStr1);
    const manager2 = await this.bankService.getManagerPda(managerStr2);

    const originToken = await this.bankService.createSplTokenAndMint(9, owner);
    const originTokenMint = originToken.mint;

    console.log(originToken);

    const treasuryTokenAccount = await this.bankService.getTokenAccount(
      originTokenMint,
      owner,
    );

    console.log('START', treasuryTokenAccount);

    const battleTx = await this.bankService.initializeBattle(
      referee,
      treasuryTokenAccount,
      startAt,
      endAt,
    );

    console.log('Battle TX', battleTx);

    const [battlePda] = PublicKey.findProgramAddressSync(
      [
        Buffer.from('battle'),
        this.bankService['provider'].wallet.publicKey.toBuffer(),
      ],
      this.bankService['program'].programId,
    );

    console.log('Battle PDA', battlePda.toString());
    console.log('Battle Treasury', treasuryTokenAccount.toString());
    console.log('Battle Owner', ownerEnv);

    const manager1Info = await this.bankService.getManagerInfo(manager1);

    let vault1Token;
    try {
      vault1Token = await this.bankService.createSplToken(
        9,
        manager1Info.vaultPda,
      );
    } catch (error) {
      console.error('Error in vault1Token:', error);
      throw error;
    }

    const vault1Tx = await this.bankService.createVault(
      manager1,
      manager1Info.managerTokenAccount,
      target,
    );

    const register1Tx = await this.bankService.registerVault(
      manager1Info.vaultPda,
      battlePda,
    );

    console.log('Vault 1 TX', vault1Tx);
    console.log('Register 1 TX', register1Tx);

    const manager2Info = await this.bankService.getManagerInfo(manager2);

    let vault2Token;
    try {
      vault2Token = await this.bankService.createSplToken(
        9,
        manager2Info.vaultPda,
      );
    } catch (error) {
      console.error('Error in vault2Token:', error);
      throw error;
    }

    const vault2Tx = await this.bankService.createVault(
      manager2,
      manager2Info.managerTokenAccount,
      target,
    );

    const register2Tx = await this.bankService.registerVault(
      manager2Info.vaultPda,
      battlePda,
    );

    console.log('Vault 2 TX', vault2Tx);
    console.log('Register 2 TX', register2Tx);

    console.log('Manager 1 PubKey', manager1);
    console.log('Manager 1 Token Account', manager1Info.managerTokenAccount);
    console.log('Manager 1 Vault', manager1Info.vaultPda);
    console.log('Manager 1 Vault SPL', vault1Token);
    console.log(
      'Manager 1 Vault Token Account',
      manager1Info.vaultTokenAccount,
    );
    console.log('Manager 2 PubKey', manager2);
    console.log('Manager 2 Token Account', manager2Info.managerTokenAccount);
    console.log('Manager 2 Vault', manager2Info.vaultPda);
    console.log(
      'Manager 2 Vault Token Account',
      manager2Info.vaultTokenAccount,
    );
    console.log('Manager 2 Vault SPL', vault2Token);
  }
}
