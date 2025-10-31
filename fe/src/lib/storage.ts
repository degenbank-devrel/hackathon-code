/**
 * Storage utilities for safely handling localStorage and cookies
 * Prevents SSR errors by checking if we're in browser environment
 */

// Check if we're in browser environment
const isBrowser = typeof window !== 'undefined';

/**
 * Safely clear all localStorage data
 */
export const clearLocalStorage = (): void => {
  if (!isBrowser) return;
  
  try {
    localStorage.clear();
  } catch (error) {
    console.warn('Failed to clear localStorage:', error);
  }
};

/**
 * Safely remove specific localStorage items
 */
export const removeLocalStorageItems = (keys: string[]): void => {
  if (!isBrowser) return;
  
  try {
    keys.forEach(key => {
      localStorage.removeItem(key);
    });
  } catch (error) {
    console.warn('Failed to remove localStorage items:', error);
  }
};

/**
 * Safely clear all cookies
 */
export const clearAllCookies = (): void => {
  if (!isBrowser) return;
  
  try {
    // Get all cookies
    const cookies = document.cookie.split(';');
    
    // Clear each cookie
    cookies.forEach(cookie => {
      const eqPos = cookie.indexOf('=');
      const name = eqPos > -1 ? cookie.substr(0, eqPos).trim() : cookie.trim();
      
      if (name) {
        // Clear cookie for current domain
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/`;
        // Clear cookie for parent domain
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=${window.location.hostname}`;
        // Clear cookie for parent domain with dot prefix
        document.cookie = `${name}=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/;domain=.${window.location.hostname}`;
      }
    });
  } catch (error) {
    console.warn('Failed to clear cookies:', error);
  }
};

/**
 * Clear all Privy-related data from localStorage
 */
export const clearPrivyData = (): void => {
  if (!isBrowser) return;
  
  try {
    // Get all localStorage keys
    const keys = Object.keys(localStorage);
    
    // Filter Privy-related keys
    const privyKeys = keys.filter(key => 
      key.includes('privy') || 
      key.includes('Privy') || 
      key.includes('PRIVY') ||
      key.includes('wallet') ||
      key.includes('Wallet') ||
      key.includes('WALLET')
    );
    
    // Remove Privy-related keys
    privyKeys.forEach(key => {
      localStorage.removeItem(key);
    });
    
    console.log('Cleared Privy-related localStorage keys:', privyKeys);
  } catch (error) {
    console.warn('Failed to clear Privy data:', error);
  }
};

/**
 * Clear specific wallet data including the Phantom wallet data
 */
export const clearWalletData = (): void => {
  if (!isBrowser) return;
  
  try {
    // Specific keys to remove
    const walletKeys = [
      // Phantom wallet specific
      'phantom',
      'phantom-wallet',
      'phantom_wallet',
      'solana-wallet',
      'solana_wallet',
      
      // Other wallet keys
      'solflare',
      'backpack',
      'coinbase_wallet',
      'wallet_connect',
      'walletconnect',
      
      // Generic wallet storage
      'connected-wallets',
      'wallet-adapter',
      'wallet_adapter',
      'solana-wallets',
      'solana_wallets',
    ];
    
    // Remove specific wallet keys
    removeLocalStorageItems(walletKeys);
    
    // Also check for any keys that might contain wallet data
    const allKeys = Object.keys(localStorage);
    const additionalWalletKeys = allKeys.filter(key => {
      const lowerKey = key.toLowerCase();
      return (
        lowerKey.includes('phantom') ||
        lowerKey.includes('solflare') ||
        lowerKey.includes('backpack') ||
        lowerKey.includes('coinbase') ||
        lowerKey.includes('wallet') ||
        lowerKey.includes('adapter') ||
        lowerKey.includes('connector')
      );
    });
    
    // Remove additional wallet keys
    removeLocalStorageItems(additionalWalletKeys);
    
    console.log('Cleared wallet-related localStorage keys:', [...walletKeys, ...additionalWalletKeys]);
  } catch (error) {
    console.warn('Failed to clear wallet data:', error);
  }
};

/**
 * Clear specific Phantom wallet data that matches the user's example
 * This targets the exact data structure mentioned by the user
 */
export const clearPhantomWalletData = (): void => {
  if (!isBrowser) return;
  
  try {
    // Get all localStorage keys
    const allKeys = Object.keys(localStorage);
    
    // Look for keys that might contain the Phantom wallet data structure
    const phantomDataKeys = allKeys.filter(key => {
      try {
        const value = localStorage.getItem(key);
        if (!value) return false;
        
        // Try to parse as JSON
        const parsed = JSON.parse(value);
        
        // Check if it's an array with wallet data structure
        if (Array.isArray(parsed)) {
          return parsed.some(item => 
            item && 
            typeof item === 'object' &&
            (item.address === '96ojiPJ4u2WVB1cVGmaHvtMh1btAKuh5USz5PiCcM7SW' ||
             item.walletClientType === 'Phantom' ||
             item.connectorType === 'solana_adapter' ||
             item.id === 'Phantom')
          );
        }
        
        // Check if it's a single object with wallet data structure
        if (parsed && typeof parsed === 'object') {
          return (
            parsed.address === '96ojiPJ4u2WVB1cVGmaHvtMh1btAKuh5USz5PiCcM7SW' ||
            parsed.walletClientType === 'Phantom' ||
            parsed.connectorType === 'solana_adapter' ||
            parsed.id === 'Phantom'
          );
        }
        
        return false;
      } catch {
        // If it's not JSON, check if it contains the wallet address
        const value = localStorage.getItem(key);
        return value && (
          value.includes('96ojiPJ4u2WVB1cVGmaHvtMh1btAKuh5USz5PiCcM7SW') ||
          value.includes('Phantom') ||
          value.includes('solana_adapter')
        );
      }
    });
    
    // Remove keys that contain Phantom wallet data
    removeLocalStorageItems(phantomDataKeys);
    
    console.log('Cleared Phantom wallet data from keys:', phantomDataKeys);
  } catch (error) {
    console.warn('Failed to clear Phantom wallet data:', error);
  }
};

/**
 * Comprehensive cleanup function for logout
 * Clears all Privy, wallet, and authentication-related data
 */
export const performLogoutCleanup = (): void => {
  if (!isBrowser) return;
  
  try {
    console.log('Starting comprehensive logout cleanup...');
    
    // Clear Privy-specific data
    clearPrivyData();
    
    // Clear wallet-specific data
    clearWalletData();
    
    // Clear specific Phantom wallet data
    clearPhantomWalletData();
    
    // Clear all cookies
    clearAllCookies();
    
    // Clear any remaining authentication-related localStorage items
    const authKeys = [
      'auth',
      'token',
      'access_token',
      'refresh_token',
      'session',
      'user',
      'profile',
    ];
    
    removeLocalStorageItems(authKeys);
    
    console.log('Logout cleanup completed successfully');
  } catch (error) {
    console.error('Error during logout cleanup:', error);
  }
};

/**
 * Get all localStorage keys for debugging
 */
export const getLocalStorageKeys = (): string[] => {
  if (!isBrowser) return [];
  
  try {
    return Object.keys(localStorage);
  } catch (error) {
    console.warn('Failed to get localStorage keys:', error);
    return [];
  }
};