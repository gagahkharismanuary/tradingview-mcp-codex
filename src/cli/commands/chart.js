import { register } from '../router.js';
import * as chart from '../../core/chart.js';

register('state', {
  description: 'Get current chart state (symbol, timeframe, type, indicators)',
  handler: () => chart.getState(),
});

register('symbol', {
  description: 'Set chart symbol  (e.g. tvx symbol AAPL)',
  handler: async (_, positionals) => {
    const symbol = positionals[0];
    if (!symbol) return chart.getState();
    return chart.setSymbol(symbol);
  },
});

register('timeframe', {
  description: 'Set chart timeframe  (e.g. tvx timeframe 15)',
  handler: async (_, positionals) => {
    const timeframe = positionals[0];
    if (!timeframe) return chart.getState();
    return chart.setTimeframe(timeframe);
  },
});

register('charttype', {
  description: 'Set chart type  (e.g. tvx charttype Candles)',
  handler: async (_, positionals) => {
    const t = positionals[0];
    if (!t) throw new Error('Usage: tvx charttype <type>  (Candles, Line, HeikinAshi, ...)');
    return chart.setType(t);
  },
});

register('indicator', {
  description: 'Add or remove indicator  (e.g. tvx indicator add "Relative Strength Index")',
  handler: async (_, positionals) => {
    const [action, indicator, entity_id] = positionals;
    if (!action || !indicator) throw new Error('Usage: tvx indicator <add|remove> "<name>" [entity_id]');
    return chart.manageIndicator({ action, indicator, entity_id });
  },
});

register('search', {
  description: 'Search symbols  (e.g. tvx search bitcoin)',
  handler: async (_, positionals) => {
    const query = positionals[0];
    if (!query) throw new Error('Usage: tvx search <query>');
    return chart.symbolSearch({ query });
  },
});

register('screenshot', {
  description: 'Capture chart screenshot  (e.g. tvx screenshot chart)',
  handler: async (_, positionals) => {
    const region = positionals[0] || 'full';
    return chart.captureScreenshot({ region });
  },
});
