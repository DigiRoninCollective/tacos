// TODO: Integrate @solana/web3.js and wallet-adapter
// npm install @solana/web3.js @solana/wallet-adapter-react @solana/wallet-adapter-wallets @solana/wallet-adapter-base

"use client";

import { useCallback, useState } from "react";

// TODO: Import from @solana/web3.js once installed
// import { PublicKey, Transaction } from "@solana/web3.js";

export type WalletSignatureResult = {
  signature: string;
  publicKey: string;
  message: Uint8Array;
};

/**
 * Hook to handle Solana wallet signature verification.
 * Used for message authentication in the War Room.
 *
 * TODO: Implement actual signature flow:
 * 1. Create a message to sign (include timestamp + nonce for security)
 * 2. Request wallet.signMessage() or wallet.signTransaction()
 * 3. Send signature to backend for verification
 * 4. Return signature proof to include in chat message POST
 */
export function useWalletSignature() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const signMessage = useCallback(async (message: string): Promise<WalletSignatureResult | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // TODO: Get wallet from context (useWallet hook)
      // const { wallet, publicKey, signMessage: walletSignMessage } = useWallet();

      // TODO: Check if wallet is connected
      // if (!wallet || !publicKey || !walletSignMessage) {
      //   throw new Error("Wallet not connected");
      // }

      // TODO: Create message buffer with timestamp + nonce
      // const messageBuffer = new TextEncoder().encode(message);

      // TODO: Request signature from wallet
      // const signature = await walletSignMessage(messageBuffer);

      // TODO: Return signature result
      // return {
      //   signature: Buffer.from(signature).toString("base64"),
      //   publicKey: publicKey.toString(),
      //   message: messageBuffer,
      // };

      console.warn("useWalletSignature: Wallet signature not yet implemented");
      return null;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      console.error("Signature error:", err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { signMessage, isLoading, error };
}

/**
 * Hook to manage Solana wallet connection state.
 * Wraps @solana/wallet-adapter-react useWallet().
 *
 * TODO: Implement connection flow:
 * 1. Detect available wallets (Phantom, Solflare, etc.)
 * 2. Connect to selected wallet
 * 3. Store connected wallet address in state
 * 4. Expose connect/disconnect methods
 */
export function useSolanaWallet() {
  const [publicKey, setPublicKey] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);

  const connectWallet = useCallback(async (walletName: string) => {
    setIsConnecting(true);
    try {
      // TODO: Implement wallet detection and connection
      // const walletInstance = window.solana || window.phantom?.solana;
      // const response = await walletInstance?.connect();
      // setPublicKey(response?.publicKey?.toString());

      console.warn(`useSolanaWallet: Connection to ${walletName} not yet implemented`);
    } catch (err) {
      console.error("Wallet connection error:", err);
    } finally {
      setIsConnecting(false);
    }
  }, []);

  const disconnectWallet = useCallback(async () => {
    // TODO: Disconnect from wallet
    setPublicKey(null);
  }, []);

  return { publicKey, isConnecting, connectWallet, disconnectWallet };
}
