import { evaluate } from './connection.js';

const CHART_API = 'window.TradingViewApi._activeChartWidgetWV.value()';

export async function waitForChartReady(expectedSymbol = null, expectedResolution = null, attempts = 20) {
  for (let index = 0; index < attempts; index += 1) {
    try {
      const state = await evaluate(`
        (function() {
          var chart = ${CHART_API};
          return {
            symbol: chart.symbol(),
            resolution: chart.resolution()
          };
        })()
      `);
      const symbolOk = expectedSymbol ? String(state?.symbol || '').includes(expectedSymbol) : true;
      const resolutionOk = expectedResolution ? String(state?.resolution || '') === String(expectedResolution) : true;
      if (symbolOk && resolutionOk) return true;
    } catch {}
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  return false;
}
