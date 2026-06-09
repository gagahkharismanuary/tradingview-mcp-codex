import { z } from 'zod';
import { jsonResult } from './_format.js';
import * as chart from '../core/chart.js';

export function registerChartTools(server) {
  server.tool('tvx_chart_state', 'Get current chart symbol, timeframe, chart type, and indicator list', {}, async () => {
    try { return jsonResult(await chart.getState()); }
    catch (err) { return jsonResult({ success: false, error: err.message }, true); }
  });

  server.tool('tvx_set_symbol', 'Change the TradingView chart symbol', {
    symbol: z.string().describe('Symbol to set (e.g., BTCUSD, AAPL, ES1!, NYMEX:CL1!)'),
  }, async ({ symbol }) => {
    try { return jsonResult(await chart.setSymbol(symbol)); }
    catch (err) { return jsonResult({ success: false, error: err.message }, true); }
  });

  server.tool('tvx_set_timeframe', 'Change the TradingView chart timeframe', {
    timeframe: z.string().describe('Timeframe (e.g., 1, 5, 15, 60, D, W, M)'),
  }, async ({ timeframe }) => {
    try { return jsonResult(await chart.setTimeframe(timeframe)); }
    catch (err) { return jsonResult({ success: false, error: err.message }, true); }
  });

  server.tool('tvx_set_chart_type', 'Change chart type (Candles, Line, HeikinAshi, etc.)', {
    chart_type: z.string().describe('Chart type name (Bars, Candles, Line, Area, Renko, Kagi, PointAndFigure, LineBreak, HeikinAshi, HollowCandles) or number 0-9'),
  }, async ({ chart_type }) => {
    try { return jsonResult(await chart.setType(chart_type)); }
    catch (err) { return jsonResult({ success: false, error: err.message }, true); }
  });

  server.tool('tvx_manage_indicator', 'Add or remove an indicator on the chart', {
    action: z.enum(['add', 'remove']).describe('add or remove'),
    indicator: z.string().describe('Full indicator name: "Relative Strength Index", "MACD", "Volume", "Moving Average", "Bollinger Bands". Short names like RSI/EMA do NOT work.'),
    entity_id: z.string().optional().describe('Study entity ID to remove (from tvx_chart_state). Required for remove.'),
    inputs: z.string().optional().describe('JSON string of input overrides, e.g. \'{"length": 20}\''),
  }, async ({ action, indicator, entity_id, inputs }) => {
    try { return jsonResult(await chart.manageIndicator({ action, indicator, entity_id, inputs })); }
    catch (err) { return jsonResult({ success: false, error: err.message }, true); }
  });

  server.tool('tvx_symbol_search', 'Search for symbols by name or keyword', {
    query: z.string().describe('Search query (e.g., "AAPL", "bitcoin", "ES")'),
    type: z.string().optional().describe('Filter by type (stock, futures, crypto, forex)'),
  }, async ({ query, type }) => {
    try { return jsonResult(await chart.symbolSearch({ query, type })); }
    catch (err) { return jsonResult({ success: false, error: err.message }, true); }
  });

  server.tool('tvx_screenshot', 'Take a screenshot of the TradingView chart', {
    region: z.string().optional().describe('Region: full (default), chart, strategy_tester'),
    filename: z.string().optional().describe('Custom filename without extension'),
    method: z.string().optional().describe('Capture method: cdp (default) or api'),
  }, async ({ region, filename, method }) => {
    try { return jsonResult(await chart.captureScreenshot({ region, filename, method })); }
    catch (err) { return jsonResult({ success: false, error: err.message }, true); }
  });
}
