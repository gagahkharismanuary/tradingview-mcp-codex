import CDP from 'chrome-remote-interface';

const HOST = '127.0.0.1';
const PORT = 9222;
let client = null;
let targetInfo = null;

export function safeString(value) {
  return JSON.stringify(String(value));
}

export async function findChartTarget() {
  const response = await fetch(`http://${HOST}:${PORT}/json/list`);
  if (!response.ok) throw new Error(`CDP target list returned ${response.status}`);
  const targets = await response.json();
  return targets.find((target) => target.type === 'page' && /tradingview\.com\/chart/i.test(target.url))
    || targets.find((target) => target.type === 'page' && /tradingview/i.test(target.url))
    || null;
}

export async function connect() {
  const target = await findChartTarget();
  if (!target) throw new Error('No TradingView chart target found');
  targetInfo = target;
  client = await CDP({ host: HOST, port: PORT, target: target.id });
  await client.Runtime.enable();
  await client.Page.enable();
  await client.DOM.enable();
  return client;
}

export async function getClient() {
  if (client) {
    try {
      await client.Runtime.evaluate({ expression: '1', returnByValue: true });
      return client;
    } catch {
      client = null;
      targetInfo = null;
    }
  }
  return connect();
}

export async function getTargetInfo() {
  if (!targetInfo) await getClient();
  return targetInfo;
}

export async function evaluate(expression, options = {}) {
  const runtimeClient = await getClient();
  const result = await runtimeClient.Runtime.evaluate({
    expression,
    returnByValue: true,
    awaitPromise: options.awaitPromise ?? false,
  });
  if (result.exceptionDetails) {
    const message = result.exceptionDetails.exception?.description
      || result.exceptionDetails.text
      || 'Unknown evaluation error';
    throw new Error(`JS evaluation error: ${message}`);
  }
  return result.result?.value;
}

export async function evaluateAsync(expression) {
  return evaluate(expression, { awaitPromise: true });
}

export async function disconnect() {
  if (!client) return;
  try {
    await client.close();
  } finally {
    client = null;
    targetInfo = null;
  }
}

export function cdpUrl() {
  return `http://${HOST}:${PORT}`;
}
