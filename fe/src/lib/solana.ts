import {
  Connection,
  PublicKey,
  Transaction,
  Signer,
  RpcResponseAndContext,
  SimulatedTransactionResponse,
} from "@solana/web3.js";

// Solana configuration
const getNetworkConfig = () => {
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

  if (network === "devnet") {
    // Devnet uses USDC
    return {
      rpcUrl: "https://api.devnet.solana.com",
      tokenMint: new PublicKey("USDCoctVLVnvTXBEuP9s8hntucdJokbo17RwHuNXemT"), // USDC Devnet
      tokenSymbol: "USDC",
    };
  } else if (network === "mainnet") {
    // Mainnet uses USDC
    return {
      rpcUrl:
        process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
        "https://api.mainnet-beta.solana.com",
      tokenMint: new PublicKey("EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v"), // USDC Mainnet
      tokenSymbol: "USDC",
    };
  } else {
    // Default to devnet config
    return {
      rpcUrl: "https://api.devnet.solana.com",
      tokenMint: new PublicKey("USDCoctVLVnvTXBEuP9s8hntucdJokbo17RwHuNXemT"), // USDC Devnet
      tokenSymbol: "USDC",
    };
  }
};

const networkConfig = getNetworkConfig();

export const SOLANA_RPC_URL = networkConfig.rpcUrl;
export const TOKEN_MINT = networkConfig.tokenMint;
export const TOKEN_SYMBOL = networkConfig.tokenSymbol;
export const PROGRAM_ID = new PublicKey(
  "GoXfRMXGPgf91TSUViswPtnfEbTj4c9D6uqJe3VcPx6q"
);
export const VAULT_PDA = new PublicKey(
  "4KbdwX1vhADhW6xonCvEp6hdVLKMsJatbUbYompER32q"
);

// Connection instance
export const connection = new Connection(SOLANA_RPC_URL, "confirmed");

// Utility functions for Solana program interactions
export class SolanaService {
  private connection: Connection;
  private programId: PublicKey;

  constructor() {
    this.connection = new Connection(SOLANA_RPC_URL, "confirmed");
    this.programId = PROGRAM_ID;
  }

  // Get vault PDA
  async getVaultPDA(manager: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("vault"), manager.toBuffer()],
      this.programId
    );
  }

  // Get battle PDA
  async getBattlePDA(authority: PublicKey): Promise<[PublicKey, number]> {
    return PublicKey.findProgramAddressSync(
      [Buffer.from("battle"), authority.toBuffer()],
      this.programId
    );
  }

  // Get vault account info
  async getVaultAccount(vaultPubkey: PublicKey) {
    try {
      const accountInfo = await this.connection.getAccountInfo(vaultPubkey);
      return accountInfo;
    } catch (error) {
      console.error("Error fetching vault account:", error);
      return null;
    }
  }

  // Get battle account info
  async getBattleAccount(battlePubkey: PublicKey) {
    try {
      const accountInfo = await this.connection.getAccountInfo(battlePubkey);
      return accountInfo;
    } catch (error) {
      console.error("Error fetching battle account:", error);
      return null;
    }
  }

  // Get token account balance
  async getTokenBalance(tokenAccount: PublicKey): Promise<number> {
    try {
      const balance =
        await this.connection.getTokenAccountBalance(tokenAccount);
      return balance.value.uiAmount || 0;
    } catch (error) {
      console.error("Error fetching token balance:", error);
      return 0;
    }
  }

  // Get native SOL balance (for transaction fees)
  async getSolBalance(publicKey: PublicKey): Promise<number> {
    try {
      const balance = await this.connection.getBalance(publicKey);
      return balance / 1e9; // Convert lamports to SOL
    } catch (error) {
      console.error("Error fetching SOL balance:", error);
      return 0;
    }
  }

  // Simulate transaction
  async simulateTransaction(
    transaction: Transaction
  ): Promise<RpcResponseAndContext<SimulatedTransactionResponse>> {
    try {
      const simulation = await this.connection.simulateTransaction(transaction);
      return simulation;
    } catch (error) {
      console.error("Error simulating transaction:", error);
      throw error;
    }
  }

  // Send and confirm transaction
  async sendAndConfirmTransaction(
    transaction: Transaction,
    signers: Signer[]
  ): Promise<string> {
    try {
      const signature = await this.connection.sendTransaction(
        transaction,
        signers
      );
      await this.connection.confirmTransaction(signature, "confirmed");
      return signature;
    } catch (error) {
      console.error("Error sending transaction:", error);
      throw error;
    }
  }
}

export const solanaService = new SolanaService();
