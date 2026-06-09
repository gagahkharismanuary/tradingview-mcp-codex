import { evaluate, evaluateAsync, safeString } from '../connection.js';
import { waitForChartReady } from '../wait.js';

const CHART_API = 'window.TradingViewApi._activeChartWidgetWV.value()';

const CHART_TYPE_MAP = {
  Bars: 0, Candles: 1, Line: 2, Area: 3,
  Renko: 4, Kagi: 5, PointAndFigure: 6, LineBreak: 7,
  HeikinAshi: 8, HollowCandles: 9,
};

export async function getState() {
  const state = await evaluate(`
    (function() {
      var chart = ${CHART_API};
      var studies = [];
      try {
        studies = chart.getAllStudies().map(function(s) {
          return { id: s.id, name: s.name || s.title || 'unknown' };
        });
      } catch(e) {}
      return {
        symbol: chart.symbol(),
        resolution: chart.resolution(),
        chartType: chart.chartType(),
        studies: studies,
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

export async function setType(chart_type) {
  const typeNum = CHART_TYPE_MAP[chart_type] ?? Number(chart_type);
  if (!Number.isInteger(typeNum) || typeNum < 0 || typeNum > 9) {
    throw new Error(`Unknown chart type: ${chart_type}. Use name (Candles, Line, etc.) or number 0-9.`);
  }
  await evaluate(`
    (function() {
      var chart = ${CHART_API};
      chart.setChartType(${typeNum});
    })()
  `);
  return { success: true, chart_type, type_num: typeNum };
}

export async function manageIndicator({ action, indicator, entity_id, inputs: inputsRaw }) {
  const inputs = inputsRaw ? (typeof inputsRaw === 'string' ? JSON.parse(inputsRaw) : inputsRaw) : undefined;

  if (action === 'add') {
    const inputArr = inputs ? Object.entries(inputs).map(([k, v]) => ({ id: k, value: v })) : [];
    const before = await evaluate(`${CHART_API}.getAllStudies().map(function(s) { return s.id; })`);
    await evaluate(`
      (function() {
        var chart = ${CHART_API};
        chart.createStudy(${safeString(indicator)}, false, false, ${JSON.stringify(inputArr)});
      })()
    `);
    await new Promise(r => setTimeout(r, 1500));
    const after = await evaluate(`${CHART_API}.getAllStudies().map(function(s) { return s.id; })`);
    const newIds = (after || []).filter(id => !(before || []).includes(id));
    return { success: newIds.length > 0, action: 'add', indicator, entity_id: newIds[0] || null };
  }

  if (action === 'remove') {
    if (!entity_id) throw new Error('entity_id required for remove. Use tvx_chart_state to find study IDs.');
    await evaluate(`
      (function() {
        var chart = ${CHART_API};
        chart.removeEntity(${safeString(entity_id)});
      })()
    `);
    return { success: true, action: 'remove', entity_id };
  }

  throw new Error('action must be "add" or "remove"');
}

export async function symbolSearch({ query, type }) {
  const params = new URLSearchParams({
    text: query,
    hl: '1',
    exchange: '',
    lang: 'en',
    search_type: type || '',
    domain: 'production',
  });
  const resp = await fetch(`https://symbol-search.tradingview.com/symbol_search/v3/?${params}`, {
    headers: { Origin: 'https://www.tradingview.com', Referer: 'https://www.tradingview.com/' },
  });
  if (!resp.ok) throw new Error(`Symbol search returned ${resp.status}`);
  const data = await resp.json();
  const strip = s => (s || '').replace(/<\/?em>/g, '');
  const results = (data.symbols || data || []).slice(0, 15).map(r => ({
    symbol: strip(r.symbol),
    description: strip(r.description),
    exchange: r.exchange || r.prefix || '',
    type: r.type || '',
    full_name: r.exchange ? `${r.exchange}:${strip(r.symbol)}` : strip(r.symbol),
  }));
  return { success: true, query, results, count: results.length };
}

export async function captureScreenshot({ region, filename, method } = {}) {
  const { getClient } = await import('../connection.js');

  const ts = new Date().toISOString().replace(/[:.]/g, '-');
  const fname = (filename || `tv_${region || 'full'}_${ts}`).replace(/[/\\]/g, '_');
  const { writeFileSync, mkdirSync } = await import('node:fs');
  const { join, dirname } = await import('node:path');
  const { fileURLToPath } = await import('node:url');
  const __dirname = dirname(fileURLToPath(import.meta.url));
  const screenshotDir = join(dirname(dirname(__dirname)), 'screenshots');
  mkdirSync(screenshotDir, { recursive: true });
  const filePath = join(screenshotDir, `${fname}.png`);

  if (method === 'api') {
    try {
      await evaluate(`
        (function() {
          var col = window.TradingViewApi.chartWidgetCollection;
          if (col && col.takeScreenshot) col.takeScreenshot();
        })()
      `);
      return { success: true, method: 'api', note: 'takeScreenshot() triggered via TradingView UI' };
    } catch {}
  }

  const client = await getClient();
  let clip;

  if (region === 'chart') {
    const bounds = await evaluate(`
      (function() {
        var el = document.querySelector('[data-name="pane-canvas"]')
          || document.querySelector('[class*="chart-container"]')
          || document.querySelector('canvas');
        if (!el) return null;
        var r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      })()
    `);
    if (bounds) clip = { ...bounds, scale: 1 };
  } else if (region === 'strategy_tester') {
    const bounds = await evaluate(`
      (function() {
        var el = document.querySelector('[data-name="backtesting"]')
          || document.querySelector('[class*="strategyReport"]');
        if (!el) return null;
        var r = el.getBoundingClientRect();
        return { x: r.x, y: r.y, width: r.width, height: r.height };
      })()
    `);
    if (bounds) clip = { ...bounds, scale: 1 };
  }

  const params = { format: 'png' };
  if (clip) params.clip = clip;
  const { data } = await client.Page.captureScreenshot(params);
  writeFileSync(filePath, Buffer.from(data, 'base64'));

  return {
    success: true, method: 'cdp', file_path: filePath, region: region || 'full',
    size_bytes: Buffer.from(data, 'base64').length,
  };
}
