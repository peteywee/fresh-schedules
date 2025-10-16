# Copilot Full Context Guide

This guide explains how we prepare the bundled documentation that Copilot uses
to understand the repository. Keep the automation tidy, repeatable, and
secret-safe while following our branch and placeholder policies.

## Scope

- document the scripts that assemble the context bundle
- explain how `.place.` files and placeholders are handled
- list the quality gates that keep generated artifacts out of `main`
- outline the maintenance rhythm and owners

## Key Artifacts

- `build_copilot_context.mjs`: consolidates the repository tree and text files
   into a single markdown bundle for Copilot.
- `addon/CONTEXT_README.place.md`: generated output consumed by Copilot.
- `.zip/` templates: companion docs for prompt guardrails.
- `.place.` files: any file that contains placeholder configuration.

All generated artifacts live on `develop` only. Never push them to `main`.

## Running the Builder

1. From the repository root run:

   ```bash
   pnpm node build_copilot_context.mjs
   ```

2. Inspect `addon/tmp/CONTEXT_README.place.md` to verify that sensitive values
   are masked as `__PLACEHOLDER__`.
3. Promote the artifact to `addon/CONTEXT_README.place.md` only if the content
   is safe to commit on `develop`.
4. Record notable automation changes in
   `docs/guides/copilot-project-pack.guide.md`.

> Never check in the generated bundle when working on the `main` branch.
> Guard scripts in CI block `.place.` artifacts there.

## Placeholder Discipline

- Use `__PLACEHOLDER__` for secrets, API endpoints, tenant IDs, and similar
   values.
- Rename affected files to include `.place.` before the extension.
- Insert a warning comment at the top of each `.place.` file so real
   credentials are sourced from environment variables.
- Track follow-up remediation work in the todo list inside the Copilot Project
   Pack and link to the relevant ticket.

## Quality Gates

- `pnpm -r build` stays green with generated artifacts removed; treat the
   bundle as disposable output.
- `pnpm dlx markdownlint-cli '**/*.md'` passes. Generated `.place.` files are
   ignored through `.markdownlintignore`, but authored guides must lint
   cleanly.
- `scripts/guard-main.sh` prevents `.place.` artifacts from landing on `main`.
- Before every release cycle rerun the builder and confirm that instructions
   still match the active stack (Next.js 14 App Router, Express API, Firebase).

## Maintenance Cadence

- __After major refactors__: regenerate the bundle so Copilot reflects the new
   structure.
- __Quarterly__: audit the generated file for stale sections and remove
   references to deleted modules or commands.
- __Security events__: refresh the bundle after rotating secrets or changing
   placeholder formats.

## Troubleshooting

- Builder fails with `ENOENT`: ensure the repository root contains the expected
   scripts and run `pnpm install` to hydrate dependencies.
- Placeholder diff churn: delete the temporary output in `addon/tmp/` and
   rerun the builder to obtain a clean snapshot.
- Large diff on `develop`: store the generated bundle on the `notes` branch
   instead and keep only instructions here.

## Next Steps

- Document new automation in this guide and update the project pack.
- Share this guide with external collaborators so they can regenerate context
   locally without exposing secrets.

Maintaining a minimal, trustworthy context bundle keeps Copilot productive
without leaking sensitive information or cluttering `main`.
