"use client";

import * as React from "react";
import { CheckCircle, ExternalLink, Copy } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "./dialog";
import { Button } from "./button";
import { toast } from "sonner";

interface TransactionSuccessModalProps {
  isOpen: boolean;
  onClose: () => void;
  txSignature: string;
  transactionType: "deposit" | "withdraw";
  amount?: number;
}

export function TransactionSuccessModal({
  isOpen,
  onClose,
  txSignature,
  transactionType,
  amount,
}: TransactionSuccessModalProps) {
  // Get network from environment
  const network = process.env.NEXT_PUBLIC_SOLANA_NETWORK || "devnet";

  // Determine Solscan URL based on network
  const getSolscanUrl = (signature: string) => {
    const baseUrl = "https://solscan.io";

    if (network === "mainnet") {
      return `${baseUrl}/tx/${signature}`;
    } else if (network === "devnet") {
      return `${baseUrl}/tx/${signature}?cluster=devnet`;
    } else {
      // For development, use devnet
      return `${baseUrl}/tx/${signature}?cluster=devnet`;
    }
  };

  // Copy transaction signature to clipboard
  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(txSignature);
      toast.success("Transaction signature copied to clipboard!");
    } catch (error) {
      toast.error("Failed to copy to clipboard");
    }
  };

  // Open Solscan in new tab
  const openSolscan = () => {
    window.open(getSolscanUrl(txSignature), "_blank", "noopener,noreferrer");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="rounded-none border-neutral-900 bg-black sm:max-w-md">
        <DialogHeader className="text-center">
          <div className="bg-primary mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full">
            <CheckCircle className="h-6 w-6 text-black" />
          </div>
          <DialogTitle className="text-xl font-semibold text-white">
            {transactionType === "deposit" ? "Deposit" : "Withdrawal"}{" "}
            Successful!
          </DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Your {transactionType} transaction has been completed successfully.
            {amount && (
              <span className="mt-1 block font-medium text-white">
                Amount: {amount.toLocaleString()} USDC
              </span>
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          {/* Transaction Signature Display */}
          <div className="border border-neutral-600 bg-black p-4">
            <div className="flex items-center justify-between">
              <div className="flex-1">
                <p className="mb-1 text-sm font-medium text-white">
                  Transaction Signature
                </p>
                <p className="font-mono text-xs break-all text-gray-300">
                  {txSignature}
                </p>
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={copyToClipboard}
                className="ml-2 h-8 w-8 cursor-pointer p-0"
              >
                <Copy className="h-3 w-3" />
                <span className="sr-only">Copy signature</span>
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col gap-2 sm:flex-row">
            <Button
              onClick={openSolscan}
              className="hover:bg-primary flex-1 cursor-pointer border bg-transparent text-white"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              View on Solscan
            </Button>
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1 cursor-pointer bg-transparent hover:bg-neutral-900/20 hover:text-white"
            >
              Close
            </Button>
          </div>

          {/* Network Info */}
          <div className="text-center">
            <p className="text-muted-foreground text-xs">
              Network:{" "}
              {network === "mainnet"
                ? "Mainnet"
                : network === "devnet"
                  ? "Devnet"
                  : "Development"}
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
