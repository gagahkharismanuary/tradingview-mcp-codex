#!/usr/bin/env node
import './commands/health.js';
import './commands/chart.js';
import { run } from './router.js';

await run(process.argv);
