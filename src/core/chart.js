import { evaluate, evaluateAsync, safeString } from '../connection.js';
import { waitForChartReady } from '../wait.js';

const CHART_API = 'window.TradingViewApi._activeChartWidgetWV.value()';

export async function getState() {
  const state = await evaluate(`
    (function() {
      var chart = ${CHART_API};
      return {
        symbol: chart.symbol(),
        resolution: chart.resolution(),
        chartType: chart.chartType()
      };
    })()
  `);
  return { success: true, ...state };
}

export async function setSymbol(symbol) {
  await evaluateAsync(`
    (function() {
      var chart = ${CHART_API};
      return new Promise(function(resolve) {
        chart.setSymbol(${safeString(symbol)}, {});
        setTimeout(resolve, 500);
      });
    })()
  `);
  const chartReady = await waitForChartReady(symbol, null);
  return { success: true, symbol, chart_ready: chartReady };
}

export async function setTimeframe(timeframe) {
  await evaluate(`
    (function() {
      var chart = ${CHART_API};
      chart.setResolution(${safeString(timeframe)}, {});
    })()
  `);
  const chartReady = await waitForChartReady(null, timeframe);
  return { success: true, timeframe, chart_ready: chartReady };
}
