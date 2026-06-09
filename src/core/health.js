import { cdpUrl, disconnect, evaluate, getClient, getTargetInfo } from '../connection.js';
import { existsSync } from 'node:fs';
import { execSync, spawn } from 'node:child_process';

function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isChartTarget(target) {
  return target?.type === 'page' && /tradingview\.com\/chart/i.test(target.url || '');
}

async function isCdpReady(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/json/version`);
    return response.ok;
  } catch {
    return false;
  }
}

async function waitForCdp(port, timeoutMs = 15000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isCdpReady(port)) return true;
    await sleep(500);
  }
  return false;
}

async function isChartReady(port) {
  try {
    const response = await fetch(`http://127.0.0.1:${port}/json/list`);
    if (!response.ok) return false;
    const targets = await response.json();
    return targets.some(isChartTarget);
  } catch {
    return false;
  }
}

async function waitForChart(port, timeoutMs = 30000) {
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    if (await isChartReady(port)) return true;
    await sleep(500);
  }
  return false;
}

async function getChartSnapshot() {
  try {
    await disconnect();
    return await evaluate(`
      (function() {
        try {
          var chart = window.TradingViewApi._activeChartWidgetWV.value();
          return {
            apiAvailable: true,
            symbol: chart.symbol(),
            resolution: chart.resolution(),
            chartType: chart.chartType()
          };
        } catch (error) {
          return { apiAvailable: false, error: error.message };
        }
      })()
    `);
  } catch {
    return null;
  }
}

function isStableSnapshot(snapshot) {
  return Boolean(snapshot?.apiAvailable && snapshot?.symbol && snapshot?.resolution);
}

async function waitForChartApi(timeoutMs = 30000) {
  let previousKey = null;
  let stableCount = 0;
  const startedAt = Date.now();
  while (Date.now() - startedAt < timeoutMs) {
    const snapshot = await getChartSnapshot();
    const currentKey = isStableSnapshot(snapshot)
      ? JSON.stringify([snapshot.symbol, snapshot.resolution, snapshot.chartType])
      : null;

    if (currentKey && currentKey === previousKey) {
      stableCount += 1;
    } else {
      stableCount = currentKey ? 1 : 0;
      previousKey = currentKey;
    }

    if (stableCount >= 4) return true;
    await sleep(500);
  }
  return false;
}

function killExistingTradingView(platform) {
  try {
    if (platform === 'win32') {
      execSync('taskkill /F /T /IM TradingView.exe', { timeout: 10000, stdio: 'ignore' });
      return;
    }
    execSync('pkill -9 -f TradingView', { timeout: 10000, stdio: 'ignore' });
  } catch {}
}

export async function healthCheck() {
  await getClient();
  const target = await getTargetInfo();
  const state = await evaluate(`
    (function() {
      var result = { url: window.location.href, title: document.title };
      try {
        var chart = window.TradingViewApi._activeChartWidgetWV.value();
        result.symbol = chart.symbol();
        result.resolution = chart.resolution();
        result.chartType = chart.chartType();
        result.apiAvailable = true;
      } catch (error) {
        result.symbol = 'unknown';
        result.resolution = 'unknown';
        result.chartType = null;
        result.apiAvailable = false;
        result.apiError = error.message;
      }
      return result;
    })()
  `);

  return {
    success: true,
    cdp_connected: true,
    cdp_url: cdpUrl(),
    target_id: target.id,
    target_url: target.url,
    target_title: target.title,
    chart_symbol: state?.symbol || 'unknown',
    chart_resolution: state?.resolution || 'unknown',
    chart_type: state?.chartType ?? null,
    api_available: state?.apiAvailable ?? false,
  };
}

export async function launch({ port = 9222, killExisting = true } = {}) {
  const platform = process.platform;
  const pathMap = {
    darwin: [
      '/Applications/TradingView.app/Contents/MacOS/TradingView',
      `${process.env.HOME}/Applications/TradingView.app/Contents/MacOS/TradingView`,
    ],
    win32: [
      `${process.env.LOCALAPPDATA}\\TradingView\\TradingView.exe`,
      `${process.env.PROGRAMFILES}\\TradingView\\TradingView.exe`,
    ],
    linux: [
      '/opt/TradingView/tradingview',
      `${process.env.HOME}/.local/share/TradingView/TradingView`,
      '/usr/bin/tradingview',
    ],
  };

  const candidates = pathMap[platform] || pathMap.linux;
  const binary = candidates.find((candidate) => candidate && existsSync(candidate));
  if (!binary) {
    throw new Error(`TradingView not found. Launch manually with --remote-debugging-port=${port}`);
  }

  if (killExisting) {
    killExistingTradingView(platform);
    await sleep(2000);
  }

  const command = platform === 'darwin' ? 'open' : binary;
  const args = platform === 'darwin'
    ? ['-n', '-a', 'TradingView', '--args', `--remote-debugging-port=${port}`]
    : [`--remote-debugging-port=${port}`];

  const child = spawn(command, args, {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();

  const ready = await waitForCdp(port);
  if (!ready) {
    throw new Error(`TradingView launched but CDP port ${port} not ready`);
  }

  const chartReady = await waitForChart(port);
  if (!chartReady) {
    throw new Error(`TradingView launched but chart target not ready on port ${port}`);
  }

  const chartApiReady = await waitForChartApi();
  if (!chartApiReady) {
    throw new Error('TradingView launched but chart API not ready');
  }

  return {
    success: true,
    binary,
    pid: child.pid,
    cdp_port: port,
    hint: 'Chart target ready. Run tvx status',
  };
}
