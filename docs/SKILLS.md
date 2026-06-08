# Codex Skills Plan

Upstream repo contains workflow skills in `vendor/tradingview-mcp/skills/`.

Examples:

- `vendor/tradingview-mcp/skills/chart-analysis/SKILL.md`
- `vendor/tradingview-mcp/skills/pine-develop/SKILL.md`
- `vendor/tradingview-mcp/skills/multi-symbol-scan/SKILL.md`
- `vendor/tradingview-mcp/skills/replay-practice/SKILL.md`
- `vendor/tradingview-mcp/skills/strategy-report/SKILL.md`

## Important

These files are good workflow references, but Codex does not auto-install them from this repo.

To make them first-class Codex skills, copy/adapt them into:

```bash
~/.codex/skills/<skill-name>/SKILL.md
```

## Recommended Codex skill set

- `tradingview-chart-analysis`
- `tradingview-pine-develop`
- `tradingview-replay-practice`
- `tradingview-multi-symbol-scan`
- `tradingview-strategy-report`

## Adaptation rules

- keep steps short and tool-focused
- rename tool calls to local `tvx_*` names where parity exists
- for not-yet-ported tools, mark workflow as future or upstream-reference-only
- avoid claiming unavailable tools exist

## Current reality

Right now, this project can document and scaffold skill flows, but many upstream workflows still depend on MCP tools not yet ported into `tradingview-mcp-codex`.

Best use today:

- use skill docs as design target
- port missing MCP tools by workflow group
- then install matching Codex skills globally
