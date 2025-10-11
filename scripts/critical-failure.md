# Critical failure helper

`scripts/critical-failure.sh` is a small helper used to record and checkpoint critical failures during long-running upgrade or CI scripts.

What it does

- Appends a JSON-formatted entry to `scripts/critical-failures.log` with timestamp, error code, message, git branch and commit (if available).
- Attempts to create a lightweight git commit with the log file and an annotated tag named `critical-failure/<TIMESTAMP>` so you can locate the failure point.
- Exits with the provided numeric exit code.

Usage

```bash
# basic
./scripts/critical-failure.sh 201 "build failed: out of memory"

# skip git checkpoint (useful in ephemeral CI or restricted environments)
SKIP_GIT=1 ./scripts/critical-failure.sh 201 "build failed: out of memory"
```

Suggested error codes

- 100 - CHECKPOINT_MISSING
- 101 - SCRIPT_ABORTED
- 102 - COMMAND_FAILED
- 110 - PNPM_INSTALL_FAILED
- 120 - UPGRADE_COMMAND_FAILED
- 200 - TYPECHECK_FAILED
- 201 - BUILD_FAILED
- 202 - TESTS_FAILED
- 255 - UNKNOWN_FATAL

Acceptance criteria (for this helper)

- The script writes an entry to `scripts/critical-failures.log` when invoked.
- If `git` is available and `SKIP_GIT` is not set, it creates a lightweight commit and an annotated tag.
- Exits with the numeric code passed as the first argument.

Success criteria

- You can reproduce a failure locally by running the script and seeing the log entry and commit/tag.
- Long-running scripts (like `scripts/upgrade-checkpoint.sh`) can call this helper on `ERR` to preserve a checkpoint and terminate with a known code.
