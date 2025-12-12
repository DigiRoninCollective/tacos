"use client";

import { useState } from "react";
import Link from "next/link";
import AddressVerifier from "@/app/components/AddressVerifier";
import WarRoom from "@/app/components/WarRoom";
import contractMetadata from "@/data/contract-metadata.json";

export default function Home() {
  const [isAddressVerified, setIsAddressVerified] = useState(false);
  const [verifiedAddress, setVerifiedAddress] = useState<string | null>(null);

  const handleAddressVerificationChange = (isVerified: boolean, address?: string) => {
    setIsAddressVerified(isVerified);
    setVerifiedAddress(address || null);
  };
  return (
    <div className="bg-[radial-gradient(circle_at_top,_#3b00ff_0%,_#0e0c1e_45%,_#030012_100%)] text-white">
      <main className="relative isolate overflow-hidden px-6 py-10 lg:px-16">
        <div className="neon-grid-bg -z-10" />

        <section className="hero">
          <div className="hero-inner">
            <div className="flex items-center justify-between gap-6">
              <div>
                <span className="tacos-tag">T.A.C.O.S</span>
                <h1 className="neon-title mt-4">TOTALLY ARMED CAT ON SOLANA</h1>
                <p className="text-sm text-white/80 mt-3">one cat took Solana into his own hands—now even the horse has a wallet.</p>
              </div>
            </div>

            <div className="contract-bar" role="region" aria-label="Contract address">
              Contract Address: {contractMetadata.mintAddress}
            </div>

            <div className="legend">
              <div className="subtitle">THE LEGEND BEGINS</div>
              <p>-If he loses a trade, the chart apologizes.</p>
            </div>

            <div className="stats-pill">
              <div className="stat-row">
                <div className="stat">Accuracy: <span className="font-extrabold">0/100</span></div>
                <div className="stat">Swagger: <span className="font-extrabold">120/100</span></div>
                <div className="stat">Horse Wallet Balance: <span className="font-extrabold">fluctuating...</span></div>
              </div>
            </div>

            <div className="media-grid">
              <div className="grid-thumb">
                <video className="w-full h-full object-cover" src="/runninshoorter.mp4" poster="/image_2025-12-11_16-20-18.png" autoPlay muted loop playsInline preload="metadata" />
              </div>
              <div className="grid-thumb">
                <video className="w-full h-full object-cover" src="/shoorer.mp4" poster="/image_2025-12-11_16-20-18.png" autoPlay muted loop playsInline preload="metadata" />
              </div>
            </div>
          </div>
        </section>

        <section className="mx-auto mt-16 max-w-5xl space-y-6" id="war-room">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <p className="text-xs uppercase tracking-[0.4em] text-teal-200/70">War Room</p>
              <h2 className="text-3xl font-semibold text-white">T.A.C.O.S War Room</h2>
              <p className="text-white/70">Token-gated chat for verified holders. Message storage powered by Supabase.</p>
            </div>
          </div>
          {isAddressVerified ? (
            <WarRoom isVerified={isAddressVerified} walletAddress={verifiedAddress || undefined} />
          ) : (
            <AddressVerifier onVerificationChange={handleAddressVerificationChange} />
          )}
        </section>

        
      </main>
    </div>
  );
}
