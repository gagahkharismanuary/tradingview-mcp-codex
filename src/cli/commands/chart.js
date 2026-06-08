import { register } from '../router.js';
import * as chart from '../../core/chart.js';

register('state', {
  description: 'Get current chart state',
  handler: () => chart.getState(),
});

register('symbol', {
  description: 'Get or set current symbol',
  handler: async (_, positionals) => {
    const symbol = positionals[0];
    if (!symbol) return chart.getState();
    return chart.setSymbol(symbol);
  },
});

register('timeframe', {
  description: 'Get or set current timeframe',
  handler: async (_, positionals) => {
    const timeframe = positionals[0];
    if (!timeframe) return chart.getState();
    return chart.setTimeframe(timeframe);
  },
});
