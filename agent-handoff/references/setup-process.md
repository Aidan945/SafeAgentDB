# Setup Process

Use this as the installation flow after reading `../main.md`.

## Fit Check

Best fit:

- app is deployed on Vercel
- Supabase is used for Postgres/Auth/Storage
- GitHub Actions is available for CI
- migrations are committed under `supabase/migrations`

Partial fit:

- Supabase is used, but schema is managed manually in the dashboard
- Vercel is used, but preview env vars are manual
- GitHub exists, but no Actions are configured

Requires adaptation:

- database is not Supabase
- deployment platform is not Vercel
- CI is not GitHub Actions

If adaptation is required, read `non-standard-stacks.md` and propose a plan before editing.

## If Supabase CLI Is Already Set Up

Expected files:

```text
supabase/config.toml
supabase/migrations/
supabase/seed.sql
```

Reuse the existing Supabase directory. Do not recreate migrations or overwrite config. Add branch-aware scripts and workflows around the existing migration structure.

## If Supabase Is Used But CLI Files Are Missing

Ask the user for the production Supabase project ref and confirm Supabase CLI access. Then bootstrap:

```bash
npx supabase init
npx supabase link --project-ref <production-project-ref>
npx supabase db pull
```

Review the generated migration state before adding branch automation.

Do not invent schema. Do not tell the user to paste SQL manually into the dashboard.

## Installation Steps

1. Copy `templates/branching-config.example.json` to `branching-config.json`.
2. Fill in project-specific refs, branch names, Vercel IDs, env var names, and hydration policy.
3. Copy `templates/scripts/supabase/*.ts` to `scripts/supabase/`.
4. Copy `templates/scripts/ci/*.ts` to `scripts/ci/`.
5. Merge `templates/package-scripts.json` into `package.json`.
6. Ensure required dev dependencies from `templates/package-dev-dependencies.json` are installed or already available.
7. Copy workflow templates into `.github/workflows/`.
8. Add README/deployment docs for the target repo's branch model, local development workflow, hydration policy, preview cleanup, and agent operating rules.
9. Add required GitHub/Vercel/Supabase secrets after the user approves.
10. Validate local Supabase before testing cloud previews.

## Vercel Preview Behavior

For Vercel previews to point at the correct preview database:

1. Create or reuse the Supabase preview branch.
2. Read that branch's Supabase URL, anon key, and service role key.
3. Set branch-scoped Vercel Preview env vars for the Git branch.
4. Redeploy the Vercel preview after env vars are set.

`NEXT_PUBLIC_*` values are baked into the frontend at build time, so setting env vars after a preview has already built is not enough.

## Preview Hydration Behavior

The full preview provision template can:

- create or reuse a Supabase preview branch
- wait for the branch to become healthy
- sync Auth config from the configured source project
- apply branch migrations to the preview branch only
- create required storage buckets
- optionally copy Auth users and reset their preview passwords
- optionally copy public table data using include/exclude lists
- optionally copy storage objects from selected buckets
- set Vercel branch-scoped preview env vars
- redeploy the matching Vercel preview deployment

Keep the default conservative. Enable auth/data/storage copying only after the user chooses a hydration policy.

## Guardrails

- Feature migrations apply to feature preview databases only.
- Migrations apply to persistent develop only after code merges to `develop`.
- Production migrations apply only from `main`.
- Destructive migrations require explicit review.
- Duplicate migration timestamps fail validation.
- Preview databases should be disposable.
- Local database development should not require pushing to GitHub.

