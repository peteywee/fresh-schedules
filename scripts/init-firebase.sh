#!/usr/bin/env bash
# Initialize Firebase project bindings for this repo
# Usage: ./scripts/init-firebase.sh <project-id>
if [ -z "$1" ]; then
  echo "Usage: $0 <firebase-project-id>"
  exit 1
fi
PROJECT_ID=$1
npx firebase use --add $PROJECT_ID
echo "Firebase project set to $PROJECT_ID"
