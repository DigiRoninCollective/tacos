#!/usr/bin/env bash
set -euo pipefail

ADDRESS="${1:-}"
if [[ -z "$ADDRESS" ]]; then
  cat <<'EOF' >&2
Usage: ./scripts/verify-holder.sh <SOLANA_PUBLIC_KEY>
Example:
  ./scripts/verify-holder.sh GAffyNL3KmejcYgVtVDg5zhs2Deeptg8BgE9EYN4WzrD
EOF
  exit 1
fi

URL="${NETLIFY_VERIFY_URL:-https://tacos.spot/api/verify-holder}"

printf 'Posting holder verification for %s to %s\n' "$ADDRESS" "$URL"

curl --fail --show-error --silent \
  --header 'Content-Type: application/json' \
  --data "{\"address\":\"${ADDRESS}\"}" \
  "$URL"

# ensure newline after JSON output
echo
