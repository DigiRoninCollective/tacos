import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  env: {
    GATING_TOKEN_MINT: process.env.GATING_TOKEN_MINT,
    SOLANA_RPC_URL: process.env.SOLANA_RPC_URL,
    MIN_HOLD_AMOUNT: process.env.MIN_HOLD_AMOUNT,
  },
};

export default nextConfig;
