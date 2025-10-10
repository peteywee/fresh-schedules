#!/usr/bin/env bash
set -euo pipefail

# Helper to guide initial Firebase + gcloud CLI setup for this repo.
# This script is a *guided* helper. It does NOT store secrets in the repo.

usage() {
  cat <<EOF
Usage: $0 [project-id]

This helper will:
 - Check for gcloud and firebase CLI tools
 - Authenticate you (interactive)
 - Create a Firebase project (optional)
 - Initialize Firebase hosting & Firestore (interactive)
 - Create a service account JSON and instruct how to store it in CI

NOTE: This script avoids committing secrets. Follow prompts and keep
service account JSON out of repository.
EOF
}

PROJECT_ID=${1:-}

if ! command -v gcloud >/dev/null 2>&1; then
  echo "ERROR: gcloud CLI not found. Install from https://cloud.google.com/sdk/docs/install"
  exit 1
fi
if ! command -v firebase >/dev/null 2>&1; then
  echo "ERROR: firebase-tools not found. Install with: npm install -g firebase-tools"
  exit 1
fi

if [ -z "$PROJECT_ID" ]; then
  echo "No GCP project-id provided. You can create one interactively using gcloud."
  read -rp "Enter an existing GCP project id (or leave blank to create one): " PROJECT_ID
fi

# Authenticate
echo "Ensure you're logged into gcloud and firebase."
gcloud auth login

gcloud config set project "$PROJECT_ID" || true

# Interactive: initialize firebase in this directory (will create firebase.json)
echo "Running 'firebase init' — choose Firestore and Hosting as needed."
read -rp "Run firebase init now? (y/N) " yn
if [[ "$yn" =~ ^[Yy] ]]; then
  firebase init
else
  echo "Skipping firebase init — you'll need to run 'firebase init' manually."
fi

cat <<EOF
Next steps (manual):
 - Create a service account for CI: gcloud iam service-accounts create ci-deployer ...
 - Grant roles: roles/firebase.admin, roles/datastore.user (or more restrained roles)
 - Create a key: gcloud iam service-accounts keys create key.json --iam-account=ci-deployer@${PROJECT_ID}.iam.gserviceaccount.com
 - Store key.json securely in your CI secrets (GitHub Actions secret) and do NOT commit it.

Example GitHub Actions snippet (use secrets.GCP_SA_KEY to hold the JSON):

- name: Authenticate to GCP
  uses: google-github-actions/auth@v1
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}

EOF

exit 0
