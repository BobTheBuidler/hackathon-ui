"use client";

import "@rainbow-me/rainbowkit/styles.css";

import { getDefaultConfig, RainbowKitProvider } from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useMemo } from "react";
import { WagmiProvider } from "wagmi";
import { sepolia } from "wagmi/chains";
import { custom } from "viem";

const projectId =
  process.env.NEXT_PUBLIC_WALLETCONNECT_PROJECT_ID || "demo-project-id";

const queryClient = new QueryClient();

export function Providers({ children }: { children: React.ReactNode }) {
  const config = useMemo(() => {
    const provider =
      typeof window !== "undefined" ? (window as { ethereum?: unknown }).ethereum : undefined;
    const walletTransport = custom(
      provider ?? {
        request: async () => {
          throw new Error("Wallet provider unavailable");
        }
      }
    );

    return getDefaultConfig({
      appName: "Hackathon UI",
      projectId,
      chains: [sepolia],
      batch: { multicall: false },
      transports: {
        [sepolia.id]: walletTransport
      },
      ssr: false
    });
  }, []);

  return (
    <WagmiProvider config={config}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider>{children}</RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  );
}
