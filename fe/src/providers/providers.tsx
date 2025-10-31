"use client";

import React from "react";
import { PrivyProvider, type WalletListEntry } from "@privy-io/react-auth";
import { toSolanaWalletConnectors } from "@privy-io/react-auth/solana";
import { createSolanaRpc, createSolanaRpcSubscriptions } from "@solana/kit";
import { Toaster } from "@/components/ui/sonner";

// Stable wallet list configuration outside component to prevent re-renders
const STABLE_WALLET_LIST: WalletListEntry[] = [
  "phantom",
  "solflare",
  "backpack",
  "detected_solana_wallets",
];

export default function Providers({ children }: { children: React.ReactNode }) {
  return (
    <PrivyProvider
      appId={process.env.NEXT_PUBLIC_PRIVY_APP_ID!}
      config={{
        // Login methods: only Google and Solana wallets
        loginMethods: ["google", "wallet"],

        // Embedded wallet configuration for Solana
        embeddedWallets: {
          solana: {
            createOnLogin: "users-without-wallets",
          },
        },

        // External wallet configuration for Solana
        externalWallets: {
          solana: {
            connectors: toSolanaWalletConnectors({
              shouldAutoConnect: true,
            }),
          },
        },

        // Solana network configuration
        solana: {
          rpcs: {
            "solana:mainnet": {
              rpc: createSolanaRpc("https://api.mainnet-beta.solana.com"),
              rpcSubscriptions: createSolanaRpcSubscriptions(
                "wss://api.mainnet-beta.solana.com"
              ),
            },
            "solana:devnet": {
              rpc: createSolanaRpc(
                "https://devnet.helius-rpc.com/?api-key=58884173-bdb0-49b3-9d65-abc5ed97828d"
              ),
              rpcSubscriptions: createSolanaRpcSubscriptions(
                "wss://devnet.helius-rpc.com/?api-key=58884173-bdb0-49b3-9d65-abc5ed97828d"
              ),
            },
          },
        },

        // Appearance configuration with dark theme
        appearance: {
          theme: "dark",
          walletChainType: "solana-only",
          accentColor: "#6366f1",
          logo: undefined,
          landingHeader: "Welcome to Degen Banx",
          loginMessage:
            "Connect with Google or your Solana wallet to get started",
          showWalletLoginFirst: true,
          // Using stable wallet list to prevent key prop issues
          walletList: STABLE_WALLET_LIST,
        },

        // Funding configuration
        fundingMethodConfig: {
          moonpay: {
            useSandbox: true,
          },
        },
      }}
    >
      {children}
      <Toaster key="app-toaster" />
    </PrivyProvider>
  );
}
