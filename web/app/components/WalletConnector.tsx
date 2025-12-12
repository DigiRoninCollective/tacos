"use client";

import { useCallback, useMemo, useState } from "react";

export type WalletProvider = {
  id: "phantom" | "solflare";
  name: string;
  tagline: string;
};

const walletProviders: WalletProvider[] = [
  {
    id: "phantom",
    name: "Phantom",
    tagline: "Desktop + mobile passkey for Solana",
  },
  {
    id: "solflare",
    name: "Solflare",
    tagline: "Multi-chain key storage with mobile support",
  },
];

export type WalletConnectorProps = {
  onConnectionChange?: (isConnected: boolean, walletAddress?: string) => void;
};

export default function WalletConnector({ onConnectionChange }: WalletConnectorProps) {
  const [connected, setConnected] = useState<string | null>(null);
  const [status, setStatus] = useState<"idle" | "connecting" | "connected">("idle");

  const handleConnect = useCallback((provider: WalletProvider) => {
    setStatus("connecting");
    setTimeout(() => {
      // TODO: Replace with actual Solana wallet connection
      // TODO: Call @solana/wallet-adapter to connect to provider.id
      // TODO: Extract real wallet address from provider
      const mockAddress = `${provider.id}_${Math.random().toString(36).slice(2, 9)}`;
      setConnected(provider.name);
      setStatus("connected");
      onConnectionChange?.(true, mockAddress);
    }, 300);
  }, [onConnectionChange]);

  const statusLabel = useMemo(() => {
    if (status === "connecting") {
      return "Waiting for wallet confirmation...";
    }
    if (status === "connected" && connected) {
      return `${connected} connected`; 
    }
    return "Connect a wallet to unlock chat";
  }, [connected, status]);

  return (
    <div className="rounded-3xl border border-white/15 bg-white/5 px-6 py-6 backdrop-blur">
      <div className="flex items-center justify-between gap-3">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-teal-300/70">connect</p>
          <p className="text-lg font-semibold text-white">Wallet hub</p>
        </div>
        <span className="text-xs text-teal-200/80">{statusLabel}</span>
      </div>
      <div className="mt-6 grid gap-3 md:grid-cols-2">
        {walletProviders.map((provider) => (
          <button
            key={provider.id}
            onClick={() => handleConnect(provider)}
            className="rounded-2xl border border-white/20 bg-gradient-to-br from-purple-500/20 to-teal-500/20 px-3 py-4 text-left text-sm font-medium transition hover:border-teal-300/80"
          >
            <p className="text-base font-semibold text-white">{provider.name}</p>
            <p className="text-xs text-white/70">{provider.tagline}</p>
          </button>
        ))}
      </div>
    </div>
  );
}
