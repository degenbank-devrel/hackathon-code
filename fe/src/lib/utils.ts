import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format USDC amount with proper currency formatting
 * @param amount - The amount to format
 * @param options - Formatting options
 * @returns Formatted USDC string
 */
export function formatUSDC(
  amount: number | string,
  options: {
    showSymbol?: boolean;
    minimumFractionDigits?: number;
    maximumFractionDigits?: number;
  } = {}
): string {
  const {
    showSymbol = true,
  } = options;

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return showSymbol ? '0.00 USDC' : '0.00';

  // Always use 2 decimal places for USDC
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(numAmount);

  return showSymbol ? `${formatted} USDC` : formatted;
}

/**
 * Format crypto currency amount with trailing zero removal
 * @param amount - The amount to format
 * @param symbol - The currency symbol (e.g., 'SOL', 'ETH')
 * @param options - Formatting options
 * @returns Formatted crypto string
 */
export function formatCrypto(
  amount: number | string,
  symbol: string,
  options: {
    showSymbol?: boolean;
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
  } = {}
): string {
  const {
    showSymbol = true,
    maximumFractionDigits = 8,
    minimumFractionDigits = 0,
  } = options;

  const numAmount = typeof amount === 'string' ? parseFloat(amount) : amount;
  
  if (isNaN(numAmount)) return showSymbol ? `0 ${symbol}` : '0';

  // Format with specified decimal places
  const formatted = new Intl.NumberFormat('en-US', {
    minimumFractionDigits,
    maximumFractionDigits,
  }).format(numAmount);

  // Remove trailing zeros after decimal point
  const cleanFormatted = formatted.replace(/\.?0+$/, '');

  return showSymbol ? `${cleanFormatted} ${symbol}` : cleanFormatted;
}

/**
 * Format currency amount based on type (USDC vs other crypto)
 * @param amount - The amount to format
 * @param currency - The currency type ('USDC' or other)
 * @param options - Formatting options
 * @returns Formatted currency string
 */
export function formatCurrency(
  amount: number | string,
  currency: string,
  options: {
    showSymbol?: boolean;
    maximumFractionDigits?: number;
    minimumFractionDigits?: number;
  } = {}
): string {
  if (currency.toUpperCase() === 'USDC') {
    return formatUSDC(amount, options);
  }
  
  return formatCrypto(amount, currency, options);
}

/**
 * Parse formatted currency string back to number
 * @param formattedAmount - The formatted currency string
 * @returns Parsed number or 0 if invalid
 */
export function parseCurrency(formattedAmount: string): number {
  if (!formattedAmount) return 0;
  
  // Remove currency symbols, commas, and spaces
  const cleaned = formattedAmount
    .replace(/[$,\s]/g, '')
    .replace(/[A-Za-z]/g, '')
    .trim();
  
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
