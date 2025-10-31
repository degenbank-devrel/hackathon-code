"use client";

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { UsdcIconSvg } from "@/components/svg";
import { formatUSDC } from "@/lib/utils";
import { Battle } from "@/lib/api";
import { VaultWithMetrics } from "@/hooks/useVaults";

interface DepositWithdrawPanelProps {
  depositWithdrawTab: "deposit" | "withdraw";
  setDepositWithdrawTab: (tab: "deposit" | "withdraw") => void;
  amount: string;
  handleAmountChange: (value: string) => void;
  handleMaxClick: () => void;
  getMaxAmountDisplay?: () => string;
  balance: number;
  balanceLoading: boolean;
  tokenSymbol: string;
  isConnected: boolean;
  login: () => void;
  handleDeposit: () => void;
  handleWithdraw: () => void;
  isAmountValid: () => boolean;
  depositState: { isLoading: boolean; error?: string | null };
  withdrawState: { isLoading: boolean; error?: string | null };
  isDepositAllowed?: () => boolean;
  isWithdrawAllowed?: () => boolean;
  getPhaseRestrictionMessage?: (action: "deposit" | "withdraw") => string;
  battleData?: Battle | null;
  vaultData?: VaultWithMetrics;
  error?: string | null;
}

export function DepositWithdrawPanel({
  depositWithdrawTab,
  setDepositWithdrawTab,
  amount,
  handleAmountChange,
  handleMaxClick,
  getMaxAmountDisplay,
  balance,
  balanceLoading,
  tokenSymbol,
  isConnected,
  login,
  handleDeposit,
  handleWithdraw,
  isAmountValid,
  depositState,
  withdrawState,
  isDepositAllowed,
  isWithdrawAllowed,
  getPhaseRestrictionMessage,
  battleData,
  vaultData,
  error,
}: DepositWithdrawPanelProps) {
  return (
    <Card className="bg-card border-border rounded-none">
      <CardContent className="p-6">
        {/* Tab Buttons */}
        <div className="mb-6 flex">
          <button
            onClick={() => setDepositWithdrawTab("deposit")}
            className={`flex-1 cursor-pointer px-4 py-2 text-sm font-medium ${
              depositWithdrawTab === "deposit"
                ? "bg-profit text-black"
                : "text-muted-foreground bg-transparent hover:text-white"
            }`}
          >
            Deposit
          </button>
          <button
            onClick={() => setDepositWithdrawTab("withdraw")}
            className={`flex-1 cursor-pointer px-4 py-2 text-sm font-medium ${
              depositWithdrawTab === "withdraw"
                ? "bg-loss text-white"
                : "text-muted-foreground bg-transparent hover:text-white"
            }`}
          >
            Withdraw
          </button>
        </div>

        {/* Description */}
        <p className="text-muted-foreground mb-6 text-xs">
          {depositWithdrawTab === "deposit"
            ? "Deposited funds are subject to a 1 day redemption period."
            : "After the 1 day redemption period, your funds can be withdrawn to your wallet.\n\nThe maximum withdrawal amount is based on share value at request time, though the final amount may be lower."}
        </p>

        {/* Check if action is allowed based on battle phase */}
        {(depositWithdrawTab === "deposit" &&
          isDepositAllowed &&
          !isDepositAllowed()) ||
        (depositWithdrawTab === "withdraw" &&
          isWithdrawAllowed &&
          !isWithdrawAllowed()) ? (
          /* Phase Restriction Message */
          <div className="mb-6 border border-purple-500/20 bg-purple-500/10 p-4">
            <p className="text-sm text-purple-400">
              {getPhaseRestrictionMessage?.(depositWithdrawTab)}
            </p>
            {battleData && (
              <p className="text-muted-foreground mt-1 text-xs">
                Current phase: {battleData.current_phase.replace("_", " ")}
              </p>
            )}
          </div>
        ) : (
          <>
            {/* Amount Input */}
            <div className="mb-6">
              <div className="mb-2 flex items-center justify-between">
                <label className="text-muted-foreground text-sm">Amount</label>
                <button
                  onClick={handleMaxClick}
                  className="text-muted-foreground cursor-pointer text-sm hover:text-white"
                >
                  Max:{" "}
                  {getMaxAmountDisplay
                    ? getMaxAmountDisplay()
                    : balanceLoading
                      ? "..."
                      : formatUSDC(balance, { showSymbol: false })}
                </button>
              </div>
              <div className="bg-background border-border relative border">
                <div className="absolute top-1/2 left-3 flex -translate-y-1/2 transform items-center space-x-2">
                  <UsdcIconSvg width={20} height={20} />
                  <span className="text-sm font-medium text-white">
                    {tokenSymbol}
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="0.00"
                  value={amount}
                  onChange={(e) => handleAmountChange(e.target.value)}
                  className="w-full bg-transparent py-3 pr-4 pl-20 text-right text-xl font-medium text-white focus:outline-none"
                />
              </div>
            </div>

            {/* Balance */}
            <div className="mb-6 flex justify-between text-sm">
              <span className="text-muted-foreground">Balance</span>
              <div className="flex items-center space-x-2">
                <span className="text-white">
                  {balanceLoading
                    ? "Loading..."
                    : formatUSDC(balance, { showSymbol: true })}
                </span>
              </div>
            </div>

            {/* Action Button */}
            {!isConnected ? (
              <Button
                onClick={login}
                className="w-full cursor-pointer bg-blue-600 py-3 text-sm font-medium text-white hover:bg-blue-700"
              >
                Login to{" "}
                {depositWithdrawTab === "deposit" ? "Deposit" : "Withdraw"}
              </Button>
            ) : (
              <Button
                onClick={
                  depositWithdrawTab === "deposit"
                    ? handleDeposit
                    : handleWithdraw
                }
                disabled={
                  !isAmountValid() ||
                  (depositWithdrawTab === "deposit"
                    ? depositState.isLoading
                    : withdrawState.isLoading)
                }
                className={`w-full cursor-pointer py-3 text-sm font-medium ${
                  depositWithdrawTab === "deposit"
                    ? "bg-profit hover:bg-profit/90 text-black"
                    : "bg-loss hover:bg-loss/90 text-white"
                }`}
              >
                {depositWithdrawTab === "deposit"
                  ? depositState.isLoading
                    ? "Processing..."
                    : "Confirm Deposit"
                  : withdrawState.isLoading
                    ? "Processing..."
                    : "Request Withdrawal"}
              </Button>
            )}

            {/* Error Messages */}
            {depositState.error && depositWithdrawTab === "deposit" && (
              <div className="mt-4 rounded border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-400">
                {depositState.error}
              </div>
            )}
            {withdrawState.error && depositWithdrawTab === "withdraw" && (
              <div className="mt-4 rounded border border-red-500/30 bg-red-900/20 p-3 text-sm text-red-400">
                {withdrawState.error}
              </div>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}
