# AGENTS.md

## Purpose

Codex-first TradingView MCP project. Keep code small, direct, reusable.

## Rules

- prefer shared core logic in `src/core`
- keep CLI wrappers thin in `src/cli`
- keep MCP tool wrappers thin in `src/tools`
- avoid extra dependencies unless clear need
- use ESM only
- prefer JSON outputs for CLI
- fix root cause, not UI-only workaround
- do not copy upstream code blindly; adapt patterns and rename for clarity

## Structure

- `src/server.js` — MCP server entry
- `src/connection.js` — CDP connection helpers
- `src/core` — shared TradingView logic
- `src/tools` — MCP tool registration
- `src/cli` — local CLI router and commands

## Validation

- verify `tvx status` after launch changes
- verify MCP stdio server still starts cleanly
