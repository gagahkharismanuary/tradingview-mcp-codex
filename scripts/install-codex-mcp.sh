#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")/.." && pwd)"
SERVER_PATH="$ROOT_DIR/src/server.js"
SERVER_NAME="${1:-tradingview-codex}"

echo "Registering MCP server: $SERVER_NAME"
codex mcp add "$SERVER_NAME" -- node "$SERVER_PATH"
echo "Done. Check with: codex mcp get $SERVER_NAME"
