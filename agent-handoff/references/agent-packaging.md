# Optional Agent Packaging

SafeAgentDB works without a skill. The core setup is `agent-handoff/main.md` plus the templates.

After installation, users may also choose to add persistent agent guidance so future agents know how to maintain the infrastructure.

## Recommendation

Use two layers:

1. **Always-on project instructions** for safety rules that should apply every session.
2. **Optional skill** for the reusable setup/maintenance workflow.

## Cursor

Cursor supports project skills in:

```text
.cursor/skills/<skill-name>/SKILL.md
.agents/skills/<skill-name>/SKILL.md
```

Recommended project install:

```text
.cursor/skills/safeagentdb/SKILL.md
```

Alternative cross-agent install:

```text
.agents/skills/safeagentdb/SKILL.md
```

Use the template:

```text
templates/skills/safeagentdb/SKILL.md
```

Cursor also supports project rules/instructions. If the user wants always-on guidance, add the relevant rules from:

```text
templates/agent-instructions/AGENTS.md
```

to their project instruction convention.

## Codex

Codex supports:

```text
AGENTS.md
.agents/skills/<skill-name>/SKILL.md
~/.agents/skills/<skill-name>/SKILL.md
```

Recommended repo install:

```text
AGENTS.md
.agents/skills/safeagentdb/SKILL.md
```

Use:

```text
templates/agent-instructions/AGENTS.md
templates/skills/safeagentdb/SKILL.md
```

`AGENTS.md` is always-on project guidance. The skill is loaded on demand when Codex decides the task matches its description or when explicitly invoked.

## Claude Code

Claude Code supports project skills in:

```text
.claude/skills/<skill-name>/SKILL.md
```

and project instructions in:

```text
CLAUDE.md
.claude/CLAUDE.md
```

Recommended project install:

```text
CLAUDE.md
.claude/skills/safeagentdb/SKILL.md
```

Use:

```text
templates/agent-instructions/CLAUDE.md
templates/skills/safeagentdb/SKILL.md
```

## Cross-Agent Option

For maximum portability, install the skill at:

```text
.agents/skills/safeagentdb/SKILL.md
```

This is a good default for Codex and is also recognized by Cursor. Claude Code may still need the skill copied to `.claude/skills/safeagentdb/SKILL.md`.

## When Not To Add A Skill

Do not add a skill automatically if:

- the user only wants one-time setup
- the project has no agent instruction convention
- the user wants to keep the repo free of AI-specific files
- the target agent does not support skills

In those cases, add only README/deployment docs and the relevant always-on instructions.

