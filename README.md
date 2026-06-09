# SafeAgentDB

Database safety infrastructure for AFK agentic development.

SafeAgentDB lets multi-agent teams create branches and PRs that are easy to test on live preview URLs, each backed by an isolated database environment. Agents can run migrations, hydrate realistic data, and test real app behavior without risking production, corrupting the shared development database, or interfering with other agents.

Built first for **Supabase + Vercel + GitHub Actions**, with guidance for adapting the same infrastructure pattern to other stacks.

## For Users: Paste This Into Your AI Agent

Paste this into the agent working in your project:

```text
I want you to integrate SafeAgentDB into this project.

Read the README at:

https://github.com/Aidan945/SafeAgentDB

Then follow the main agent handoff file:

agent-handoff/main.md

First inspect my current project. Determine my framework, database, deployment platform, CI system, migration setup, environment variable setup, and branch model.

If my project uses Supabase, Vercel, and GitHub Actions, use the SafeAgentDB templates to set up safe local, develop, preview, and production database workflows.

If my project uses a different stack, do not blindly copy the templates. Use SafeAgentDB as a conceptual model, explain what needs to be adapted, and work with me to design the equivalent setup for my infrastructure.

Before making infrastructure changes, explain what credentials and permissions you need, why you need them, and where they will be stored. Do not commit secrets.
```

## For AI Agents: Start Here

If you are an AI agent reading this README, your next step is:

```text
Read agent-handoff/main.md
```

That file is the canonical setup entry point.

It will tell you:

- what to inspect first
- what credentials to ask for
- how to choose a data hydration policy
- when to use the default Supabase/Vercel/GitHub templates
- when to adapt the pattern to another stack
- which reference files to read next
- what done looks like

Do **not** start by copying templates. Start by understanding the target project.

## Why This Exists

AI agents can move fast, but database-backed apps are risky.

Without isolated database environments:

- Agents can accidentally point feature work at production.
- A bad migration can break a shared development database.
- Multiple agents can overwrite or corrupt each other's test data.
- Preview deployments may all share one staging database.
- Users cannot safely test PRs against realistic deployed behavior.
- Local database changes may not match cloud environments.

SafeAgentDB gives agents a safer operating model:

```text
main      -> production app + production database
develop   -> staging app + persistent develop database
feature/* -> preview app + isolated preview database
agent/*   -> preview app + isolated preview database
local     -> local app + local Docker database
```

## What It Enables

SafeAgentDB helps AI agents set up:

- Local database development
- Persistent development/staging databases
- Branch-specific preview databases
- Live preview URLs backed by isolated databases
- Migration checks before merge
- Preview-only feature migrations
- Production migration flow
- Optional realistic data hydration
- Optional auth user copying for previews
- Optional storage bucket copying
- Vercel preview environment variable wiring
- Preview redeploys after env changes
- Preview cleanup on PR close
- Orphan preview cleanup for deleted branches

The result: agents can work in parallel, publish PRs, and give users live URLs to test without touching production or shared development data.

## Default Stack

The default templates are built for:

- **Supabase** for Postgres, Auth, Storage, migrations, and database branches
- **Vercel** for production, staging, and preview deployments
- **GitHub Actions** for branch and PR automation

If your project uses a different database, deployment platform, or CI provider, SafeAgentDB should be treated as a conceptual model. The AI agent should inspect your codebase, explain what needs to change, and adapt the pattern to your infrastructure.

## How It Works

SafeAgentDB gives the AI agent one main setup document:

```text
agent-handoff/main.md
```

That file references supporting docs only when needed:

```text
agent-handoff/references/
```

Templates live in:

```text
templates/
```

The agent should use those templates only after inspecting your project and confirming the setup with you.

## Data Hydration Policy

SafeAgentDB supports different ways to populate preview databases.

Recommended default:

```text
production/default schema -> persistent develop
persistent develop data   -> feature/agent previews
local Docker Supabase     -> migrations + seed only
```

The agent should ask before copying any real data.

Depending on your project, previews can use:

- synthetic seed data
- scrubbed data
- copied development data
- selected public tables
- selected auth users with preview passwords
- selected storage buckets

Production data should not be copied into previews unless you explicitly approve it and confirm privacy/compliance requirements.

## Credentials

For full automation, the AI agent may ask for:

- Vercel access token
- Vercel project name, project ID, and team/user scope
- Supabase access token
- Supabase production/default project ref
- Supabase develop branch ref/name
- GitHub authentication or token
- permission to install or run Supabase CLI and Vercel CLI
- preview user password, only if copying auth users into previews

The agent should explain why each credential is needed before asking for it.

Secrets should be stored in GitHub Actions secrets, Vercel environment variables, Supabase settings, or local CLI auth. They should never be committed to the repo.

## Project Structure

```text
agent-handoff/
  main.md
  references/
    setup-process.md
    credentials.md
    data-hydration-policy.md
    local-development.md
    non-standard-stacks.md
    agent-operating-rules.md

templates/
  branching-config.example.json
  package-scripts.json
  package-dev-dependencies.json
  scripts/
    supabase/
    ci/
  .github/
    workflows/
```

## What The Templates Include

The default templates include:

- Supabase branch provisioning
- Supabase preview branch cleanup
- orphan preview branch cleanup
- local Supabase env switching
- migration application
- migration safety checks
- GitHub Actions for preview branches
- GitHub Actions for migration deployment
- GitHub Actions for orphan cleanup
- package scripts
- example config

## Safety Principles

SafeAgentDB is built around a few rules:

- Never point agent feature work at production.
- Never let multiple agents share one mutable preview database.
- Never apply feature migrations to shared development until merge.
- Never copy production data into previews without explicit approval.
- Always test migrations locally or in preview before shared environments.
- Keep production, develop, preview, and local environments separate.
- Clean up preview databases when branches are closed or deleted.

## Status

SafeAgentDB is an agent-assisted infrastructure kit. It is not a one-click SaaS product.

It gives your AI agent the docs, templates, and guardrails needed to set up safer database workflows in your project with your approval.

The default implementation targets Supabase, Vercel, and GitHub Actions. Other stacks require adaptation.
