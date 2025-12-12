"use client";

import { useCallback, useState } from "react";

export type VerificationResult = {
  isHolder: boolean;
  tokenBalance: number;
  address: string;
  minHold?: number;
  message?: string;
};

/**
 * Hook to verify if a Solana address holds the gating token.
 * No wallet connection required — just a public address lookup.
 */
export function useAddressVerification() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<VerificationResult | null>(null);

  const verifyAddress = useCallback(async (address: string): Promise<VerificationResult | null> => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // Validate address format (Solana addresses are base58, 44 chars)
      if (!address || address.length < 40 || address.length > 44) {
        throw new Error("Invalid Solana address format");
      }

      // Call backend verification endpoint
      const response = await fetch("/api/verify-holder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Verification failed");
      }

      const api = await response.json();
      // Map API response to internal shape
      const data: VerificationResult = {
        isHolder: Boolean(api.holder),
        tokenBalance: typeof api.balance === "number" ? api.balance : 0,
        address,
        minHold: typeof api.minHold === "number" ? api.minHold : undefined,
        message: api.message ?? (api.holder ? `Verified holder with ${api.balance}` : api.error ?? "Not a holder"),
      };
      setResult(data);
      return data;
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : "Unknown error";
      setError(errorMsg);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const clearResult = useCallback(() => {
    setResult(null);
    setError(null);
  }, []);

  return { verifyAddress, isLoading, error, result, clearResult };
}
