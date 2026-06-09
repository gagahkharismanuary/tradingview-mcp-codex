# tradingview-mcp-codex

Connect Codex to your TradingView Desktop chart. Control symbols, timeframes, indicators, and screenshots via AI or CLI.

> **Not affiliated with TradingView Inc.** Interacts only with your locally running TradingView Desktop app via Chrome DevTools Protocol.

> **Requires a valid TradingView subscription.** Does not bypass any paywall or access control.

> **All processing is local.** No chart data leaves your machine.

---

## Prerequisites

- Node.js 18+
- TradingView Desktop installed (paid subscription)
- [Codex CLI](https://github.com/openai/codex) with MCP support

---

## Install

```bash
git clone https://github.com/gagahkharismanuary/tradingview-mcp-codex.git
cd tradingview-mcp-codex
npm install
```

---

## Step 1: Launch TradingView with debug port

TradingView must run with Chrome DevTools Protocol enabled on port 9222.

**Mac (auto):**
```bash
npm run launch
```

**Mac (manual):**
```bash
/Applications/TradingView.app/Contents/MacOS/TradingView --remote-debugging-port=9222
```

**Windows:**
```bat
"%LOCALAPPDATA%\TradingView\TradingView.exe" --remote-debugging-port=9222
```

**Linux:**
```bash
tradingview --remote-debugging-port=9222
```

Verify connection:
```bash
npm run health
```

Expected:
```json
{
  "success": true,
  "cdp_connected": true,
  "chart_symbol": "BTCUSD"
}
```

---

## Step 2: Register with Codex

```bash
codex mcp add tradingview-codex -- node /path/to/tradingview-mcp-codex/src/server.js
```

Replace `/path/to/tradingview-mcp-codex` with where you cloned. To find it:
```bash
pwd  # run inside the repo folder
```

Verify:
```bash
codex mcp list
codex mcp get tradingview-codex
```

Restart Codex after adding — tools load on session start.

---

## Step 3: Verify in Codex

Ask Codex to call `tvx_health_check`. Expected:
```json
{
  "success": true,
  "cdp_connected": true,
  "chart_symbol": "BTCUSD",
  "api_available": true
}
```

---

## MCP Tools

| Tool | What it does |
|------|-------------|
| `tvx_health_check` | Check CDP connection and chart status |
| `tvx_launch` | Launch TradingView Desktop with debug port |
| `tvx_chart_state` | Get symbol, timeframe, chart type, and indicator list |
| `tvx_set_symbol` | Change chart symbol |
| `tvx_set_timeframe` | Change chart timeframe |
| `tvx_set_chart_type` | Change chart type (Candles, Line, HeikinAshi, etc.) |
| `tvx_manage_indicator` | Add or remove an indicator |
| `tvx_symbol_search` | Search symbols by name or keyword |
| `tvx_screenshot` | Capture a screenshot of the chart |

---

## CLI

Install `tvx` globally (optional):
```bash
npm link
```

```bash
tvx status                                        # health check
tvx launch                                        # launch TradingView
tvx state                                         # get chart state
tvx symbol AAPL                                   # change symbol
tvx timeframe 15                                  # change timeframe (1, 5, 15, 60, D, W)
tvx charttype HeikinAshi                          # change chart type
tvx indicator add "Relative Strength Index"       # add indicator (full name required)
tvx indicator remove <entity_id>                  # entity_id from tvx state output
tvx search bitcoin                                # search symbols
tvx screenshot chart                              # capture chart (full, chart, strategy_tester)
```

Without `npm link`:
```bash
node src/cli/index.js symbol AAPL
```

---

## Troubleshooting

| Problem | Fix |
|---------|-----|
| `cdp_connected: false` | Launch TradingView with `--remote-debugging-port=9222` |
| `ECONNREFUSED` | TradingView not running or port 9222 blocked |
| Tools missing in Codex | Restart Codex after `codex mcp add` |
| `tvx` command not found | Run `npm link` inside the repo folder |
| Indicator add fails | Use full name: `"Relative Strength Index"` not `"RSI"` |

---

## One-liner Codex install prompt

Paste into Codex and it will handle the rest:

> Clone https://github.com/gagahkharismanuary/tradingview-mcp-codex.git, run npm install, register with `codex mcp add tradingview-codex -- node <path>/src/server.js`, then verify with tvx_health_check.

---

## Credits

Built on top of [tradesdontlie/tradingview-mcp](https://github.com/tradesdontlie/tradingview-mcp) — a TradingView MCP server for Claude Code that connects AI agents to TradingView Desktop via Chrome DevTools Protocol. Core architecture, CDP connection patterns, chart API bindings, and tool designs are derived from that work. This project adapts and extends it for Codex workflows.

Licensed MIT. Copyright (c) 2026 tradesdontlie.
