import { execFileSync, spawnSync } from 'node:child_process';
import { existsSync, readFileSync, writeFileSync } from 'node:fs';
import process from 'node:process';

const CONFIG_PATH = process.env.BRANCHING_CONFIG_PATH || 'branching-config.json';
const DEFAULT_CONFIG = {
  productionBranch: 'main',
  developBranch: 'develop',
  previewBranchPrefixes: ['feature/', 'agent/'],
  supabase: {
    parentProjectRef: process.env.SUPABASE_PARENT_PROJECT_REF,
    developBranchName: process.env.SUPABASE_DEVELOP_BRANCH_NAME || 'develop',
  },
  envKeys: {
    supabaseUrl: 'NEXT_PUBLIC_SUPABASE_URL',
    supabaseAnonKey: 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    supabaseServiceRoleKey: 'SUPABASE_SERVICE_ROLE_KEY',
  },
};

function readConfig() {
  if (!existsSync(CONFIG_PATH)) return DEFAULT_CONFIG;
  return { ...DEFAULT_CONFIG, ...JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) };
}

const config = readConfig();
const SUPABASE_KEYS = Object.values(config.envKeys);

function npxCommand() {
  return process.platform === 'win32' ? 'npx.cmd' : 'npx';
}

function supabase(args) {
  const result = spawnSync(npxCommand(), ['supabase', ...args], {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.status !== 0) {
    throw new Error(`supabase ${args.join(' ')} failed:\n${result.stdout || ''}\n${result.stderr || ''}`);
  }
  return result.stdout || '';
}

function parseJson(output) {
  const first = output.search(/[\[{]/);
  const lastObject = output.lastIndexOf('}');
  const lastArray = output.lastIndexOf(']');
  const last = Math.max(lastObject, lastArray);
  if (first === -1 || last <= first) throw new Error(`Could not parse JSON:\n${output}`);
  return JSON.parse(output.slice(first, last + 1));
}

function currentGitBranch() {
  return execFileSync('git', ['branch', '--show-current'], { encoding: 'utf8' }).trim();
}

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '').slice(0, 45);
}

function findSupabaseBranch(gitBranch) {
  if (gitBranch === config.developBranch) {
    return { name: config.supabase.developBranchName, projectRef: config.supabase.parentProjectRef };
  }

  const branches = parseJson(supabase(['branches', 'list', '--project-ref', config.supabase.parentProjectRef, '-o', 'json']));
  const expectedName = `${config.preview?.namePrefix || 'preview-'}${slugify(gitBranch)}`;
  const branch = branches.find((candidate) => candidate.git_branch === gitBranch || candidate.name === expectedName);

  if (!branch) {
    throw new Error(`No Supabase preview branch found for "${gitBranch}". Provision it first, then rerun this command.`);
  }

  return { name: branch.name, projectRef: config.supabase.parentProjectRef };
}

function getBranchDetails({ name, projectRef }) {
  return parseJson(supabase(['branches', 'get', name, '--project-ref', projectRef, '-o', 'json']));
}

function getStatusValue(status, keyNames) {
  const targets = new Set(keyNames.map((key) => key.toLowerCase().replace(/[^a-z0-9]/g, '')));
  for (const [key, value] of Object.entries(status)) {
    const normalized = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (targets.has(normalized) && value) return value;
  }
  throw new Error(`Could not find ${keyNames[0]} in local Supabase status output.`);
}

function getLocalDetails() {
  let status;
  try {
    status = parseJson(supabase(['status', '-o', 'json']));
  } catch (error) {
    throw new Error(`Could not read local Supabase status. Run \`supabase start\` first.\n${error.message || error}`);
  }

  return {
    SUPABASE_URL: getStatusValue(status, ['API URL', 'api_url', 'api.url']),
    SUPABASE_ANON_KEY: getStatusValue(status, ['anon key', 'anon_key', 'ANON_KEY']),
    SUPABASE_SERVICE_ROLE_KEY: getStatusValue(status, ['service_role key', 'service_role_key', 'SERVICE_ROLE_KEY']),
  };
}

function parseEnvFile(content) {
  const lines = content.split(/\r?\n/);
  const seenKeys = new Set();
  for (const line of lines) {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (match) seenKeys.add(match[1]);
  }
  return { lines, seenKeys };
}

function quoteEnvValue(value) {
  if (/^[A-Za-z0-9_:/?&.=+-]+$/.test(value)) return value;
  return JSON.stringify(value);
}

function updateEnvLocal(values) {
  const path = '.env.local';
  const existing = existsSync(path) ? readFileSync(path, 'utf8') : '';
  const { lines, seenKeys } = parseEnvFile(existing);
  const nextLines = lines.map((line) => {
    const match = line.match(/^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=/);
    if (!match || !SUPABASE_KEYS.includes(match[1])) return line;
    return `${match[1]}=${quoteEnvValue(values[match[1]])}`;
  });
  const missingLines = SUPABASE_KEYS.filter((key) => !seenKeys.has(key)).map((key) => `${key}=${quoteEnvValue(values[key])}`);
  writeFileSync(path, `${[...nextLines.filter(Boolean), ...missingLines].join('\n').replace(/\n+$/, '')}\n`);
}

function main() {
  const mode = process.argv[2] || 'status';

  if (mode === 'status') {
    console.log(existsSync('.env.local') ? readFileSync('.env.local', 'utf8').match(/^NEXT_PUBLIC_SUPABASE_URL=(.*)$/m)?.[1] || '(not set)' : '(not set)');
    return;
  }

  if (mode === 'local') {
    const details = getLocalDetails();
    updateEnvLocal({
      [config.envKeys.supabaseUrl]: details.SUPABASE_URL,
      [config.envKeys.supabaseAnonKey]: details.SUPABASE_ANON_KEY,
      [config.envKeys.supabaseServiceRoleKey]: details.SUPABASE_SERVICE_ROLE_KEY,
    });
    console.log(`.env.local now points to local Supabase: ${details.SUPABASE_URL}`);
    return;
  }

  const currentBranch = currentGitBranch();
  const gitBranch = mode === 'develop' ? config.developBranch : mode === 'auto' || mode === 'current' ? currentBranch : (process.argv[3] || mode || currentBranch);
  const branch = findSupabaseBranch(gitBranch);
  const details = getBranchDetails(branch);

  updateEnvLocal({
    [config.envKeys.supabaseUrl]: details.SUPABASE_URL,
    [config.envKeys.supabaseAnonKey]: details.SUPABASE_ANON_KEY,
    [config.envKeys.supabaseServiceRoleKey]: details.SUPABASE_SERVICE_ROLE_KEY,
  });

  console.log(`.env.local now points to Supabase branch "${branch.name}" for Git branch "${gitBranch}".`);
}

try {
  main();
} catch (error) {
  if ((process.argv[2] || 'status') === 'auto') {
    console.warn(`Skipping Supabase env auto-switch: ${error.message || error}`);
    console.warn('Continuing with existing .env / .env.local values.');
    process.exit(0);
  }
  console.error(error.message || error);
  process.exit(1);
}
