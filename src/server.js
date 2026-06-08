import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { registerHealthTools } from './tools/health.js';
import { registerChartTools } from './tools/chart.js';

const server = new McpServer(
  {
    name: 'tradingview-mcp-codex',
    version: '0.1.0',
  },
  {
    capabilities: {
      tools: {},
    },
  },
);

registerHealthTools(server);
registerChartTools(server);

const transport = new StdioServerTransport();
await server.connect(transport);
