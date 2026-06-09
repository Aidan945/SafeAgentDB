import { readFileSync, existsSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import process from 'node:process';

const CONFIG_PATH = process.env.BRANCHING_CONFIG_PATH || 'branching-config.json';
const config = existsSync(CONFIG_PATH) ? JSON.parse(readFileSync(CONFIG_PATH, 'utf8')) : {};
const parentProjectRef = process.env.SUPABASE_PARENT_PROJECT_REF || config.supabase?.parentProjectRef;
const developBranchName = process.env.SUPABASE_DEVELOP_BRANCH_NAME || config.supabase?.developBranchName || 'develop';
const vercelScope = process.env.VERCEL_SCOPE || config.vercel?.scope;
const vercelProjectName = process.env.VERCEL_PROJECT_NAME || config.vercel?.projectName;
const githubRepository = process.env.GITHUB_REPOSITORY || config.github?.repository;
const envNames = Object.values({
  supabaseUrl: config.envKeys?.supabaseUrl || 'NEXT_PUBLIC_SUPABASE_URL',
  supabaseAnonKey: config.envKeys?.supabaseAnonKey || 'NEXT_PUBLIC_SUPABASE_ANON_KEY',
  supabaseServiceRoleKey: config.envKeys?.supabaseServiceRoleKey || 'SUPABASE_SERVICE_ROLE_KEY',
});

function run(command, args) {
  const result = spawnSync(command, args, {
    encoding: 'utf8',
    shell: process.platform === 'win32',
    env: process.env,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  if (result.error) throw new Error(`${command} ${args.join(' ')} failed to start: ${result.error.message}`);
  if (result.status !== 0) throw new Error(`${command} ${args.join(' ')} failed:\n${result.stdout || ''}\n${result.stderr || ''}`);
  return result.stdout || '';
}

function npx(args) {
  return run(process.platform === 'win32' ? 'npx.cmd' : 'npx', args);
}

function supabase(args) {
  return npx(['supabase', ...args]);
}

let vercelLinked = false;

function ensureVercelLinked() {
  if (vercelLinked || !process.env.VERCEL_TOKEN || !vercelProjectName) return;
  const args = ['vercel', 'link', '--yes', '--project', vercelProjectName];
  if (vercelScope) args.push('--scope', vercelScope);
  npx(args);
  vercelLinked = true;
}

function jsonArray(output) {
  const first = output.indexOf('[');
  const last = output.lastIndexOf(']');
  if (first === -1 || last <= first) return [];
  return JSON.parse(output.slice(first, last + 1));
}

async function githubBranchExists(branchName) {
  if (!process.env.GITHUB_TOKEN) throw new Error('Missing GITHUB_TOKEN');
  if (!githubRepository) throw new Error('Missing GITHUB_REPOSITORY or branching-config.json github.repository.');
  const response = await fetch(
    `https://api.github.com/repos/${githubRepository}/branches/${encodeURIComponent(branchName)}`,
    {
      headers: {
        authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
        accept: 'application/vnd.github+json',
      },
    },
  );
  if (response.status === 404) return false;
  if (!response.ok) throw new Error(`GitHub branch lookup failed for ${branchName}: ${response.status} ${await response.text()}`);
  return true;
}

function removeVercelEnv(name, gitBranch) {
  if (!process.env.VERCEL_TOKEN) return;
  ensureVercelLinked();
  const args = ['vercel', 'env', 'rm', name, 'preview', gitBranch, '--yes'];
  if (vercelScope) args.push('--scope', vercelScope);
  try {
    npx(args);
  } catch (error) {
    if (!String(error.message).includes('not found')) {
      console.log(`Vercel env cleanup warning for ${name} (${gitBranch}):\n${error.message}`);
    }
  }
}

async function main() {
  if (!parentProjectRef) throw new Error('Missing SUPABASE_PARENT_PROJECT_REF or branching-config.json supabase.parentProjectRef.');
  if (!process.env.SUPABASE_ACCESS_TOKEN) throw new Error('Missing SUPABASE_ACCESS_TOKEN');
  const branches = jsonArray(supabase(['branches', 'list', '--project-ref', parentProjectRef, '-o', 'json']));
  const previews = branches.filter((branch) => (
    !branch.is_default &&
    branch.name !== developBranchName &&
    branch.git_branch
  ));

  for (const branch of previews) {
    const exists = await githubBranchExists(branch.git_branch);
    if (exists) {
      console.log(`Keeping ${branch.name}: Git branch ${branch.git_branch} exists`);
      continue;
    }

    console.log(`Deleting orphan Supabase branch ${branch.name}; Git branch ${branch.git_branch} no longer exists`);
    supabase(['branches', 'delete', branch.name, '--project-ref', parentProjectRef, '--yes']);
    for (const envName of envNames) removeVercelEnv(envName, branch.git_branch);
  }
}

main().catch((error) => {
  console.error(error.stack || error);
  process.exit(1);
});
