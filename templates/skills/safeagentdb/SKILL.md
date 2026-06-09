---
name: safeagentdb
description: Sets up and maintains SafeAgentDB-style database safety infrastructure for AFK agentic development. Use when integrating isolated local, develop, preview, and production database workflows; configuring Supabase/Vercel/GitHub Actions previews; adding migration guardrails; or adapting branch-safe database infrastructure to another stack.
---

# SafeAgentDB

Use this skill when the user wants to install, adapt, audit, or maintain SafeAgentDB-style infrastructure in a project.

## Start Here

First read the project's SafeAgentDB handoff file:

```text
agent-handoff/main.md
```

If the target project does not have that file yet, ask the user where the SafeAgentDB package is available, then read the package's:

```text
agent-handoff/main.md
```

Do not start by copying templates. Inspect the target project first.

## Core Workflow

1. Inspect the target project:
   - framework and package manager
   - database provider
   - auth provider
   - object storage provider
   - deployment provider
   - CI provider
   - migration system
   - branch model
   - environment variable names

2. Decide whether the default stack applies:
   - Supabase
   - Vercel
   - GitHub Actions

3. If the default stack applies, use the SafeAgentDB templates.

4. If the stack differs, treat SafeAgentDB as a conceptual model. Work with the user to map the same ideas to their infrastructure.

5. Before provisioning anything, explain credentials and ask permission.

6. Before copying data, confirm the hydration policy:
   - source database for develop
   - source database for previews
   - auth user copy policy
   - public table data copy policy
   - storage copy policy
   - seed/scrub policy

## Safety Rules

- Never commit secrets, `.env.local`, service role keys, access tokens, or preview passwords.
- Never copy production data into previews without explicit user approval.
- Never apply feature-branch migrations to shared develop until merge.
- Keep production, develop, preview, and local databases separate.
- Preserve unrelated user changes.
- If the stack differs from Supabase/Vercel/GitHub Actions, stop and propose an adapted plan before editing.

## Done Criteria

When finished, report:

- files changed
- credentials still required
- where secrets were stored, without revealing values
- what database develop is initialized from
- what database previews are hydrated from
- whether auth users, public data, and storage are copied or seeded
- validation commands run
- how the user can test local, preview, develop, and production flows

