import { NextRequest, NextResponse } from "next/server";
/**
 * GET /api/messages
 *
 * Fetch all messages from the War Room.
 *
 * TODO: Implement message fetching:
 * 1. Connect to Supabase/Firebase database
 * 2. Query messages table with pagination (limit 50, order by timestamp DESC)
 * 3. Include sender name, wallet address, message text, timestamp
 * 4. Add optional filtering by date range or user wallet
 * 5. Implement caching with Redis or Next.js cache
 *
 * Response format:
 * {
 *   messages: [
 *     {
 *       id: string,
 *       sender: string,
 *       walletAddress: string,
 *       text: string,
 *       timestamp: string,
 *     }
 *   ],
 *   count: number,
 * }
 */
import { supabaseServer } from "@/lib/supabaseServer";
import { Connection, PublicKey } from "@solana/web3.js";

interface SupabaseMessage {
  id: string;
  wallet_address: string;
  sender_name: string;
  text: string;
  created_at: string;
}

interface MessageResponse {
  id: string;
  sender: string;
  walletAddress: string;
  text: string;
  timestamp: string;
}

export async function GET() {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json(
        { error: "Supabase not configured (SUPABASE_URL or SUPABASE_SERVICE_KEY missing)" },
        { status: 500 }
      );
    }

    // Fetch recent messages (limit 50)
    const { data, error } = await supabaseServer
      .from("messages")
      .select("id, wallet_address, sender_name, text, created_at")
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) {
      console.error("Supabase GET error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const messages: MessageResponse[] = (data as SupabaseMessage[] || []).map((r) => ({
      id: r.id,
      sender: r.sender_name,
      walletAddress: r.wallet_address,
      text: r.text,
      timestamp: r.created_at,
    }));

    return NextResponse.json({ messages, count: messages.length }, { status: 200 });
  } catch (error) {
    console.error("GET /api/messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}

/**
 * POST /api/messages
 *
 * Post a new message to the War Room.
 *
 * Request body:
 * {
 *   text: string,
 *   walletAddress: string,
 *   signature: string,
 *   timestamp: string,
 * }
 *
 * TODO: Implement message posting:
 * 1. Verify wallet signature (use tweetnacl or @solana/web3.js)
 * 2. Validate message content (length, format, rate limiting)
 * 3. Verify wallet holds the gating token (on-chain check via RPC)
 * 4. Insert message into Supabase/Firebase database
 * 5. Trigger real-time notification to connected clients
 * 6. Return saved message with generated ID
 *
 * Response format:
 * {
 *   message: {
 *     id: string,
 *     sender: string,
 *     walletAddress: string,
 *     text: string,
 *     timestamp: string,
 *   }
 * }
 */
export async function POST(request: NextRequest) {
  try {
    if (!process.env.SUPABASE_URL || !process.env.SUPABASE_SERVICE_KEY) {
      return NextResponse.json(
        { error: "Supabase not configured (SUPABASE_URL or SUPABASE_SERVICE_KEY missing)" },
        { status: 500 }
      );
    }

    const body = await request.json();
    const { text, walletAddress, senderName } = body;

    if (!text || typeof text !== "string" || text.length > 1000) {
      return NextResponse.json({ error: "Invalid message text" }, { status: 400 });
    }
    if (!walletAddress || typeof walletAddress !== "string") {
      return NextResponse.json({ error: "walletAddress is required" }, { status: 400 });
    }

    // Server-side holder check (same logic as verify-holder)
    const mintEnv = process.env.GATING_TOKEN_MINT;
    if (!mintEnv) {
      return NextResponse.json({ error: "GATING_TOKEN_MINT not configured" }, { status: 500 });
    }

    const rpcUrl = process.env.SOLANA_RPC_URL || "https://api.mainnet-beta.solana.com";
    const connection = new Connection(rpcUrl, "confirmed");

    let owner: PublicKey;
    let mint: PublicKey;
    try {
      owner = new PublicKey(walletAddress);
      mint = new PublicKey(mintEnv);
    } catch (err) {
      return NextResponse.json({ error: "Invalid public key format" }, { status: 400 });
    }

    const resp = await connection.getParsedTokenAccountsByOwner(owner, { mint });
    let balance = 0;
    for (const acc of resp.value) {
      try {
        const tokenAmount = acc.account.data.parsed.info.tokenAmount;
        if (tokenAmount) {
          const ui = tokenAmount.uiAmount;
          if (typeof ui === "number") balance += ui;
          else if (tokenAmount.amount && tokenAmount.decimals != null)
            balance += Number(tokenAmount.amount) / Math.pow(10, tokenAmount.decimals);
        }
      } catch (e) {
        // ignore parse errors
      }
    }

    const minHold = Number(process.env.MIN_HOLD_AMOUNT ?? "100000");
    if (balance < minHold) {
      return NextResponse.json({ error: "Insufficient token holdings", holder: false, balance }, { status: 403 });
    }

    // Insert into Supabase messages table
    const insert = {
      wallet_address: walletAddress,
      sender_name: senderName ?? `Holder_${walletAddress.slice(0, 4)}`,
      text,
      signature: null,
    };

    const { data, error } = await supabaseServer.from("messages").insert([insert]).select();
    if (error) {
      console.error("Supabase insert error:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    const saved = (data && data[0]) || null;
    return NextResponse.json({ message: saved }, { status: 201 });
  } catch (error) {
    console.error("POST /api/messages error:", error);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
