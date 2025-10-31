import { useState, useEffect, useCallback } from 'react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { PublicKey } from '@solana/web3.js';
import { getAssociatedTokenAddress, getAccount } from '@solana/spl-token';
import { connection, TOKEN_MINT, TOKEN_SYMBOL } from '@/lib/solana';

// Helper function to validate Solana address
const isSolanaAddress = (address: string): boolean => {
  try {
    // Solana addresses are base58 encoded and typically 32-44 characters long
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  } catch {
    return false;
  }
};

export const useTokenBalance = () => {
  const { authenticated, user: privyUser, ready } = usePrivy();
  const { wallets } = useWallets();
  const [balance, setBalance] = useState<number>(0);
  const [isLoading, setIsLoading] = useState(true); // Start with loading true
  const [error, setError] = useState<string | null>(null);

  // Get wallet address using the same logic as useAuth
  const getWalletAddress = useCallback(() => {
    if (!privyUser) return null;
    
    // First, check for Solana wallets in external wallets
    const solanaWallet = wallets.find(wallet => 
      wallet.walletClientType === 'phantom' || 
      wallet.walletClientType === 'solflare' ||
      wallet.walletClientType === 'backpack' ||
      wallet.walletClientType === 'coinbase_wallet'
    );
    
    if (solanaWallet && isSolanaAddress(solanaWallet.address)) {
      return solanaWallet.address;
    }
    
    // Check for embedded Solana wallet in linked accounts
    const embeddedSolanaWallet = privyUser.linkedAccounts.find(
      account => account.type === 'wallet' && 
      account.walletClientType === 'privy'
    );
    
    if (embeddedSolanaWallet && 'address' in embeddedSolanaWallet && 
        isSolanaAddress(embeddedSolanaWallet.address)) {
      return embeddedSolanaWallet.address;
    }
    
    // Fallback to any embedded wallet (validate it's Solana)
    const embeddedWallet = privyUser.linkedAccounts.find(
      account => account.type === 'wallet'
    );
    
    if (embeddedWallet && 'address' in embeddedWallet && 
        isSolanaAddress(embeddedWallet.address)) {
      return embeddedWallet.address;
    }
    
    // Fallback to any external wallet (validate it's Solana)
    const validSolanaWallet = wallets.find(wallet => isSolanaAddress(wallet.address));
    if (validSolanaWallet) {
      return validSolanaWallet.address;
    }
    
    return null;
  }, [privyUser, wallets]);

  const fetchBalance = useCallback(async () => {
    if (!authenticated || !ready) {
      setBalance(0);
      setIsLoading(false);
      return;
    }

    const walletAddress = getWalletAddress();
    
    if (!walletAddress) {
      setBalance(0);
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const userPublicKey = new PublicKey(walletAddress);
      
      // Get USDC token account balance
      try {
        const tokenAccount = await getAssociatedTokenAddress(
          TOKEN_MINT,
          userPublicKey
        );
        
        // Check if token account exists
        const tokenAccountInfo = await connection.getAccountInfo(tokenAccount);
        
        if (!tokenAccountInfo) {
          setBalance(0);
        } else {
          const accountInfo = await getAccount(connection, tokenAccount);
          
          // USDC has 6 decimals
          const tokenBalance = Number(accountInfo.amount) / Math.pow(10, 6);
          setBalance(tokenBalance);
        }
      } catch (accountError) {
        // Token account doesn't exist, balance is 0
        setBalance(0);
      }
    } catch (err) {
      setError('Failed to fetch balance');
      setBalance(0);
    } finally {
      setIsLoading(false);
    }
  }, [authenticated, ready, getWalletAddress]);

  // Fetch balance when ready and authenticated
  useEffect(() => {
    if (ready) {
      fetchBalance();
    }
  }, [ready, fetchBalance]);

  // Refresh balance every 30 seconds when authenticated
  useEffect(() => {
    if (!authenticated || !ready) return;

    const interval = setInterval(fetchBalance, 30000);
    return () => clearInterval(interval);
  }, [authenticated, ready, fetchBalance]);

  return {
    balance,
    isLoading,
    error,
    refetch: fetchBalance,
    tokenSymbol: TOKEN_SYMBOL,
  };
};