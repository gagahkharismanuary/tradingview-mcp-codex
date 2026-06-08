import { register } from '../router.js';
import * as health from '../../core/health.js';

register('status', {
  description: 'Check TradingView CDP connection',
  handler: () => health.healthCheck(),
});

register('launch', {
  description: 'Launch TradingView with remote debugging',
  options: {
    port: { type: 'string' },
    'no-kill': { type: 'boolean' },
  },
  handler: (options) => health.launch({
    port: options.port ? Number(options.port) : 9222,
    killExisting: !options['no-kill'],
  }),
});
