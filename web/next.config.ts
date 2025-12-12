import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.join(__dirname),
  },
  env: {
    NEXT_PUBLIC_SUPABASE_URL: process.env.NEXT_PUBLIC_SUPABASE_URL,
    NEXT_PUBLIC_SUPABASE_ANON_KEY: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    SUPABASE_URL: process.env.SUPABASE_URL,
    SUPABASE_SERVICE_KEY: process.env.SUPABASE_SERVICE_KEY,
    GATING_TOKEN_MINT: process.env.GATING_TOKEN_MINT,
    SOLANA_RPC_URL: process.env.SOLANA_RPC_URL,
    MIN_HOLD_AMOUNT: process.env.MIN_HOLD_AMOUNT,
  },
};

export default nextConfig;
