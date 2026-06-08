# Codex Setup

This guide shows how to run `tradingview-mcp-codex` with Codex CLI.

## 1. Install dependencies

```bash
cd ~/Projects/tradingview-mcp-codex
npm install
```

## 2. Launch TradingView Desktop with CDP

Start TradingView Desktop with Chrome DevTools Protocol on port `9222`.

Fast path from this repo:

```bash
npm run launch
```

Then verify local connection:

```bash
npm run health
```

Expected result shape:

```json
{
  "success": true,
  "port": 9222
}
```

## 3. Register MCP server in Codex

```bash
codex mcp add tradingview-codex -- node /Users/you/Projects/tradingview-mcp-codex/src/server.js
```

Check registration:

```bash
codex mcp list
codex mcp get tradingview-codex
```

## 4. Restart Codex session

MCP tools usually appear in new session after restart or fresh attach.

## 5. Verify from Codex

Ask Codex to call:

- `tvx_health_check`
- `tvx_chart_state`

## Troubleshooting

### `codex mcp list` shows server, but tool missing

- restart Codex session
- recheck `codex mcp get tradingview-codex`
- confirm `node` path works in your shell

### `tvx_health_check` fails

- ensure TradingView Desktop is running
- ensure it was launched with `--remote-debugging-port=9222`
- run `npm run health`

### CLI cannot connect

- close old TradingView process
- run `npm run launch`
- rerun `npm run health`

## Useful commands

```bash
codex mcp list
codex mcp get tradingview-codex
codex mcp remove tradingview-codex
npm run launch
npm run health
node src/cli/index.js symbol AAPL
node src/cli/index.js timeframe 15
```
