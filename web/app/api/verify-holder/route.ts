import { NextRequest, NextResponse } from "next/server";
import { Connection, PublicKey } from "@solana/web3.js";

/**
 * POST /api/verify-holder
 *
 * For a given Solana public address, check whether it holds >= 1 unit
 * of the gating SPL token (mint provided in `process.env.GATING_TOKEN_MINT`).
 * Returns a small, idempotent JSON object { holder: boolean, balance?: number, error?: string }.
 */
const DEFAULT_SOLANA_RPC_URL = "https://mainnet.helius-rpc.com/?api-key=c3e649c2-a7eb-4b99-94a8-f092553c3283";

export async function POST(request: NextRequest) {
  try {
    console.log("POST /api/verify-holder");
    const body = await request.json();
    const address = typeof body === "object" && body !== null ? (body.address as string) : undefined;
    console.log(`Received address: ${address}`);

    if (!address || typeof address !== "string") {
      console.error("Missing or invalid `address` in request body");
      return NextResponse.json({ holder: false, error: "Missing or invalid `address` in request body" }, { status: 400 });
    }

    // Validate env
    const mintEnv = process.env.GATING_TOKEN_MINT;
    console.log(`GATING_TOKEN_MINT: ${mintEnv}`);
    if (!mintEnv) {
      console.error("GATING_TOKEN_MINT is not configured on the server");
      return NextResponse.json({ holder: false, error: "GATING_TOKEN_MINT is not configured on the server" }, { status: 500 });
    }

    const rpcUrl = process.env.SOLANA_RPC_URL || DEFAULT_SOLANA_RPC_URL;
    console.log(`Using RPC URL: ${rpcUrl}`);

    let connection: Connection;
    try {
      connection = new Connection(rpcUrl, "confirmed");
      console.log("Successfully created Solana connection.");
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error(`Failed to create Solana connection: ${msg}`);
      return NextResponse.json({ holder: false, error: `Failed to create Solana connection: ${msg}` }, { status: 500 });
    }

    let owner: PublicKey;
    let mint: PublicKey;
    try {
      owner = new PublicKey(address);
      mint = new PublicKey(mintEnv);
      console.log("Successfully created owner and mint PublicKeys.");
    } catch (err) {
      console.error("Invalid public key format for address or GATING_TOKEN_MINT", err);
      return NextResponse.json({ holder: false, error: "Invalid public key format for address or GATING_TOKEN_MINT" }, { status: 400 });
    }

    try {
      console.log("Querying parsed token accounts by owner...");
      // Query parsed token accounts by owner filtered by the gating mint
      const resp = await connection.getParsedTokenAccountsByOwner(owner, { mint });
      console.log("Successfully queried token accounts.");

      // Sum UI-aware balances across accounts for this mint
      let balance = 0;
      for (const acc of resp.value) {
        try {
          const parsed = acc.account.data.parsed;
          const tokenAmount = parsed?.info?.tokenAmount;
          if (tokenAmount) {
            // tokenAmount.uiAmount is the human-readable amount (respecting decimals)
            const ui = tokenAmount.uiAmount;
            if (typeof ui === "number") {
              balance += ui;
            } else if (tokenAmount.amount && tokenAmount.decimals != null) {
              balance += Number(tokenAmount.amount) / Math.pow(10, tokenAmount.decimals);
            }
          }
        } catch (inner) {
          // ignore malformed account entries but continue
          console.warn("Skipping parse error for token account", inner);
        }
      }
      console.log(`Calculated balance: ${balance}`);

      // Minimum hold threshold (configurable via env). Default to 100000 tokens.
      const minHold = Number(process.env.MIN_HOLD_AMOUNT ?? "100000");
      console.log(`Minimum hold amount: ${minHold}`);
      const isHolder = balance >= minHold;
      console.log(`Is holder: ${isHolder}`);
      return NextResponse.json({ holder: isHolder, balance, minHold }, { status: 200 });
    } catch (err) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error("RPC error while checking token accounts:", err);
      return NextResponse.json({ holder: false, error: `RPC error: ${msg}` }, { status: 200 });
    }
  } catch (error) {
    const msg = error instanceof Error ? error.message : String(error);
    console.error("POST /api/verify-holder unexpected error:", error);
    return NextResponse.json({ holder: false, error: `Unexpected server error: ${msg}` }, { status: 500 });
  }
}
