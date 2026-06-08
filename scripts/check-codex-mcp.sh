#!/usr/bin/env bash
set -euo pipefail

SERVER_NAME="${1:-tradingview-codex}"

echo "== codex mcp list =="
codex mcp list
echo
echo "== codex mcp get $SERVER_NAME =="
codex mcp get "$SERVER_NAME"
