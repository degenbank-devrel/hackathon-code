"use client";

import { usePrivy, useWallets } from "@privy-io/react-auth";
import { useEffect, useState, useCallback, useRef } from "react";
import { apiService, type User } from "@/lib/api";
import { toast } from "sonner";
import { performLogoutCleanup } from "@/lib/storage";

// Helper function to validate Solana address
const isSolanaAddress = (address: string): boolean => {
  try {
    // Solana addresses are base58 encoded and typically 32-44 characters long
    // This is a basic validation - you might want to use a more robust check
    return /^[1-9A-HJ-NP-Za-km-z]{32,44}$/.test(address);
  } catch {
    return false;
  }
};

export function useAuth() {
  const {
    ready,
    authenticated,
    user: privyUser,
    login,
    logout: privyLogout,
    getAccessToken,
  } = usePrivy();

  const { wallets } = useWallets();

  // Flag to prevent multiple sync requests
  const [isSyncing, setIsSyncing] = useState(false);
  const syncTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // Get wallet address from Privy user (prioritize Solana wallets)
  const getWalletAddress = useCallback(() => {
    if (!privyUser) return null;

    // First, check for Solana wallets in external wallets
    const solanaWallet = wallets.find(
      (wallet) =>
        wallet.walletClientType === "phantom" ||
        wallet.walletClientType === "solflare" ||
        wallet.walletClientType === "backpack" ||
        wallet.walletClientType === "coinbase_wallet"
    );

    if (solanaWallet && isSolanaAddress(solanaWallet.address)) {
      return solanaWallet.address;
    }

    // Check for embedded Solana wallet in linked accounts
    const embeddedSolanaWallet = privyUser.linkedAccounts.find(
      (account) =>
        account.type === "wallet" && account.walletClientType === "privy"
    );

    if (
      embeddedSolanaWallet &&
      "address" in embeddedSolanaWallet &&
      isSolanaAddress(embeddedSolanaWallet.address)
    ) {
      return embeddedSolanaWallet.address;
    }

    // Fallback to any embedded wallet (validate it's Solana)
    const embeddedWallet = privyUser.linkedAccounts.find(
      (account) => account.type === "wallet"
    );

    if (
      embeddedWallet &&
      "address" in embeddedWallet &&
      isSolanaAddress(embeddedWallet.address)
    ) {
      return embeddedWallet.address;
    }

    // Fallback to any external wallet (validate it's Solana)
    const validSolanaWallet = wallets.find((wallet) =>
      isSolanaAddress(wallet.address)
    );
    if (validSolanaWallet) {
      return validSolanaWallet.address;
    }

    return null;
  }, [privyUser, wallets]);

  // Get user image from Google account or default
  const getUserImage = useCallback((): string => {
    if (!privyUser) return "https://via.placeholder.com/150";

    const googleAccount = privyUser.linkedAccounts.find(
      (account) => account.type === "google_oauth"
    );

    if (
      googleAccount &&
      "picture" in googleAccount &&
      typeof googleAccount.picture === "string"
    ) {
      return googleAccount.picture;
    }

    return "https://via.placeholder.com/150";
  }, [privyUser]);

  // Get user name from Google account or wallet
  const getUserName = useCallback(() => {
    if (!privyUser) return "Anonymous User";

    const googleAccount = privyUser.linkedAccounts.find(
      (account) => account.type === "google_oauth"
    );

    if (googleAccount && "name" in googleAccount && googleAccount.name) {
      return googleAccount.name;
    }

    // Fallback to wallet address if no Google name
    const walletAddress = getWalletAddress();
    if (walletAddress) {
      return `${walletAddress.slice(0, 6)}...${walletAddress.slice(-4)}`;
    }

    return "Anonymous User";
  }, [privyUser, getWalletAddress]);

  // Get user email from Google OAuth or Privy email
  const getUserEmail = useCallback(() => {
    if (!privyUser) return undefined;

    // First, try to get email from Google OAuth account
    const googleAccount = privyUser.linkedAccounts.find(
      (account) => account.type === "google_oauth"
    );

    if (googleAccount && "email" in googleAccount && googleAccount.email) {
      return googleAccount.email;
    }

    // Fallback to Privy email
    return privyUser.email?.address || undefined;
  }, [privyUser]);

  // Sync user with backend
  const syncWithBackend = useCallback(async () => {
    if (!privyUser || !ready || !authenticated || isSyncing) {
      console.log("Sync conditions not met:", { privyUser: !!privyUser, ready, authenticated, isSyncing });
      return;
    }

    // Clear any existing timeout
    if (syncTimeoutRef.current) {
      clearTimeout(syncTimeoutRef.current);
    }

    // Debounce the sync operation
    syncTimeoutRef.current = setTimeout(async () => {
      if (isSyncing) return; // Double check to prevent race conditions

      try {
        setIsSyncing(true);
        setLoading(true);

        const walletAddress = getWalletAddress();
        if (!walletAddress) {
          console.error("No valid Solana wallet address found");
          toast.error("Please connect a valid Solana wallet");
          return;
        }

        if (!isSolanaAddress(walletAddress)) {
          console.error("Invalid Solana wallet address format:", walletAddress);
          toast.error("Invalid Solana wallet address format");
          return;
        }

        // First try to get existing user
        const existingUser = await apiService.getUser(walletAddress);
        if (existingUser) {
          setUser(existingUser);
          return;
        }

        // If user doesn't exist, create new user
        let accessToken: string | null = null;
        try {
          accessToken = await getAccessToken();
        } catch (error) {
          console.error("Failed to get access token:", error);
          toast.error("Authentication failed. Please try logging in again.");
          return;
        }

        if (!accessToken) {
          console.error("No access token available - user may not be fully authenticated");
          toast.error("Authentication required. Please log in again.");
          return;
        }

        const userData = {
          fullname: getUserName(),
          privyId: privyUser.id,
          walletAddress,
          email: getUserEmail(),
          image: getUserImage(),
        };

        const createdUser = await apiService.createUser(userData, accessToken);
        setUser(createdUser);
      } catch (error) {
        console.error("Failed to sync user with backend:", error);
        if (
          error instanceof Error &&
          error.message.includes("User already exists")
        ) {
          // User already exists, fetch the existing user
          try {
            const currentWalletAddress = getWalletAddress();
            if (currentWalletAddress) {
              const existingUser = await apiService.getUser(currentWalletAddress);
              if (existingUser) {
                setUser(existingUser);
              }
            }
          } catch (fetchError) {
            console.error("Failed to fetch existing user:", fetchError);
            toast.error("Failed to fetch user data");
          }
        } else {
          toast.error("Failed to sync user data");
        }
      } finally {
        setLoading(false);
        setIsSyncing(false);
      }
    }, 500); // 500ms debounce delay
  }, [
    privyUser,
    ready,
    authenticated,
    isSyncing,
    getAccessToken,
    getWalletAddress,
    getUserName,
    getUserEmail,
    getUserImage,
  ]);

  // Handle authentication state changes
  useEffect(() => {
    if (ready && authenticated && privyUser && !isLoggingOut && !user && !isSyncing) {
      // Only sync when user is null and not already syncing to avoid infinite calls
      // Add a small delay to ensure Privy is fully ready
      const timer = setTimeout(() => {
        syncWithBackend();
      }, 100);
      
      return () => clearTimeout(timer);
    } else if (ready && !authenticated && !isLoggingOut) {
      setUser(null);
    }

    // Cleanup timeout on unmount
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
      }
    };
  }, [ready, authenticated, privyUser, isLoggingOut, user, isSyncing]);

  const logout = async () => {
    setIsLoggingOut(true);

    try {
      // Clear local React state first
      setUser(null);
      setLoading(false);

      // Perform comprehensive cleanup of localStorage and cookies
      performLogoutCleanup();

      // Logout from Privy (this should be done after our cleanup)
      await privyLogout();

      // Additional cleanup after Privy logout in case Privy adds new data
      setTimeout(() => {
        performLogoutCleanup();
      }, 100);

      toast.success("Logged out successfully");
    } catch (error) {
      console.error("Logout error:", error);

      // Even if logout fails, still clear local data
      setUser(null);
      setLoading(false);

      // Ensure cleanup happens even on error
      performLogoutCleanup();

      toast.error("Logout completed with some errors");
    } finally {
      setIsLoggingOut(false);
    }
  };

  return {
    // Authentication state
    ready,
    authenticated,
    user,
    loading: loading || isSyncing,

    // User info helpers
    walletAddress: getWalletAddress(),
    userName: getUserName(),
    userImage: getUserImage(),

    // Actions
    login,
    logout,

    // Sync state
    isSyncing,

    // Privy user and wallets for advanced usage
    privyUser,
    wallets,
  };
}
