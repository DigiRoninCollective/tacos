"use client";

import { useState } from "react";
import { useAddressVerification } from "@/app/hooks/useAddressVerification";

type AddressVerifierProps = {
  onVerificationChange?: (isVerified: boolean, address?: string) => void;
};

export default function AddressVerifier({ onVerificationChange }: AddressVerifierProps) {
  const [inputAddress, setInputAddress] = useState("");
  const { verifyAddress, isLoading, error, result, clearResult } = useAddressVerification();

  const handleVerify = async () => {
    if (!inputAddress.trim()) return;

    const verification = await verifyAddress(inputAddress.trim());
    if (verification) {
      onVerificationChange?.(verification.isHolder, verification.address);
    }
  };

  const handleClear = () => {
    setInputAddress("");
    clearResult();
    onVerificationChange?.(false);
  };

  return (
    <div className="rounded-3xl border border-white/15 bg-white/5 px-6 py-6 backdrop-blur">
      <div className="flex items-center justify-between gap-3 mb-6">
        <div>
          <p className="text-sm uppercase tracking-[0.4em] text-teal-300/70">Verify Address</p>
          <p className="text-lg font-semibold text-white">Check Token Holdings</p>
          <p className="text-xs text-white/60 mt-1">Requires a minimum hold to chat: <strong>{result?.minHold ?? 100000}</strong> tokens</p>
        </div>
        <span className={`text-xs font-semibold px-3 py-1 rounded-full ${
          result?.isHolder
            ? "border border-green-400/60 text-green-200"
            : result === null
            ? "border border-yellow-400/60 text-yellow-200"
            : "border border-red-400/60 text-red-200"
        }`}>
          {result?.isHolder ? "✓ Holder" : result ? "✗ Not Holder" : "Unverified"}
        </span>
      </div>

      <div className="space-y-4">
        {/* Address Input */}
        <div>
          <label className="text-xs uppercase tracking-[0.3em] text-teal-200/70 block mb-2">
            Solana Address
          </label>
          <input
            type="text"
            value={inputAddress}
            onChange={(e) => setInputAddress(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleVerify()}
            placeholder="Enter your Solana address (e.g., 11111111111111111111111111111111)"
            disabled={isLoading || !!result?.isHolder}
            className="w-full rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white placeholder-white/40 outline-none transition focus:border-teal-300/60 disabled:opacity-50"
          />
        </div>

        {/* Error Message */}
        {error && (
          <div className="p-3 rounded-2xl border border-red-400/30 bg-red-900/20">
            <p className="text-sm text-red-200">{error}</p>
          </div>
        )}

        {/* Success / Holder Status */}
        {result && (
          <div
            className={`p-3 rounded-2xl border ${
              result.isHolder
                ? "border-green-400/30 bg-green-900/20"
                : "border-yellow-400/30 bg-yellow-900/20"
            }`}
          >
            <p
              className={`text-sm font-semibold ${
                result.isHolder ? "text-green-200" : "text-yellow-200"
              }`}
            >
              {result.message}
            </p>
            {result.isHolder ? (
              <p className="text-xs text-white/60 mt-2">Your address is verified. You can now access the War Room.</p>
            ) : (
              <p className="text-xs text-white/60 mt-2">You need at least {result.minHold ?? 100000} tokens to access the War Room.</p>
            )}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleVerify}
            disabled={isLoading || !inputAddress.trim() || !!result?.isHolder}
            className="flex-1 rounded-2xl border border-teal-300/60 bg-gradient-to-r from-teal-400/30 to-purple-500/30 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-teal-200 transition disabled:opacity-50 hover:border-teal-200/90"
          >
            {isLoading ? "Verifying..." : "Verify Address"}
          </button>
          {result && (
            <button
              onClick={handleClear}
              className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm font-semibold uppercase tracking-[0.2em] text-white/70 transition hover:border-white/30"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {/* Info Footer */}
      <div className="mt-4 p-3 rounded-2xl border border-white/5 bg-white/[0.02]">
        <p className="text-xs text-white/50">
          💡 <strong>No wallet connection needed.</strong> Just paste your public address to verify token holdings. Your address is public and read-only.
        </p>
      </div>
    </div>
  );
}
