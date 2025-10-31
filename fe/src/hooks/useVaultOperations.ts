import { useState, useCallback, useMemo } from "react";
import { usePrivy } from "@privy-io/react-auth";
import {
  useWallets,
  useSignAndSendTransaction,
} from "@privy-io/react-auth/solana";
import {
  PublicKey,
  Transaction,
  TransactionInstruction,
  SystemProgram,
  Keypair,
} from "@solana/web3.js";
import bs58 from "bs58";
import {
  TOKEN_PROGRAM_ID,
  getAssociatedTokenAddress,
  createAssociatedTokenAccountInstruction,
  createInitializeMintInstruction,
  MINT_SIZE,
} from "@solana/spl-token";
import {
  connection,
  PROGRAM_ID,
  TOKEN_MINT,
  solanaService,
} from "@/lib/solana";
import { apiService } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { toast } from "sonner";
import { Program, AnchorProvider, Idl, Wallet, BN } from "@coral-xyz/anchor";
import IDL from "@/idl/idl.json";

// Define wallet adapter interface
interface WalletAdapter {
  isPhantom?: boolean;
  isSolflare?: boolean;
  isBackpack?: boolean;
  signAndSendTransaction?: (
    transaction: Transaction
  ) => Promise<{ signature: string } | string>;
  signTransaction?: (transaction: Transaction) => Promise<Transaction>;
}

// Extend window interface for wallet adapters
declare global {
  interface Window {
    solana?: WalletAdapter;
    solflare?: WalletAdapter;
    backpack?: WalletAdapter;
  }
}

// Helper function to validate Solana address
const isSolanaAddress = (address: string): boolean => {
  try {
    // Solana addresses are base58 encoded and typically 32-44 characters long
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  } catch {
    return false;
  }
};

interface VaultOperationState {
  isLoading: boolean;
  error: string | null;
  txSignature: string | null;
}

interface VaultOperationResult {
  success: boolean;
  signature?: string;
  error?: string;
}

interface SuccessModalState {
  isOpen: boolean;
  txSignature: string | null;
  transactionType: "deposit" | "withdraw" | null;
  amount: number | null;
}

export const useVaultOperations = () => {
  const { authenticated, user: privyUser, getAccessToken } = usePrivy();
  const { user } = useAuth();
  const { wallets } = useWallets();
  const [depositState, setDepositState] = useState<VaultOperationState>({
    isLoading: false,
    error: null,
    txSignature: null,
  });
  const [withdrawState, setWithdrawState] = useState<VaultOperationState>({
    isLoading: false,
    error: null,
    txSignature: null,
  });
  const [successModal, setSuccessModal] = useState<SuccessModalState>({
    isOpen: false,
    txSignature: null,
    transactionType: null,
    amount: null,
  });

  // Function to show success modal
  const showSuccessModal = useCallback(
    (
      txSignature: string,
      transactionType: "deposit" | "withdraw",
      amount: number
    ) => {
      setSuccessModal({
        isOpen: true,
        txSignature,
        transactionType,
        amount,
      });
    },
    []
  );

  // Function to close success modal
  const closeSuccessModal = useCallback(() => {
    setSuccessModal({
      isOpen: false,
      txSignature: null,
      transactionType: null,
      amount: null,
    });
  }, []);

  // fake anchor provider
  const provider = useMemo(() => {
    if (!privyUser || !privyUser.wallet?.address) return null;

    const walletAddress = new PublicKey(privyUser.wallet.address);
    return new AnchorProvider(
      connection,
      {
        publicKey: walletAddress,
        signTransaction: async () => {
          throw new Error("Wallet does not support transaction signing");
        },
        signAllTransactions: async () => {
          throw new Error(
            "Wallet does not support multiple transaction signing"
          );
        },
      } as unknown as Wallet,
      AnchorProvider.defaultOptions()
    );
  }, [privyUser]);
  const program = useMemo(() => {
    if (!provider) return null;
    try {
      return new Program(IDL as unknown as Idl, provider);
    } catch (error) {
      console.error("Failed to initialize program:", error);
      return null;
    }
  }, [provider]);

  // Get wallet address (simplified to work with any Solana wallet)
  const getWalletAddress = useCallback(() => {
    if (!privyUser) return null;

    // Find any valid Solana wallet from connected wallets
    const validSolanaWallet = wallets.find((wallet) =>
      isSolanaAddress(wallet.address)
    );
    if (validSolanaWallet) {
      return validSolanaWallet.address;
    }

    // Check for embedded Solana wallet in linked accounts
    const embeddedWallet = privyUser.linkedAccounts.find(
      (account) =>
        account.type === "wallet" &&
        "address" in account &&
        isSolanaAddress(account.address)
    );

    if (embeddedWallet && "address" in embeddedWallet) {
      return embeddedWallet.address;
    }

    return null;
  }, [privyUser, wallets]);

  // Get user's public key
  const getUserPublicKey = useCallback(() => {
    const address = getWalletAddress();
    if (!authenticated || !address) {
      throw new Error("Wallet not connected");
    }
    return new PublicKey(address);
  }, [authenticated, getWalletAddress]);

  // Create deposit instruction
  const createDepositInstruction = useCallback(
    async (
      vaultPubkey: PublicKey,
      battlePubkey: PublicKey,
      userPubkey: PublicKey,
      amount: bigint,
      vaultTokenMint: PublicKey
    ): Promise<TransactionInstruction | null> => {
      // Use vault as authority
      const vtokenAuthority = vaultPubkey;

      // Get token accounts
      const depositorTokenAccount = await getAssociatedTokenAddress(
        TOKEN_MINT,
        userPubkey
      );

      const depositorVtokenAccount = await getAssociatedTokenAddress(
        vaultTokenMint,
        userPubkey
      );

      const vtokenAccount = vaultTokenMint;

      const vaultTokenAccount = await getAssociatedTokenAddress(
        TOKEN_MINT, // This should be the deposit token (USDC), not vault token mint
        vaultPubkey,
        true
      );

      return program
        ? program.methods
            .deposit(new BN(amount.toString()))
            .accountsStrict({
              battle: battlePubkey,
              vault: vaultPubkey,
              depositor: userPubkey,
              depositorTokenAccount: depositorTokenAccount,
              depositorVtokenAccount: depositorVtokenAccount,
              vtokenAccount: vtokenAccount,
              vtokenAuthority: vtokenAuthority,
              vaultTokenAccount: vaultTokenAccount,
              tokenProgram: TOKEN_PROGRAM_ID,
            })
            .instruction()
        : null;
    },
    [program]
  );

  // Create withdraw instruction
  const createWithdrawInstruction = useCallback(
    async (
      vaultPubkey: PublicKey,
      battlePubkey: PublicKey,
      userPubkey: PublicKey,
      amount: bigint,
      vaultTokenMint: PublicKey
    ): Promise<TransactionInstruction | null> => {
      // Use vault as authority
      const vtokenAuthority = vaultPubkey;

      // Get token accounts
      const depositorTokenAccount = await getAssociatedTokenAddress(
        TOKEN_MINT,
        userPubkey
      );

      const depositorVtokenAccount = await getAssociatedTokenAddress(
        vaultTokenMint,
        userPubkey
      );

      const vtokenAccount = vaultTokenMint;

      const vaultTokenAccount = await getAssociatedTokenAddress(
        TOKEN_MINT, // This should be the deposit token (USDC), not vault token mint
        vaultPubkey,
        true
      );

      return program
        ? program.methods
            .withdraw(new BN(amount.toString()))
            .accountsStrict({
              battle: battlePubkey,
              vault: vaultPubkey,
              depositor: userPubkey,
              depositorTokenAccount: depositorTokenAccount,
              depositorVtokenAccount: depositorVtokenAccount,
              vtokenAccount: vtokenAccount,
              vtokenAuthority: vtokenAuthority,
              vaultTokenAccount: vaultTokenAccount,
              tokenProgram: TOKEN_PROGRAM_ID,
            })
            .instruction()
        : null;
    },
    [program]
  );

  // Send and confirm transaction using Privy's signAndSendTransaction hook
  const sendTransaction = useCallback(
    async (
      transaction: Transaction,
      additionalSigners: Keypair[] = []
    ): Promise<string> => {
      if (!privyUser || !wallets.length) {
        throw new Error("Wallet not connected");
      }
      const selectedWallet = wallets[0];

      if (!selectedWallet.signAndSendTransaction) {
        throw new Error("Wallet does not support transaction signing");
      }

      // Only set fee payer and recent blockhash if not already set
      if (!transaction.feePayer) {
        transaction.feePayer = new PublicKey(selectedWallet.address);
      }

      if (!transaction.recentBlockhash) {
        transaction.recentBlockhash = (
          await connection.getLatestBlockhash()
        ).blockhash;
      }

      const serializedTx = transaction.serialize({
        requireAllSignatures: false,
        verifySignatures: false,
      });

      const result = await selectedWallet.signAndSendTransaction({
        chain: `solana:devnet`,
        transaction: new Uint8Array(serializedTx),
      });

      const signature = typeof result === "string" ? result : result.signature;
      if (!signature) {
        throw new Error("Transaction signing failed");
      }

      // Ensure signature is properly formatted as a base58 string
      if (typeof signature === "string") {
        // If it's already a string, assume it's base58 encoded
        return signature;
      } else if (signature instanceof Uint8Array) {
        // Convert Uint8Array to base58 string (Solana standard)
        return bs58.encode(signature);
      } else {
        // Fallback: convert to string and assume it's base58
        return String(signature);
      }
    },
    [wallets, privyUser]
  );

  // Deposit function
  const deposit = useCallback(
    async (
      vaultId: string,
      amount: number,
      battleAddress?: string
    ): Promise<VaultOperationResult> => {
      try {
        setDepositState({ isLoading: true, error: null, txSignature: null });

        // Input validation
        if (!vaultId || vaultId.trim() === "") {
          throw new Error("Vault ID is required");
        }

        if (!amount || amount <= 0) {
          throw new Error("Amount must be greater than 0");
        }

        if (amount > 1000000) {
          // Reasonable upper limit
          throw new Error("Amount is too large");
        }

        const userPubkey = getUserPublicKey();

        // Get vault data to retrieve the actual vault address
        const vaultData = await apiService.getVault(vaultId);

        if (!vaultData) {
          throw new Error("Vault not found");
        }

        if (!vaultData.vault_address || vaultData.vault_address.trim() === "") {
          throw new Error("Vault address is missing or invalid");
        }

        // Note: Vault availability should be checked via backend fields

        // Validate vault_token_mint before creating PublicKey
        if (
          !vaultData.vault_token_mint ||
          vaultData.vault_token_mint.trim() === ""
        ) {
          throw new Error("Vault token mint is missing or invalid");
        }

        let vaultTokenMint: PublicKey;
        try {
          vaultTokenMint = new PublicKey(vaultData.vault_token_mint);
        } catch (error) {
          throw new Error(
            `Invalid vault token mint address: ${vaultData.vault_token_mint}`
          );
        }

        // Use vault_address instead of vault_id for PublicKey creation
        const vaultPubkey = new PublicKey(vaultData.vault_address);
        const amountBigInt = BigInt(Math.floor(amount * 1e6)); // Convert to USDC units (6 decimals)

        // Build transaction
        const transaction = new Transaction();

        // Get battle PDA or use provided address
        let battlePubkey: PublicKey;
        let battleData = null;

        if (battleAddress) {
          try {
            battlePubkey = new PublicKey(battleAddress);
          } catch (error) {
            throw new Error(`Invalid battle address: ${battleAddress}`);
          }
        } else {
          // Try to get battle PDA from vault's battle data
          if (vaultData.battle_id) {
            try {
              battleData = await apiService.getBattle(
                vaultData.battle_id.toString()
              );

              if (battleData && battleData.pda_address) {
                battlePubkey = new PublicKey(battleData.pda_address);
              } else {
                // Use battle owner address from database if available
                const ownerPubkey = battleData?.owner_address
                  ? new PublicKey(battleData.owner_address)
                  : userPubkey;
                const [battlePDA] =
                  await solanaService.getBattlePDA(ownerPubkey);
                battlePubkey = battlePDA;
              }
            } catch (error) {
              console.warn("Failed to get battle data, using user PDA:", error);
              const [battlePDA] = await solanaService.getBattlePDA(userPubkey);
              battlePubkey = battlePDA;
            }
          } else {
            const [battlePDA] = await solanaService.getBattlePDA(userPubkey);
            battlePubkey = battlePDA;
          }
        }

        // Validate battle lock period
        if (battleData) {
          const currentTime = Math.floor(Date.now() / 1000); // Current time in seconds

          // Check if battle has start and end times
          if (battleData.battle_start && battleData.battle_end) {
            const battleEnd = Math.floor(
              new Date(battleData.battle_end).getTime() / 1000
            );

            // Only block if battle has ended (completed)
            if (currentTime > battleEnd) {
              console.warn(
                `Battle has ended. Battle "${battleData.battle_name || "Unknown"}" ended at ${new Date(battleData.battle_end).toLocaleString()}. Deposits may not be allowed for completed battles.`
              );
            }

            // Check for specific phases that definitely block deposits
            if (battleData.current_phase === "completed") {
              throw new Error(
                `Deposits are not allowed for completed battles. Current phase: ${battleData.current_phase}.`
              );
            }
          }

          // Note: Vault status validation is handled by backend
        }

        // Get all required token accounts
        const depositorTokenAccount = await getAssociatedTokenAddress(
          TOKEN_MINT,
          userPubkey
        );

        const depositorVtokenAccount = await getAssociatedTokenAddress(
          vaultTokenMint,
          userPubkey
        );

        // Validate vault_token_address before creating PublicKey
        let vaultTokenAccount: PublicKey;
        if (
          vaultData.vault_token_address &&
          vaultData.vault_token_address.trim() !== ""
        ) {
          try {
            vaultTokenAccount = new PublicKey(vaultData.vault_token_address);
          } catch (error) {
            // Fallback: create associated token address for vault
            vaultTokenAccount = await getAssociatedTokenAddress(
              TOKEN_MINT,
              vaultPubkey,
              true
            );
          }
        } else {
          // Create associated token address for vault
          vaultTokenAccount = await getAssociatedTokenAddress(
            TOKEN_MINT,
            vaultPubkey,
            true
          );
        }

        // Validate all required accounts before creating instructions

        // Validate vault account
        const vaultAccountInfo = await connection.getAccountInfo(vaultPubkey);
        if (!vaultAccountInfo) {
          throw new Error(
            `Vault account does not exist: ${vaultPubkey.toString()}`
          );
        }

        // Check if vault is owned by our program
        if (!vaultAccountInfo.owner.equals(PROGRAM_ID)) {
          console.warn("Vault account is not owned by our program");
        }

        // Validate battle account
        const battleAccountInfo = await connection.getAccountInfo(battlePubkey);
        if (!battleAccountInfo) {
          // Provide more specific error message based on available data
          let errorMessage = `Battle account does not exist: ${battlePubkey.toString()}.`;

          if (battleData) {
            errorMessage += ` Battle ID ${battleData.battle_id} (${battleData.battle_name || "Unknown"}) may not be properly initialized on-chain.`;
            if (battleData.status === "completed") {
              errorMessage += ` Battle status is currently: ${battleData.status}.`;
            }
          } else {
            errorMessage += ` Unable to fetch battle data from database.`;
          }

          errorMessage += ` Please contact the administrator or try with a different battle address.`;

          throw new Error(errorMessage);
        }

        // Validate TOKEN_MINT
        const tokenMintInfo = await connection.getAccountInfo(TOKEN_MINT);
        if (!tokenMintInfo) {
          throw new Error(
            `Token mint does not exist: ${TOKEN_MINT.toString()}`
          );
        }

        // Validate vault token mint
        const vaultTokenMintInfo =
          await connection.getAccountInfo(vaultTokenMint);
        if (!vaultTokenMintInfo) {
          throw new Error(
            `Vault token mint does not exist: ${vaultTokenMint.toString()}`
          );
        }

        // Check and create depositor token account if needed
        try {
          const depositorTokenAccountInfo = await connection.getAccountInfo(
            depositorTokenAccount
          );
          if (!depositorTokenAccountInfo) {
            transaction.add(
              createAssociatedTokenAccountInstruction(
                userPubkey,
                depositorTokenAccount,
                userPubkey,
                TOKEN_MINT
              )
            );
          }

          // Check and create depositor vtoken account if needed
          const depositorVtokenAccountInfo = await connection.getAccountInfo(
            depositorVtokenAccount
          );
          if (!depositorVtokenAccountInfo) {
            transaction.add(
              createAssociatedTokenAccountInstruction(
                userPubkey,
                depositorVtokenAccount,
                userPubkey,
                vaultTokenMint
              )
            );
          }

          // Check and create vault token account if needed
          const vaultTokenAccountInfo =
            await connection.getAccountInfo(vaultTokenAccount);
          if (!vaultTokenAccountInfo) {
            transaction.add(
              createAssociatedTokenAccountInstruction(
                userPubkey,
                vaultTokenAccount,
                vaultPubkey,
                TOKEN_MINT
              )
            );
          }
        } catch (error) {
          throw new Error(
            `Failed to check or create token accounts: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }

        // Add deposit instruction
        let depositIx: TransactionInstruction;
        try {
          const instruction = await createDepositInstruction(
            vaultPubkey,
            battlePubkey,
            userPubkey,
            amountBigInt,
            vaultTokenMint
          );

          if (!instruction) {
            throw new Error("Deposit instruction creation returned null");
          }

          depositIx = instruction;
          transaction.add(depositIx);
        } catch (error) {
          throw new Error(
            `Failed to create deposit instruction: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }

        // Send transaction with proper error handling
        let signature: string;
        try {
          // Set fee payer and recent blockhash for simulation
          if (!privyUser || !wallets.length) {
            throw new Error("Wallet not connected for transaction");
          }

          const selectedWallet = wallets[0];
          transaction.feePayer = new PublicKey(selectedWallet.address);
          transaction.recentBlockhash = (
            await connection.getLatestBlockhash()
          ).blockhash;

          // Simulate transaction before sending (best practice)
          try {
            const simulationResult =
              await connection.simulateTransaction(transaction);

            if (simulationResult.value.err) {
              throw new Error(
                `Transaction simulation failed: ${JSON.stringify(simulationResult.value.err)}`
              );
            }
          } catch (error) {
            throw new Error(
              `Transaction simulation error: ${
                error instanceof Error
                  ? error.message
                  : "Unknown simulation error"
              }`
            );
          }

          signature = await sendTransaction(transaction, []);

          if (!signature) {
            throw new Error("Transaction signature is null or undefined");
          }
        } catch (error) {
          // Provide specific error messages for common Solana errors
          let errorMessage = "Transaction failed";

          if (error instanceof Error) {
            const errorStr = error.message.toLowerCase();

            if (errorStr.includes("insufficient funds")) {
              errorMessage = "Insufficient funds for transaction";
            } else if (errorStr.includes("blockhash not found")) {
              errorMessage = "Transaction expired, please try again";
            } else if (errorStr.includes("account not found")) {
              errorMessage = "Required account not found on-chain";
            } else if (errorStr.includes("user rejected")) {
              errorMessage = "Transaction was rejected by user";
            } else if (errorStr.includes("timeout")) {
              errorMessage = "Transaction timed out, please try again";
            } else if (
              errorStr.includes('"custom":6004') ||
              errorStr.includes('{"custom":6004}')
            ) {
              // Handle OnLockPeriod error (Custom:6004)
              errorMessage =
                "Deposits are currently locked. The battle is in progress and deposits are not allowed during this period. Please wait until the battle ends to make deposits.";
            } else {
              errorMessage = `Transaction failed: ${error.message}`;
            }
          }

          // Set error state and return early - don't continue to success logic
          setDepositState({
            isLoading: false,
            error: errorMessage,
            txSignature: null,
          });

          toast.error(`Deposit failed: ${errorMessage}`);
          return { success: false, error: errorMessage };
        }

        // Success: record deposit in backend and set state
        try {
          // Get access token for backend authentication
          const accessToken = await getAccessToken();

          // Use user from useAuth context, fallback to creating user data from privyUser if needed
          let currentUser = user;

          // If user from useAuth is not available yet, try to get/create user using wallet address
          if (!currentUser && privyUser && accessToken) {
            try {
              // Get wallet address from connected wallets
              const connectedWallet = wallets.find((wallet) => wallet.address);
              const walletAddress = connectedWallet?.address;

              if (walletAddress) {
                currentUser = await apiService.getUser(walletAddress);
              }
            } catch (lookupError) {
              console.log(
                "Could not lookup user by wallet address:",
                lookupError
              );
            }
          }

          // Record deposit in backend if we have user and access token
          if (currentUser?.userId && accessToken) {
            try {
              // For now, assume shares_received equals amount (1:1 ratio)
              // In a real implementation, this should be calculated based on vault's share price
              const sharesReceived = amount;

              const depositData = {
                amount: amount,
                shares_received: sharesReceived,
                tx_hash: signature,
              };

              await apiService.recordDeposit(
                currentUser.userId,
                vaultId,
                depositData,
                accessToken
              );
            } catch (backendError) {
              console.error(
                "Failed to record deposit in backend:",
                backendError
              );
            }
          } else {
            console.log("Skipping backend deposit recording:", {
              hasUser: !!currentUser?.userId,
              hasAccessToken: !!accessToken,
            });
          }
        } catch (syncError) {
          console.error("Error during backend sync:", syncError);
          // Don't fail the entire operation if backend sync fails
        }

        setDepositState({
          isLoading: false,
          error: null,
          txSignature: signature,
        });

        // Show success modal instead of toast
        showSuccessModal(signature, "deposit", amount);
        return { success: true, signature };
      } catch (error) {
        console.error("Deposit error details:", error);

        let errorMessage = "Deposit failed";

        if (error instanceof Error) {
          errorMessage = error.message;

          // Provide more user-friendly messages for specific error patterns
          if (
            errorMessage.includes('"Custom":6004') ||
            errorMessage.includes('{"Custom":6004}')
          ) {
            errorMessage =
              "Deposits are currently locked during the battle period. Please wait until the battle ends to make deposits.";
          } else if (errorMessage.includes("OnLockPeriod")) {
            errorMessage =
              "The battle is in a lock period. Deposits are temporarily disabled until the battle phase completes.";
          } else if (errorMessage.includes("Transaction simulation failed")) {
            errorMessage =
              "Transaction validation failed. This might be due to timing restrictions or insufficient permissions.";
          }
        } else if (typeof error === "string") {
          errorMessage = error;
        } else if (error && typeof error === "object" && "message" in error) {
          errorMessage = String(error.message);
        }

        setDepositState({
          isLoading: false,
          error: errorMessage,
          txSignature: null,
        });

        toast.error(`Deposit failed: ${errorMessage}`);
        return { success: false, error: errorMessage };
      }
    },
    [getUserPublicKey, createDepositInstruction, sendTransaction]
  );

  // Withdraw function
  const withdraw = useCallback(
    async (
      vaultId: string,
      amount: number,
      battleAddress?: string
    ): Promise<VaultOperationResult> => {
      try {
        setWithdrawState({ isLoading: true, error: null, txSignature: null });

        const userPubkey = getUserPublicKey();

        // Get vault data to retrieve the actual vault address
        const vaultData = await apiService.getVault(vaultId);

        if (!vaultData || !vaultData.vault_address) {
          throw new Error("Vault not found or vault address is missing");
        }

        if (!vaultData.vault_token_mint || vaultData.vault_token_mint.trim() === "") {
          throw new Error("Vault token mint is missing");
        }

        // Use vault_address instead of vault_id for PublicKey creation
        const vaultPubkey = new PublicKey(vaultData.vault_address);
        const vaultTokenMint = new PublicKey(vaultData.vault_token_mint);
        const amountBigInt = BigInt(Math.floor(amount * 1e6)); // Convert to USDC units (6 decimals)

        // Get battle PDA or use provided address
        let battlePubkey: PublicKey;
        if (battleAddress) {
          battlePubkey = new PublicKey(battleAddress);
        } else if (vaultData.battle_id) {
          // Get battle data to retrieve the actual battle address
          const battleData = await apiService.getBattle(vaultData.battle_id.toString());
          if (!battleData || !battleData.pda_address) {
            throw new Error(`Battle data not found or PDA address missing for battle ID: ${vaultData.battle_id}`);
          }
          battlePubkey = new PublicKey(battleData.pda_address);
        } else {
          const [battlePDA] = await solanaService.getBattlePDA(userPubkey);
          battlePubkey = battlePDA;
        }

        // Build transaction
        const transaction = new Transaction();

        // Check and create vault token account if needed (for user's vault tokens)
        try {
          const depositorVtokenAccount = await getAssociatedTokenAddress(
            vaultTokenMint,
            userPubkey
          );

          const depositorVtokenAccountInfo = await connection.getAccountInfo(depositorVtokenAccount);
          if (!depositorVtokenAccountInfo) {
            transaction.add(
              createAssociatedTokenAccountInstruction(
                userPubkey,
                depositorVtokenAccount,
                userPubkey,
                vaultTokenMint
              )
            );
          }
        } catch (error) {
          throw new Error(
            `Failed to check or create vault token account: ${
              error instanceof Error ? error.message : "Unknown error"
            }`
          );
        }

        // Add withdraw instruction
        const withdrawIx = await createWithdrawInstruction(
          vaultPubkey,
          battlePubkey,
          userPubkey,
          amountBigInt,
          vaultTokenMint
        );

        if (withdrawIx) {
          transaction.add(withdrawIx);
        } else {
          throw new Error("Failed to create withdraw instruction");
        }

        // Send transaction
        const signature = await sendTransaction(transaction);

        // Success: record withdrawal in backend and set state
        // Get access token for backend authentication
        const accessToken = await getAccessToken();

        // Use user from useAuth context, fallback to creating user data from privyUser if needed
        let currentUser = user;

        // If user from useAuth is not available yet, try to get/create user using wallet address
        if (!currentUser && privyUser && accessToken) {
          try {
            // Get wallet address from connected wallets
            const connectedWallet = wallets.find((wallet) => wallet.address);
            const walletAddress = connectedWallet?.address;

            if (walletAddress) {
              currentUser = await apiService.getUser(walletAddress);
            }
          } catch (lookupError) {
            console.log(
              "Could not lookup user by wallet address:",
              lookupError
            );
          }
        }

        // Record withdrawal in backend if we have user and access token
        if (currentUser?.userId && accessToken) {
          try {
            // For now, assume shares_burned equals amount (1:1 ratio)
            // In a real implementation, this should be calculated based on vault's share price
            const sharesBurned = amount;

            const withdrawalData = {
              amount: amount,
              shares_burned: sharesBurned,
              tx_hash: signature,
            };

            await apiService.recordWithdrawal(
              currentUser.userId.toString(),
              vaultId,
              withdrawalData,
              accessToken
            );
          } catch (backendError) {
            console.error("Backend withdrawal recording failed:", backendError);
            
            // Re-throw specific validation errors that should fail the entire operation
            if (backendError instanceof Error) {
              const errorMessage = backendError.message;
              if (
                errorMessage.includes("User vault position not found") ||
                errorMessage.includes("Withdrawals are only allowed after battle completion") ||
                errorMessage.includes("You don't have any open position")
              ) {
                throw backendError;
              }
            }
            
            // For other backend errors, log but don't fail the entire operation
            // since the Solana transaction was successful
            console.warn("Backend sync failed but Solana transaction succeeded:", backendError);
          }
        } else {
          console.log("Skipping backend withdrawal recording:", {
            hasUser: !!currentUser?.userId,
            hasAccessToken: !!accessToken,
          });
        }

        setWithdrawState({
          isLoading: false,
          error: null,
          txSignature: signature,
        });

        // Show success modal instead of toast
        showSuccessModal(signature, "withdraw", amount);
        return { success: true, signature };
      } catch (error) {
        let errorMessage = "Withdrawal failed";

        if (error instanceof Error) {
          errorMessage = error.message;

          // Provide more user-friendly messages for specific error patterns
          if (errorMessage.includes("User vault position not found")) {
            errorMessage = "You don't have any open position in this vault";
          } else if (
            errorMessage.includes(
              "Withdrawals are only allowed after battle completion"
            )
          ) {
            errorMessage =
              "Withdrawals are only allowed after the battle is completed";
          } else if (
            errorMessage.includes("You don't have any open position")
          ) {
            errorMessage = "You don't have any open position in this vault";
          } else if (errorMessage.includes("Vault not found")) {
            errorMessage = "Vault not found or vault address is missing";
          }
        }

        setWithdrawState({
          isLoading: false,
          error: errorMessage,
          txSignature: null,
        });

        toast.error(`Withdrawal failed: ${errorMessage}`);
        return { success: false, error: errorMessage };
      }
    },
    [getUserPublicKey, createWithdrawInstruction, sendTransaction]
  );

  return {
    deposit,
    withdraw,
    depositState,
    withdrawState,
    successModal,
    closeSuccessModal,
    isConnected: authenticated && !!getWalletAddress(),
  };
};
