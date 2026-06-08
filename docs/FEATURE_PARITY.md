# Feature Parity Map

This project uses `vendor/tradingview-mcp` as upstream reference, but does not yet expose full parity.

## Upstream reference

- repo: `vendor/tradingview-mcp/README.md`
- setup guide: `vendor/tradingview-mcp/SETUP_GUIDE.md`
- Claude workflows: `vendor/tradingview-mcp/CLAUDE.md`

## Implemented here now

- launch TradingView Desktop with debug port
- health check via CDP
- get current chart state
- set chart symbol
- set chart timeframe

## Present upstream, not yet ported here

- screenshots
- Pine editor push/pull/compile loop
- replay controls
- drawings
- alerts
- watchlist actions
- indicator add/remove/config
- multi-pane layout control
- deeper UI automation helpers
- streaming quote/bar/value tools

## Porting strategy

Port by stable workflow groups instead of copying entire upstream surface at once.

### Phase 1

- screenshot capture
- symbol search
- chart type switch
- indicator add/remove

### Phase 2

- Pine source get/set
- compile and error fetch
- screenshot verification loop

### Phase 3

- replay start/step/stop/status
- drawings
- alerts

### Phase 4

- multi-pane and layout control
- watchlist flows
- streaming tools

## Naming approach

Upstream uses names like `tv_health_check` and `chart_set_symbol`.

This repo currently keeps `tvx_*` naming for Codex-focused MCP tools:

- `tvx_health_check`
- `tvx_launch`
- `tvx_chart_state`
- `tvx_set_symbol`
- `tvx_set_timeframe`

If parity becomes priority, project may later add aliases for upstream-style names.
