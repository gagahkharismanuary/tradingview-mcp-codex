import { parseArgs } from 'node:util';

const commands = new Map();

export function register(name, config) {
  commands.set(name, config);
}

function help() {
  console.log('Usage: tvx <command> [options]');
  console.log('Commands:');
  for (const [name, config] of commands) {
    console.log(`  ${name}  ${config.description}`);
  }
}

function fail(error) {
  const message = error?.message || String(error);
  console.error(JSON.stringify({ success: false, error: message }, null, 2));
  process.exit(/CDP|connect|fetch|ECONNREFUSED/i.test(message) ? 2 : 1);
}

export async function run(argv) {
  const args = argv.slice(2);
  const name = args[0];
  if (!name || name === '--help' || name === '-h') {
    help();
    process.exit(0);
  }

  const command = commands.get(name);
  if (!command) {
    fail(new Error(`Unknown command: ${name}`));
  }

  try {
    const { values, positionals } = parseArgs({
      args: args.slice(1),
      options: command.options || {},
      allowPositionals: true,
      strict: false,
    });
    const result = await command.handler(values, positionals);
    console.log(JSON.stringify(result, null, 2));
    process.exit(0);
  } catch (error) {
    fail(error);
  }
}
