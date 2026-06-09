import { readdirSync, readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import process from 'node:process';
import { Client } from 'pg';

const CONFIG_PATH = process.env.BRANCHING_CONFIG_PATH || 'branching-config.json';
const config = existsSync(CONFIG_PATH) ? JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) : {};
const parentProjectRef = process.env.SUPABASE_PARENT_PROJECT_REF || config.supabase?.parentProjectRef;
const defaultBranchName = process.env.SUPABASE_BRANCH_NAME || config.supabase?.developBranchName || 'develop';

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed:\n${result.stdout || ''}\n${result.stderr || ''}`);
  return result.stdout || '';
}

function supabase(args) {
  return run(process.platform === 'win32' ? 'npx.cmd' : 'npx', ['supabase', ...args]);
}

function parseJson(output) {
  const first = output.indexOf('{');
  const last = output.lastIndexOf('}');
  if (first === -1 || last <= first) throw new Error(`Could not parse JSON:\n${output}`);
  return JSON.parse(output.slice(first, last + 1));
}

function databaseUrlForBranch(branchName) {
  if (process.env.DATABASE_URL) return process.env.DATABASE_URL;
  if (!parentProjectRef) throw new Error('Missing SUPABASE_PARENT_PROJECT_REF or DATABASE_URL.');
  const branch = parseJson(supabase(['branches', 'get', branchName, '--project-ref', parentProjectRef, '-o', 'json']));
  return branch.POSTGRES_URL;
}

async function pendingMigrationFiles(client) {
  await client.query('set role postgres');
  const { rows } = await client.query('select version from supabase_migrations.schema_migrations');
  const applied = new Set(rows.map((row) => row.version));
  return readdirSync('supabase/migrations')
    .filter((file) => file.endsWith('.sql'))
    .sort()
    .filter((file) => {
      const match = file.match(/^(\d+)_(.+)\.sql$/);
      return match && !applied.has(match[1]);
    });
}

async function main() {
  const branchName = process.argv[2] || defaultBranchName;
  const dryRun = process.argv.includes('--dry-run') || process.argv.includes('dry-run');
  const client = new Client({ connectionString: databaseUrlForBranch(branchName), ssl: { rejectUnauthorized: false } });
  await client.connect();

  const pending = await pendingMigrationFiles(client);
  if (pending.length === 0) {
    console.log('No pending migrations.');
    await client.end();
    return;
  }

  console.log(`${dryRun ? 'Would apply' : 'Applying'} migrations to ${branchName}:`);
  for (const file of pending) console.log(` - ${file}`);
  if (dryRun) {
    await client.end();
    return;
  }

  for (const file of pending) {
    const match = file.match(/^(\d+)_(.+)\.sql$/);
    const sql = readFileSync(`supabase/migrations/${file}`, 'utf8');
    await client.query('begin');
    try {
      await client.query(sql);
      await client.query(
        'insert into supabase_migrations.schema_migrations(version, statements, name) values ($1, $2, $3) on conflict (version) do nothing',
        [match[1], [sql], match[2]],
      );
      await client.query('commit');
    } catch (error) {
      await client.query('rollback');
      throw error;
    }
  }

  await client.end();
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
