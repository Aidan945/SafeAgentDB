---
name: safeagentdb
description: Sets up and maintains SafeAgentDB-style database safety infrastructure for AFK agentic development. Use when integrating isolated local, develop, preview, and production database workflows; configuring Supabase/Vercel/GitHub Actions previews; adding migration guardrails; packaging SafeAgentDB into a project; or adapting branch-safe database infrastructure to another stack.
---

# SafeAgentDB

Use this skill when the user wants to install, adapt, audit, package, or maintain SafeAgentDB-style infrastructure in a project.

SafeAgentDB is database safety infrastructure for AFK agentic development. It helps multi-agent teams create testable PRs and live preview URLs backed by isolated database environments, without risking production or shared development data.

## First Step

Inspect the target project before editing. Determine:

- framework and package manager
- database provider
- auth provider
- object storage provider
- deployment provider
- CI provider
- migration system
- branch model
- environment variable names
- whether production, develop/staging, preview, and local database workflows already exist

Do not start by copying templates.

## Default Stack

The default SafeAgentDB templates are built for:

- Supabase
- Vercel
- GitHub Actions

If the target project uses that stack, use the SafeAgentDB package templates if available.

If the target project uses a different stack, this skill is conceptual guidance only. Use the target codebase, platform docs, and user judgment to design the equivalent infrastructure. Explain what needs adaptation before editing.

## Handoff Docs

If the SafeAgentDB repo or package is available, read:

```text
agent-handoff/main.md
```

That file is the canonical setup guide. It points to references for:

- setup process
- credentials
- data hydration policy
- local development
- non-standard stacks
- agent packaging
- operating rules

If the target repo already contains `agent-handoff/main.md`, prefer that local file because it may include project-specific decisions.

## Core Workflow

1. Summarize the target project's current state.
2. Ask the user to confirm the intended branch/database model.
3. Explain needed credentials and ask permission before using or setting them.
4. Confirm the data hydration policy before copying data.
5. Install or adapt scripts, workflows, package scripts, config, and docs.
6. Validate with safe local and CI checks.
7. Report changed files, remaining secrets/config, and testing steps.

## Database Model

Target model:

```text
main      -> production app + production database
develop   -> staging app + persistent develop database
feature/* -> preview app + isolated preview database
agent/*   -> preview app + isolated preview database
local     -> local app + local Docker database
```

Recommended hydration default:

```text
production/default schema -> persistent develop
persistent develop data   -> feature/agent previews
local Docker database     -> migrations + seed only
```

Do not copy production data into previews unless the user explicitly approves it and confirms privacy/compliance requirements.

## Safety Rules

- Never commit secrets, `.env.local`, service role keys, access tokens, or preview passwords.
- Never point agent feature work at production.
- Never copy production data into previews without explicit user approval.
- Never apply feature-branch migrations to shared develop until merge.
- Keep production, develop, preview, and local databases separate.
- Preserve unrelated user changes.
- If the stack differs from Supabase/Vercel/GitHub Actions, stop and propose an adapted plan before editing.

## Packaging Guidance

If the user asks to install SafeAgentDB as a skill:

- Cursor project skill: `.cursor/skills/safeagentdb/SKILL.md`
- Cursor/Codex cross-agent project skill: `.agents/skills/safeagentdb/SKILL.md`
- Claude Code project skill: `.claude/skills/safeagentdb/SKILL.md`
- Codex always-on instructions: `AGENTS.md`
- Claude Code always-on instructions: `CLAUDE.md`

If the user is using `npx skills add`, this skill should be discoverable from the repository `skills/safeagentdb/SKILL.md`.

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

