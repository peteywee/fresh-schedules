#!/usr/bin/env bash
set -euo pipefail
# scripts/merge-prs-accept-theirs.sh
# Usage:
#  - Dry run with: ./scripts/merge-prs-accept-theirs.sh --dry-run --pr 14 18
#  - Auto-discover PRs to base 'develop' using gh: ./scripts/merge-prs-accept-theirs.sh --auto --base develop
#  - Single PR (manual): ./scripts/merge-prs-accept-theirs.sh --pr 14
#
# What it does:
#  - Ensures clean working tree
#  - Fetches origin
#  - For each PR number:
#      * Creates a remote backup branch: backup/<head>-YYYYMMDD-HHMMSS
#      * Fetches the PR head into local branch pr-<num>
#      * Checks out develop, pulls latest
#      * Merges pr-<num> with -X theirs
#      * If conflicts: resolves all unmerged paths by choosing --theirs (and removing files that were deleted by theirs)
#      * Commits and pushes develop
#      * Optionally deletes the source branch on origin (asks for confirmation unless --yes-delete provided)
#
# Important: "theirs" merge and the post-conflict script accepts incoming changes and deletions (this will remove files from develop if PR did).
# Backups: remote backup branches are created before any merges so you can restore deleted files later.

DATE_NOW() { date +"%Y%m%d-%H%M%S"; }

DRY_RUN=false
AUTO=false
BASE_BRANCH="develop"
DELETE_AFTER=false
YES_DELETE=false
PR_LIST=()

print_usage() {
  cat <<EOF
Usage: $0 [--dry-run] [--auto] [--base BRANCH] [--pr N ...] [--delete-after] [--yes-delete]
  --dry-run        Print actions, don't run git push/delete
  --auto           Auto-discover open PR numbers targeting --base using 'gh' CLI
  --base BRANCH    Base branch to merge into (default: develop)
  --pr N ...       One or more PR numbers to merge
  --delete-after   Prompt to delete the source branch on origin after a successful merge
  --yes-delete     Delete the source branch without prompting (use with caution)
  -h | --help      Show this help
EOF
}

# parse args
while [[ $# -gt 0 ]]; do
  case "$1" in
    --dry-run) DRY_RUN=true; shift ;;
    --auto) AUTO=true; shift ;;
    --base) BASE_BRANCH="$2"; shift 2 ;;
    --pr) shift; while [[ $# -gt 0 && $1 != --* ]]; do PR_LIST+=("$1"); shift; done ;;
    --delete-after) DELETE_AFTER=true; shift ;;
    --yes-delete) YES_DELETE=true; shift ;;
    -h|--help) print_usage; exit 0 ;;
    *) echo "Unknown arg: $1"; print_usage; exit 2 ;;
  esac
done

if $AUTO; then
  if ! command -v gh >/dev/null 2>&1; then
    echo "ERROR: --auto requires GitHub CLI 'gh' to be installed and authenticated."
    exit 1
  fi
  echo "Discovering open PRs targeting '$BASE_BRANCH' via gh..."
  mapfile -t PR_LIST < <(gh pr list --base "$BASE_BRANCH" --state open --json number --jq '.[].number')
  if [[ ${#PR_LIST[@]} -eq 0 ]]; then
    echo "No open PRs targeting $BASE_BRANCH found."
    exit 0
  fi
fi

if [[ ${#PR_LIST[@]} -eq 0 ]]; then
  echo "No PRs supplied. Use --pr N or --auto to discover PRs."
  print_usage
  exit 2
fi

echo "PRs to process: ${PR_LIST[*]}"
echo "Base branch: $BASE_BRANCH"
echo "Dry run: $DRY_RUN"
echo

# Check clean working tree
if [[ -n "$(git status --porcelain)" ]]; then
  echo "ERROR: Working tree not clean. Commit or stash changes or run from a disposable clone."
  git status --porcelain
  exit 1
fi

# Fetch latest
echo "Fetching origin..."
git fetch origin --prune

# Ensure base branch exists locally and updated
echo "Checking out and updating $BASE_BRANCH..."
git checkout "$BASE_BRANCH"
git pull --ff-only origin "$BASE_BRANCH"

for PR in "${PR_LIST[@]}"; do
  echo
  echo "==== Processing PR #$PR ===="
  # Fetch PR details via gh if available (for nicer messages), else proceed
  PR_HEAD_REF=""
  if command -v gh >/dev/null 2>&1; then
    PR_JSON=$(gh pr view "$PR" --json number,headRefName,headRepository,name --jq '.')
    PR_HEAD_REF=$(gh pr view "$PR" --json headRefName --jq '.headRefName')
    echo "PR #$PR head ref: $PR_HEAD_REF"
  else
    echo "gh not available; will fetch pull/$PR/head directly."
  fi

  # Create a safe backup branch name using the PR head ref if present
  TIMESTAMP=$(DATE_NOW)
  if [[ -n "$PR_HEAD_REF" ]]; then
    BACKUP_BRANCH="backup/${PR_HEAD_REF}-${TIMESTAMP}"
    SOURCE_REF="refs/heads/${PR_HEAD_REF}"
  else
    BACKUP_BRANCH="backup/pr-${PR}-${TIMESTAMP}"
    SOURCE_REF="pull/${PR}/head"
  fi

  # Fetch the PR head into a local branch pr-$PR
  echo "Fetching PR head into local branch pr-$PR..."
  if $DRY_RUN; then
    echo "[DRY RUN] git fetch origin pull/$PR/head:pr-$PR"
  else
    git fetch origin "pull/$PR/head:pr-$PR"
  fi

  # If we know real head ref, create remote backup pointing to that branch's commit
  if [[ -n "$PR_HEAD_REF" ]]; then
    # ensure we have origin/<head> updated
    if $DRY_RUN; then
      echo "[DRY RUN] git fetch origin refs/heads/${PR_HEAD_REF}:refs/remotes/origin/${PR_HEAD_REF}"
      echo "[DRY RUN] git branch --force $BACKUP_BRANCH origin/${PR_HEAD_REF}"
      echo "[DRY RUN] git push origin $BACKUP_BRANCH"
    else
      git fetch origin "refs/heads/${PR_HEAD_REF}:refs/remotes/origin/${PR_HEAD_REF}" || true
      git branch --force "$BACKUP_BRANCH" "origin/${PR_HEAD_REF}"
      git push origin "$BACKUP_BRANCH"
    fi
  else
    # fallback: create a backup branch from the pr-$PR local branch we just fetched
    if $DRY_RUN; then
      echo "[DRY RUN] git branch --force $BACKUP_BRANCH pr-$PR"
      echo "[DRY RUN] git push origin $BACKUP_BRANCH"
    else
      git branch --force "$BACKUP_BRANCH" "pr-$PR"
      git push origin "$BACKUP_BRANCH"
    fi
  fi
  echo "Created backup branch: $BACKUP_BRANCH (remote)"

  # Merge into base branch
  echo "Merging pr-$PR into $BASE_BRANCH with -X theirs..."
  if $DRY_RUN; then
    echo "[DRY RUN] git checkout $BASE_BRANCH"
    echo "[DRY RUN] git merge -X theirs pr-$PR -m \"Merge PR #$PR - accept theirs\""
    echo "[DRY RUN] If conflicts occur: resolve by choosing theirs (see script)"
    continue
  fi

  git checkout "$BASE_BRANCH"
  git pull --ff-only origin "$BASE_BRANCH"

  set +e
  git merge -X theirs "pr-$PR" -m "Merge PR #$PR - accept theirs"
  MERGE_EXIT=$?
  set -e

  if [[ $MERGE_EXIT -ne 0 ]]; then
    echo "Merge returned non-zero (possible conflicts). Attempting automated resolution: accept theirs for all unmerged paths."
    # Create list of unmerged paths
    mapfile -t UNMERGED < <(git ls-files -u | awk '{print $4}' | sort -u)
    if [[ ${#UNMERGED[@]} -eq 0 ]]; then
      echo "No unmerged paths found but merge failed. Aborting merge and skipping PR #$PR."
      git merge --abort || true
      continue
    fi

    echo "Unmerged paths count: ${#UNMERGED[@]}"
    # For each path: try checkout --theirs, otherwise git rm
    for p in "${UNMERGED[@]}"; do
      echo "Resolving: $p"
      # Ensure directories exist (git checkout --theirs wants path relative)
      if git checkout --theirs -- "$p" 2>/dev/null; then
        git add -- "$p" || true
      else
        echo "  -- file not present in theirs, removing: $p"
        git rm -f -- "$p" || true
      fi
    done

    # Commit the resolution
    git commit -m "Resolve conflicts for PR #$PR by accepting theirs (automated)"
  else
    echo "Merge completed successfully with exit code 0."
  fi

  # Push develop (base)
  echo "Pushing $BASE_BRANCH to origin..."
  if $DRY_RUN; then
    echo "[DRY RUN] git push origin $BASE_BRANCH"
  else
    git push origin "$BASE_BRANCH"
  fi

  # Optionally delete source branch on origin
  if $DELETE_AFTER; then
    # Try to find the upstream branch name; prefer headRefName if available
    if [[ -n "$PR_HEAD_REF" ]]; then
      ORIGIN_BRANCH="$PR_HEAD_REF"
    else
      # Ask the user which branch to delete (fallback), but we can try to infer from pr-$PR remote tracking
      # This is a fallback: we won't delete if unknown
      ORIGIN_BRANCH=""
    fi

    if [[ -z "$ORIGIN_BRANCH" ]]; then
      echo "No headRefName available for PR #$PR; skipping remote branch deletion. To delete manually, use: git push origin --delete <branch>"
    else
      if $YES_DELETE; then
        if $DRY_RUN; then
          echo "[DRY RUN] git push origin --delete $ORIGIN_BRANCH"
        else
          git push origin --delete "$ORIGIN_BRANCH"
          echo "Deleted remote branch: $ORIGIN_BRANCH"
        fi
      else
        read -r -p "Delete remote branch 'origin/$ORIGIN_BRANCH'? [y/N] " yn
        if [[ "$yn" =~ ^[Yy]$ ]]; then
          if $DRY_RUN; then
            echo "[DRY RUN] git push origin --delete $ORIGIN_BRANCH"
          else
            git push origin --delete "$ORIGIN_BRANCH"
            echo "Deleted remote branch: $ORIGIN_BRANCH"
          fi
        else
          echo "Skipping deletion of origin/$ORIGIN_BRANCH"
        fi
      fi
    fi
  fi

  # Cleanup local pr branch if present
  if git show-ref --quiet refs/heads/"pr-$PR"; then
    git branch -D "pr-$PR" || true
  fi

  echo "==== Finished PR #$PR ===="
done

echo
echo "All done. NOTE: Backups created under refs/heads/backup/* on origin."
if $DRY_RUN; then
  echo "Dry-run mode - no pushes/deletions were performed. Re-run without --dry-run to make changes."
fi
