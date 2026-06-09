import { readdirSync, readFileSync } from 'node:fs';

function parseArgs(argv) {
  const args = { _: [] };
  for (let i = 2; i < argv.length; i += 1) {
    const part = argv[i];
    if (!part.startsWith('--')) {
      args._.push(part);
      continue;
    }
    const key = part.slice(2);
    args[key] = argv[i + 1] && !argv[i + 1].startsWith('--') ? argv[++i] : 'true';
  }
  return args;
}

function checkDuplicateTimestamps() {
  const files = readdirSync('supabase/migrations').filter((file) => file.endsWith('.sql'));
  const byTimestamp = new Map();

  for (const file of files) {
    const timestamp = file.split('_')[0];
    if (!/^\d{14}$/.test(timestamp)) throw new Error(`Migration file does not start with a 14-digit timestamp: ${file}`);
    byTimestamp.set(timestamp, [...(byTimestamp.get(timestamp) || []), file]);
  }

  const duplicates = [...byTimestamp.entries()].filter(([, entries]) => entries.length > 1);
  if (duplicates.length > 0) {
    const details = duplicates.map(([timestamp, entries]) => `${timestamp}: ${entries.join(', ')}`).join('\n');
    throw new Error(`Duplicate migration timestamp prefixes found:\n${details}`);
  }
}

function changedMigrationFiles(raw) {
  return String(raw || '')
    .split(/\s+/)
    .map((file) => file.trim())
    .filter((file) => file.startsWith('supabase/migrations/') && file.endsWith('.sql'));
}

function checkDestructiveSql(files, labels) {
  if (files.length === 0) return;
  if (labels.split(',').map((label) => label.trim()).includes('migration-reviewed')) {
    console.log('Destructive migration scan bypassed by migration-reviewed label.');
    return;
  }

  const patterns = [
    /\bdrop\s+table\b/i,
    /\bdrop\s+column\b/i,
    /\btruncate\b/i,
    /\bdelete\s+from\b/i,
    /\bupdate\s+[^;]+\s+set\b/i,
    /\balter\s+table\b[\s\S]*\balter\s+column\b[\s\S]*\bset\s+not\s+null\b/i,
  ];

  const findings = [];
  for (const file of files) {
    const sql = readFileSync(file, 'utf8');
    for (const pattern of patterns) {
      if (pattern.test(sql)) findings.push(`${file}: matched ${pattern}`);
    }
  }

  if (findings.length > 0) {
    throw new Error(
      `Potentially destructive migration SQL found.\n` +
      `Add the migration-reviewed label after human review to allow this PR.\n\n` +
      findings.join('\n'),
    );
  }
}

try {
  const args = parseArgs(process.argv);
  checkDuplicateTimestamps();
  checkDestructiveSql(changedMigrationFiles(args.changed), process.env.PR_LABELS || '');
  console.log('Migration checks passed.');
} catch (error) {
  console.error(error.message || error);
  process.exit(1);
}
