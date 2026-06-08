# tradingview-mcp-codex

Codex-first TradingView MCP bridge for TradingView Desktop via Chrome DevTools Protocol.

This project adapts ideas and workflows from `tradesdontlie/tradingview-mcp` for Codex:

- same local TradingView Desktop CDP model
- Codex-friendly MCP setup
- thin shared core for CLI and MCP tools
- clearer Codex install and workflow docs

## Status

Current scaffold ships working base pieces:

- CLI:
  - `tvx launch`
  - `tvx status`
  - `tvx symbol <SYMBOL>`
  - `tvx timeframe <TF>`
- MCP tools:
  - `tvx_launch`
  - `tvx_health_check`
  - `tvx_set_symbol`
  - `tvx_set_timeframe`
  - `tvx_chart_state`

It does **not** yet expose full upstream feature parity. Use `vendor/tradingview-mcp` as feature reference while growing this Codex-first server.

## Goals

- keep MCP server small and readable
- share logic across CLI and MCP tools
- document Codex setup better than Claude-only examples
- make feature parity work incremental and explicit

## Prerequisites

- Node.js 18+
- TradingView Desktop installed
- valid TradingView subscription for your own local app usage
- Codex CLI with MCP support

## Install

```bash
npm install
```

## Run locally

Start MCP server:

```bash
npm start
```

Use CLI:

```bash
npm run launch
npm run health
node src/cli/index.js symbol BBCA
node src/cli/index.js timeframe 1
```

## Add to Codex

Register global MCP entry:

```bash
codex mcp add tradingview-codex -- node /Users/you/Projects/tradingview-mcp-codex/src/server.js
```

Check config:

```bash
codex mcp list
codex mcp get tradingview-codex
```

Restart Codex session after adding server so tool list refreshes.

## Quick verification

1. Launch TradingView with CDP:
   - `npm run launch`
2. Check CLI connection:
   - `npm run health`
3. In fresh Codex session, call MCP tool:
   - `tvx_health_check`

## Documentation

- Codex setup: `docs/CODEX_SETUP.md`
- Feature mapping from upstream reference: `docs/FEATURE_PARITY.md`
- Skill port plan: `docs/SKILLS.md`

## Reference source

Primary reference used while shaping this project:

- upstream repo: `vendor/tradingview-mcp/README.md`
- upstream setup: `vendor/tradingview-mcp/SETUP_GUIDE.md`
- upstream Claude workflows: `vendor/tradingview-mcp/CLAUDE.md`

Upstream project:

- https://github.com/tradesdontlie/tradingview-mcp

## Design notes

- keep shared TradingView logic in `src/core`
- keep CLI wrappers thin in `src/cli`
- keep MCP wrappers thin in `src/tools`
- prefer explicit, JSON-friendly outputs
- port upstream features one workflow at time instead of blind copy
