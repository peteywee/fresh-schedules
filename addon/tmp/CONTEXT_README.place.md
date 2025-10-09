
# Copilot Full Context Tools (.place.)

This toolkit lets you generate a **single markdown file** that contains:
- a filtered file tree of your repo
- the **inline contents** of **all text files** (masked for secrets)
- ready for Copilot to read without copy/paste sprawl

## Files
- `build_copilot_context.mjs` — Node script that walks your repo and builds **CopilotFullContext.place.md**
- `run_build_copilot_context.sh` — shell wrapper

## Usage
From your repo root:
```bash
# Copy these two files into your repo, then run:
bash run_build_copilot_context.sh .
# Output:
#   CopilotFullContext.place.md
```

The output is tagged `.place.` and replaces anything that looks like a secret/config with `__PLACEHOLDER__`.

## Notes
- Excluded directories: `.git`, `node_modules`, `.next`, `dist`, `build`, `coverage`, `.cache`, `.pnpm-store`, `.turbo`
- Per-file cap: 200KB (configurable in the script)
- Text file types included: md, txt, ts, tsx, js, jsx, json, yml, yaml, css, scss, html, rules, mjs, cjs, env, gitignore, editorconfig, prettierrc, eslintrc, tsconfig, npmrc.
