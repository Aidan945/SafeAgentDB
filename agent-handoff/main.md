# Agent Handoff: Branch-Aware Database Infrastructure

This is the main entry point for an AI agent setting up branch-aware database infrastructure in a target project.

Read this file first. Then read only the referenced files that match the target project's situation.

## Mission

Set up or adapt a workflow where:

```text
main      -> production app + production database
develop   -> staging app + persistent develop database
feature/* -> preview app + isolated preview database
agent/*   -> preview app + isolated preview database
local     -> local app + local Docker database
```

This reference package was built for:

- Supabase for Postgres, Auth, Storage, migrations, and database branches
- Vercel for production, staging, and preview deployments
- GitHub Actions for branch and pull request automation

If the target project does not use this stack, this package is no longer prescriptive. Do not blindly copy the templates. Use your own understanding of the target codebase, the target platform's docs, and the user's judgment to design the equivalent infrastructure. Explain what this package does not cover, what assumptions no longer apply, and what decisions the user needs to make before editing.

## Infrastructure Map

The reference architecture is made of these concepts:

```text
Git branch model
  main / develop / feature-* / agent-* / local

Database environment model
  production database
  persistent develop database
  disposable preview databases
  local Docker database

Migration model
  committed migration files
  local reset before push
  preview-only feature migrations
  develop migrations after merge
  production migrations from main

Preview deployment model
  create preview database
  hydrate or seed preview database
  set branch-scoped deployment env vars
  rebuild/redeploy preview app
  clean up preview database and env vars when branch closes

Credential model
  provider access tokens in secret stores
  non-secret project refs in config
  no committed service keys or local env files
```

Treat those concepts as the portable infrastructure. Supabase, Vercel, and GitHub Actions are the default implementation, not the only possible implementation.

## Porting To Other Stacks

If the target project uses a different stack, map each concept before editing:

```text
Supabase branches       -> database branch/clone/ephemeral DB equivalent
Supabase migrations     -> target project's migration system
Supabase Auth           -> target auth provider or user seed/copy process
Supabase Storage        -> target object storage provider
Vercel previews         -> target preview deployment system
Vercel branch env vars  -> target environment variable mechanism
GitHub Actions          -> target CI/CD runner and secret store
```

Read `references/non-standard-stacks.md`, explain the adaptation plan to the user, and only then implement. For non-standard stacks, the user's codebase and the user's preferences are the source of truth; this package only provides the conceptual model. If an equivalent does not exist, document the limitation and propose the closest safe workflow.

## Read These References

Always read:

- `references/setup-process.md` for the end-to-end install flow.
- `references/credentials.md` before asking the user for tokens or setting secrets.
- `references/data-hydration-policy.md` before creating develop or preview databases.

Read when relevant:

- `references/local-development.md` when adding local database development.
- `references/non-standard-stacks.md` if the target project is not Supabase + Vercel + GitHub Actions.
- `references/agent-operating-rules.md` when adding ongoing maintenance rules to the target project's README or deployment docs.
- `references/agent-packaging.md` if the user wants optional Cursor, Codex, or Claude Code skill/instruction packaging.

Use templates from:

- `../templates/branching-config.example.json`
- `../templates/package-scripts.json`
- `../templates/package-dev-dependencies.json`
- `../templates/scripts/supabase/`
- `../templates/scripts/ci/`
- `../templates/.github/workflows/`

## Required First Step

Inspect the target project before editing. Determine:

- framework and package manager
- deployment provider
- CI provider
- database provider
- auth provider
- storage provider
- existing branch model
- existing env var names
- whether `.env.local` is ignored
- whether Supabase CLI files exist: `supabase/config.toml`, `supabase/migrations/`, `supabase/seed.sql`
- whether migrations are committed or SQL is managed manually in a dashboard
- whether production, staging/develop, and preview environments already exist
- which database should initialize or hydrate persistent develop
- which database should hydrate feature/agent preview databases
- whether auth users, public table data, and storage objects should be copied into previews

After inspection, summarize the current state and proposed setup before making infrastructure changes.

## Credential Rule

Before running commands that require external access, explain what credentials are needed, why they are needed, where they will be stored, and ask the user for permission. Do not ask the user to paste secrets into committed files.

Read `references/credentials.md` for the exact checklist.

## Data Source Rule

Before implementing preview database hydration, ask the user to confirm the source-of-truth data policy.

Recommended default:

```text
production/default schema -> persistent develop
persistent develop data   -> feature/agent previews
local Docker Supabase     -> migrations + seed only
```

Do not copy production data into previews unless the user explicitly approves it and confirms privacy/compliance requirements.

Read `references/data-hydration-policy.md`.

## Install Or Adapt

Install or adapt:

- local database command that points env vars at local services without overwriting unrelated env values
- persistent develop/staging database workflow
- feature/agent preview database provisioning
- Vercel preview env-var wiring so each preview deployment points at its matching preview database
- preview redeploy behavior after env vars change, because frontend public env vars are build-time values
- migration deployment workflow for develop and main
- guardrails so feature migrations stay on feature previews until merge
- configurable data/auth/storage hydration policy for develop and preview databases
- optional auth user copying with preview password reset
- optional public table data copying with include/exclude lists
- optional storage bucket creation and object copying
- cleanup automation for closed or deleted preview branches
- scheduled orphan preview cleanup for deleted Git branches
- migration safety checks for duplicate timestamps and destructive SQL
- docs for setup, secrets, branch model, local development, rollback, and agent operating rules
- optional agent packaging as a Cursor/Codex/Claude Code skill or project instruction file, only if the user wants it

## Important Rules

- Never commit `.env.local`, service role keys, access tokens, preview passwords, or production secrets.
- Never hardcode this reference package's sample values into the target project.
- Preserve existing workflows unless they conflict and the user approves replacement.
- Do not apply destructive migrations without explicit review.
- Do not apply feature-branch migrations to persistent develop until the feature merges.
- Keep local development independent from GitHub pushes.

## Done Criteria

When setup is complete, report:

- every file changed
- secrets and config values still required
- credentials used, where they were stored, and required permissions, without revealing secret values
- what database develop is initialized from
- what database previews are hydrated from
- whether auth users, public data, and storage are copied or seeded
- how to test local dev, develop/staging, feature preview, and production migration paths
- validation commands run and their results

Add a short "Agent Operating Rules" section to the target project's README or deployment docs. If the user explicitly wants Cursor, Codex, or Claude Code packaging, read `references/agent-packaging.md` and offer the appropriate optional skill or instruction-file install.

