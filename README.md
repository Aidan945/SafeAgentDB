# SafeAgentDB

Database safety infrastructure for AFK agentic development.

SafeAgentDB lets multi-agent teams create branches and PRs that are easy to test on live preview URLs, each backed by an isolated database environment. Agents can run migrations, hydrate realistic data, and test real app behavior without risking production, corrupting the shared development database, or interfering with other agents.

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

I want to build SafeAgentDB-style database safety infrastructure into this software platform.

First inspect my current project. Determine my framework, database, deployment platform, CI system, migration setup, environment variable setup, and branch model.

If my project uses Supabase, Vercel, and GitHub Actions, use the SafeAgentDB skill templates to set up safe local, develop, preview, and production database workflows.

If my project uses a different stack, do not blindly copy the templates. Use SafeAgentDB as a conceptual model, explain what needs to be adapted, and work with me to design the equivalent setup for my infrastructure.

Before making infrastructure changes, explain what credentials and permissions you need, why you need them, and where they will be stored. Do not commit secrets.
```

## What SafeAgentDB Enables

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
      agent-operating-rules.md
      agent-packaging.md
    templates/
      branching-config.example.json
      package-scripts.json
      package-dev-dependencies.json
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
