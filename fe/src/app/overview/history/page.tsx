"use client";

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useUserTxHistory } from "@/hooks/useUserTxHistory";
import {
  ArrowUpIcon,
  PlusIcon,
  MinusIcon,
  ArrowPathIcon,
} from "@heroicons/react/24/outline";
import { Copy, ExternalLink } from "lucide-react";
import { toast } from "sonner";
import Link from "next/link";
import { useState, useMemo } from "react";

export default function HistoryPage() {
  const { authenticated, login, user } = useAuth();
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  // Get network configuration for Solscan links
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";
  const solscanCluster = network === "devnet" ? "?cluster=devnet" : "";

  // Fetch user transaction history
  const { history, loading, error, refetch } = useUserTxHistory({
    userId: user?.userId?.toString() || null,
    limit: 100, // Get more data for transaction history
  });

  // Use transaction history data directly
  const transactionHistory = useMemo(() => {
    if (!history || history.length === 0) return [];

    // Transform UserTxHistory to display format
    return history.map((tx) => ({
      id: tx.tx_id,
      type: tx.tx_type,
      vault: tx.vault?.vault_name || "Unknown Vault",
      vaultImage: tx.vault?.vault_image || "",
      amount: parseFloat(tx.amount),
      fee: parseFloat(tx.fee) / 1_000_000_000, // Convert lamports to SOL
      timestamp: tx.transactionDate,
      status: "completed" as const,
      hash: tx.tx_id.slice(0, 10) + "...", // Use tx_id as hash display
      hashFull: tx.tx_id, // Full transaction ID
      // For now, we don't have PnL data in transaction history
      // This could be calculated separately or added to the backend
      pnl: 0,
      pnlPercentage: 0,
    }));
  }, [history]);

  const formatCurrency = (amount: number) => {
    // USDC uses 6 decimal places precision
    // For display purposes, we show different decimal places based on amount size
    // to maintain readability while preserving precision for small amounts
    let maximumFractionDigits = 6;
    let minimumFractionDigits = 2;

    // For very small amounts (< 0.01), show up to 6 decimals to preserve precision
    if (amount < 0.01) {
      maximumFractionDigits = 6;
      minimumFractionDigits = 0; // Don't force trailing zeros for very small amounts
    }
    // For small amounts (< 1), show up to 4 decimals
    else if (amount < 1) {
      maximumFractionDigits = 4;
      minimumFractionDigits = 2;
    }
    // For medium amounts (< 1000), show up to 2 decimals
    else if (amount < 1000) {
      maximumFractionDigits = 2;
      minimumFractionDigits = 2;
    }
    // For large amounts, show 2 decimals
    else {
      maximumFractionDigits = 2;
      minimumFractionDigits = 2;
    }

    // Format as number with USDC suffix instead of using currency formatter
    const formattedNumber = new Intl.NumberFormat("en-US", {
      minimumFractionDigits,
      maximumFractionDigits,
    }).format(amount);

    return `${formattedNumber} USDC`;
  };

  const formatSOL = (lamports: number) => {
    // Convert lamports to SOL (1 SOL = 1,000,000,000 lamports)
    const sol = lamports / 1_000_000_000;
    return (
      new Intl.NumberFormat("en-US", {
        minimumFractionDigits: 4,
        maximumFractionDigits: 9,
      }).format(sol) + " SOL"
    );
  };

  const formatDateTime = (timestamp: string) => {
    return new Date(timestamp).toLocaleString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case "deposit":
        return <PlusIcon className="h-4 w-4 text-green-400" />;
      case "withdrawal":
        return <MinusIcon className="h-4 w-4 text-red-400" />;
      case "reinvest":
        return <ArrowPathIcon className="h-4 w-4 text-blue-400" />;
      default:
        return <ArrowUpIcon className="h-4 w-4 text-gray-400" />;
    }
  };

  const truncateHash = (hash: string) => {
    return `${hash.slice(0, 6)}...${hash.slice(-4)}`;
  };

  const copyToClipboard = async (hash: string) => {
    try {
      await navigator.clipboard.writeText(hash);
      setCopiedHash(hash);
      toast.success("Transaction hash copied to clipboard!");
      setTimeout(() => setCopiedHash(null), 2000);
    } catch (error) {
      toast.error("Failed to copy transaction hash");
    }
  };

  // Pagination logic
  const totalPages = Math.ceil(transactionHistory.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentTransactions = transactionHistory.slice(startIndex, endIndex);

  if (!authenticated) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mx-auto max-w-md text-center">
          <Card>
            <CardHeader>
              <CardTitle>Connect Your Wallet</CardTitle>
              <CardDescription>
                You need to connect your wallet to view your transaction history
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={login}
                className="bg-primary hover:bg-primary/90 w-full text-black"
              >
                Connect Wallet
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Loading state
  if (loading) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mx-auto max-w-md text-center">
          <Card>
            <CardHeader>
              <CardTitle>Loading Transaction History</CardTitle>
              <CardDescription>
                Please wait while we fetch your transaction data...
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center">
                <ArrowPathIcon className="text-primary h-8 w-8 animate-spin" />
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-8">
        <div className="mx-auto max-w-md text-center">
          <Card>
            <CardHeader>
              <CardTitle>Error Loading Data</CardTitle>
              <CardDescription>
                Failed to load your transaction history. Please try again.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Button
                onClick={() => refetch()}
                className="bg-primary hover:bg-primary/90 w-full text-black"
              >
                Retry
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  const totalDeposits = transactionHistory
    .filter((tx) => tx.type === "deposit" && tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalWithdrawals = transactionHistory
    .filter((tx) => tx.type === "withdrawal" && tx.status === "completed")
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalFees = transactionHistory
    .filter((tx) => tx.status === "completed")
    .reduce((sum, tx) => sum + tx.fee, 0);

  return (
    <div className="mx-auto max-w-7xl space-y-6 px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Transaction History</h1>
          <p className="text-muted-foreground">
            Complete record of your vault transactions
          </p>
        </div>
        <Link href="/overview">
          <Button variant="outline" className="cursor-pointer">
            Back to Overview
          </Button>
        </Link>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
        <Card className="bg-card border-border rounded-none">
          <CardHeader className="pb-2">
            <CardDescription>Total Deposits</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-profit text-xl font-bold">
              {formatCurrency(totalDeposits)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-none">
          <CardHeader className="pb-2">
            <CardDescription>Total Withdrawals</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-loss text-xl font-bold">
              {formatCurrency(totalWithdrawals)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-none">
          <CardHeader className="pb-2">
            <CardDescription>Total Fees Paid</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">
              {formatSOL(totalFees * 1_000_000_000)}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-card border-border rounded-none">
          <CardHeader className="pb-2">
            <CardDescription>Total Transactions</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-white">
              {transactionHistory.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Transaction History Table */}
      <Card className="bg-card border-border rounded-none">
        <CardHeader>
          <CardTitle>Transaction Details</CardTitle>
          <CardDescription>
            Chronological list of all your vault transactions
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-border border-b">
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                    Type
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                    Vault
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-sm font-medium">
                    Amount
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-sm font-medium">
                    PnL
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-right text-sm font-medium">
                    Fee
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-left text-sm font-medium">
                    Transaction Hash
                  </th>
                  <th className="text-muted-foreground px-4 py-3 text-center text-sm font-medium">
                    Date & Time
                  </th>
                </tr>
              </thead>
              <tbody>
                {currentTransactions.map((transaction) => (
                  <tr
                    key={transaction.id}
                    className="border-border/50 hover:bg-muted/5 border-b"
                  >
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        {getTransactionIcon(transaction.type)}
                        <span className="text-sm font-medium text-white capitalize">
                          {transaction.type}
                        </span>
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="text-sm text-white">
                        {transaction.vault}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div
                        className={`text-sm font-medium ${
                          transaction.type === "deposit"
                            ? "text-profit"
                            : "text-loss"
                        }`}
                      >
                        {formatCurrency(transaction.amount)}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-muted-foreground text-sm font-medium">
                        {transaction.type === "deposit" ? (
                          "-"
                        ) : (
                          <span
                            className={
                              transaction.pnl >= 0 ? "text-profit" : "text-loss"
                            }
                          >
                            {transaction.pnl >= 0 ? "+" : ""}
                            {formatCurrency(transaction.pnl)}
                            <span className="ml-1 text-xs">
                              ({transaction.pnlPercentage >= 0 ? "+" : ""}
                              {transaction.pnlPercentage.toFixed(1)}%)
                            </span>
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-4 text-right">
                      <div className="text-muted-foreground text-sm">
                        {!transaction.fee || transaction.fee === 0
                          ? "-"
                          : formatSOL(transaction.fee * 1_000_000_000)}
                      </div>
                    </td>
                    <td className="px-4 py-4">
                      <div className="flex items-center space-x-2">
                        <div className="text-muted-foreground font-mono text-xs">
                          {truncateHash(transaction.hash)}
                        </div>
                        <button
                          onClick={() => copyToClipboard(transaction.hashFull)}
                          className="hover:bg-muted/20 cursor-pointer rounded p-1 transition-colors"
                          title="Copy transaction hash"
                        >
                          <Copy className="text-muted-foreground h-3 w-3 hover:text-white" />
                        </button>
                        <a
                          href={`https://solscan.io/tx/${transaction.hashFull}${solscanCluster}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="hover:bg-muted/20 cursor-pointer rounded p-1 transition-colors"
                          title="View on Solscan"
                        >
                          <ExternalLink className="text-muted-foreground h-3 w-3 hover:text-white" />
                        </a>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-center">
                      <div className="text-muted-foreground text-xs">
                        {formatDateTime(transaction.timestamp)}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="border-border/50 flex items-center justify-between border-t px-6 py-4">
            <div className="text-muted-foreground text-sm">
              Showing {startIndex + 1} to{" "}
              {Math.min(endIndex, transactionHistory.length)} of{" "}
              {transactionHistory.length} transactions
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="border-border/50 hover:bg-muted/20 cursor-pointer border px-3 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Previous
              </button>
              <div className="flex items-center space-x-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                  (page) => (
                    <button
                      key={page}
                      onClick={() => setCurrentPage(page)}
                      className={`border-border/50 cursor-pointer border px-3 py-1 text-sm transition-colors ${
                        currentPage === page
                          ? "bg-primary text-primary-foreground"
                          : "hover:bg-muted/20"
                      }`}
                    >
                      {page}
                    </button>
                  )
                )}
              </div>
              <button
                onClick={() =>
                  setCurrentPage((prev) => Math.min(prev + 1, totalPages))
                }
                disabled={currentPage === totalPages}
                className="border-border/50 hover:bg-muted/20 cursor-pointer border px-3 py-1 text-sm transition-colors disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
