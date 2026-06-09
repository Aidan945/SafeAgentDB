# SafeAgentDB

Database safety infrastructure for AFK agentic development.

SafeAgentDB is built for serious vibe coders shipping real products with a team — whether your teammates are people, AI agents, or both. Once you have many branches in flight at the same time, one shared database becomes the thing everyone breaks. SafeAgentDB gives every branch and PR a live preview URL backed by its own isolated database, so agents can run migrations, hydrate realistic data, and test real app behavior without risking production, corrupting shared development data, or stepping on each other.

Built first for **Supabase + Vercel + GitHub Actions**, with guidance for adapting the same infrastructure pattern to other stacks.

## Install The Skill

Install SafeAgentDB with the open `skills` CLI:

```bash
npx skills add https://github.com/Aidan945/SafeAgentDB --skill safeagentdb
```

Shorthand:

```bash
npx skills add Aidan945/SafeAgentDB --skill safeagentdb
```

You can also target a specific agent:

```bash
npx skills add Aidan945/SafeAgentDB --skill safeagentdb --agent cursor
npx skills add Aidan945/SafeAgentDB --skill safeagentdb --agent codex
npx skills add Aidan945/SafeAgentDB --skill safeagentdb --agent claude-code
```

## Use The Skill

After installing, start your agent in the project where you want SafeAgentDB installed and say:

```text
Use the safeagentdb skill.

Inspect this project, then set up SafeAgentDB database safety infrastructure for it. Review your plan with me before making changes.
```

The skill handles the rest: inspecting your stack, adapting to non-default setups, asking before touching credentials, and never committing secrets.

## What SafeAgentDB Enables

SafeAgentDB helps AI agents set up:

- Local Docker database development
- A persistent develop/staging database
- Branch-specific preview databases with live preview URLs
- Safe migration flow: checks before merge, preview-only feature migrations, production deploys from main
- Optional hydration of realistic data, auth users, and storage into previews
- Vercel preview env wiring with automatic redeploys after env changes
- Cleanup on PR close plus scheduled orphan cleanup, with persistent design/demo environments skipped
- Dry-run provisioning and a committed branching architecture doc as the project's source of truth

The result: agents can work in parallel, publish PRs, and give users live URLs to test without touching production or shared development data.

## Default Stack

The default templates are built for:

- **Supabase** for Postgres, Auth, Storage, migrations, and database branches
- **Vercel** for production, staging, and preview deployments
- **GitHub Actions** for branch and PR automation

If your project uses a different database, deployment platform, or CI provider, SafeAgentDB should be treated as a conceptual model. The AI agent should inspect your codebase, explain what needs to change, and adapt the pattern to your infrastructure.

## Skill Contents

Everything the agent needs is bundled inside the skill:

```text
skills/
  safeagentdb/
    SKILL.md
    references/
      setup-process.md
      credentials.md
      data-hydration-policy.md
      local-development.md
      non-standard-stacks.md
      troubleshooting.md
      agent-operating-rules.md
      agent-packaging.md
    templates/
      branching-config.example.json
      package-scripts.json
      package-dev-dependencies.json
      docs/
        database-branching.md
      scripts/
        supabase/
        ci/
      .github/
        workflows/
      agent-instructions/
        AGENTS.md
        CLAUDE.md
```

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

SafeAgentDB is an installable agent skill and infrastructure template kit.

It is not a one-click SaaS product. The skill walks an AI agent through inspecting your project, asking for the right credentials, choosing a hydration policy, and installing the safest version of the workflow for your stack.
