import { z } from 'zod';
import { jsonResult } from './_format.js';
import * as health from '../core/health.js';

export function registerHealthTools(server) {
  server.tool('tvx_health_check', 'Check TradingView CDP connection and current chart state', async () => {
    try {
      return jsonResult(await health.healthCheck());
    } catch (error) {
      return jsonResult({ success: false, error: error.message, hint: 'Launch TradingView with tvx_launch or --remote-debugging-port=9222' });
    }
  });

  server.tool(
    'tvx_launch',
    'Launch TradingView Desktop with remote debugging enabled',
    {
      port: z.number().optional().describe('CDP port, default 9222'),
      killExisting: z.boolean().optional().describe('Kill existing TradingView processes first'),
    },
    async ({ port, killExisting }) => jsonResult(await health.launch({ port, killExisting })),
  );
}
