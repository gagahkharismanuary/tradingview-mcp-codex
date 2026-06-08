import { z } from 'zod';
import { jsonResult } from './_format.js';
import * as chart from '../core/chart.js';

export function registerChartTools(server) {
  server.tool('tvx_chart_state', 'Get current chart symbol, timeframe, and type', async () => {
    return jsonResult(await chart.getState());
  });

  server.tool(
    'tvx_set_symbol',
    'Set TradingView chart symbol',
    {
      symbol: z.string().describe('Symbol or exchange-prefixed symbol'),
    },
    async ({ symbol }) => jsonResult(await chart.setSymbol(symbol)),
  );

  server.tool(
    'tvx_set_timeframe',
    'Set TradingView chart timeframe',
    {
      timeframe: z.string().describe('Timeframe like 1, 5, 15, 1D'),
    },
    async ({ timeframe }) => jsonResult(await chart.setTimeframe(timeframe)),
  );
}
