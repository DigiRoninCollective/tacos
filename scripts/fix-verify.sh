#!/usr/bin/env bash
set -euo pipefail
cd /home/zkronin/jediangelspacehamster/web

RPC_URL="https://mainnet.helius-rpc.com/?api-key=c3e649c2-a7eb-4b99-94a8-f092553c3283"
MINT="DFJtQJkcGNVbqFVstdQ1eA6HgXLniGNupo73GLskpump"
MIN_HOLD="100000"

netlify env:set SOLANA_RPC_URL "$RPC_URL" --context production
netlify env:set SOLANA_RPC_URL "$RPC_URL" --scope runtime

netlify env:set GATING_TOKEN_MINT "$MINT" --context production
netlify env:set GATING_TOKEN_MINT "$MINT" --scope runtime

netlify env:set MIN_HOLD_AMOUNT "$MIN_HOLD" --context production
netlify env:set MIN_HOLD_AMOUNT "$MIN_HOLD" --scope runtime

echo "Environment variables refreshed. Run 'netlify deploy --prod --trigger --json' manually (from /home/zkronin/jediangelspacehamster/web) to redeploy and pick up the new values."
