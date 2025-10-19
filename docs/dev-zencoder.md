````markdown
```markdown
# Zencoder (Brightcove) Developer Guide

This document describes the developer-focused VS Code configuration and example script for submitting Zencoder jobs from the repository.

## Files added
- `.vscode/extensions.json` — recommended extensions
- `.vscode/settings.json` — editor settings aligned with project standards
- `.vscode/tasks.json` — tasks to run the example script
- `.vscode/launch.json` — debug configuration to run the TypeScript script
- `scripts/zencoder/submit-job.ts` — example TypeScript script to submit a job

> Security: Do not commit ZENCODER_API_KEY. Use OS environment variables, VS Code secret storage, or a local `.env` file that is in `.gitignore`.

## Running the example
1. Set your API key locally:

   - macOS / Linux:
     ```bash
     export ZENCODER_API_KEY=your_key_here
     ```

   - Windows (PowerShell):
     ```powershell
     $env:ZENCODER_API_KEY = "your_key_here"
     ```

2. Run from the repo root with tsx (no install required):

```bash
pnpm dlx tsx ./scripts/zencoder/submit-job.ts
```

3. Or use the VS Code task: `Terminal -> Run Task... -> Zencoder: Submit job (ts-node)`

## Notes
- Payload in `scripts/zencoder/submit-job.ts` is an example. Consult Zencoder API docs for fields and authentication.
- If you prefer not to add a dev dependency, `pnpm dlx tsx` runs the script transiently.
- Keep API keys out of source control. Add `.env` to `.gitignore` when used locally.

```
````
