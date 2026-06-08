import { cdpUrl, evaluate, getClient, getTargetInfo } from '../connection.js';
import { existsSync } from 'node:fs';
import { execSync, spawn } from 'node:child_process';

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
    try {
      if (platform === 'win32') execSync('taskkill /F /IM TradingView.exe', { timeout: 5000 });
      else execSync('pkill -f TradingView', { timeout: 5000 });
      await new Promise((resolve) => setTimeout(resolve, 1200));
    } catch {}
  }

  const child = spawn(binary, [`--remote-debugging-port=${port}`], {
    detached: true,
    stdio: 'ignore',
  });
  child.unref();

  return {
    success: true,
    binary,
    pid: child.pid,
    cdp_port: port,
    hint: 'Wait few seconds, then run tvx status',
  };
}
