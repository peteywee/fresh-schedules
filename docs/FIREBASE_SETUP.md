# Firebase & GCP Setup Notes

This document lists the recommended quick steps to configure Firebase and
Google Cloud for local development and CI for this repository.

## 1. Install CLIs

- Install the Google Cloud SDK: <https://cloud.google.com/sdk/docs/install>
- Install Firebase CLI tools: `npm install --global firebase-tools`
- Review `google-github-actions/auth` for GitHub workflows.

## 2. Create or Select a GCP Project

Pick an existing project or create one:

```bash
gcloud projects create <PROJECT_ID> --name="Fresh Schedules dev"
```

## 3. Enable Required APIs

```bash
gcloud services enable firebase.googleapis.com firestore.googleapis.com
```

## 4. Initialize Firebase (Repository Root)

```bash
firebase login
firebase init
```

Select Firestore, Hosting (if used), and Functions when prompted.

## 5. Create a CI Service Account (Do Not Commit Keys)

```bash
gcloud iam service-accounts create ci-deployer --display-name="CI deployer"
gcloud projects add-iam-policy-binding <PROJECT_ID> \
  --member="serviceAccount:ci-deployer@<PROJECT_ID>.iam.gserviceaccount.com" \
  --role="roles/firebase.admin"
gcloud iam service-accounts keys create gcp-sa-key.json \
  --iam-account=ci-deployer@<PROJECT_ID>.iam.gserviceaccount.com
```

Store the contents of `gcp-sa-key.json` in your CI provider's secure secrets
store.

## 6. GitHub Actions Snippet

```yaml
- name: Authenticate to GCP
  uses: google-github-actions/auth@v1
  with:
    credentials_json: ${{ secrets.GCP_SA_KEY }}
```

## 7. Firestore Rules Deployment

This repo includes `firestore.rules`. Deploy rules with:

```bash
firebase deploy --only firestore:rules
```

## 8. Security Reminders

- Never commit service account JSON to the repository.
- Use environment variables and GitHub secrets for CI credentials.

## 9. Optional Follow-Ups

- Add `firebase.json` and `.firebaserc` starter files (non-sensitive) to the
  repo if needed.
- Create a GitHub Actions job template to authenticate with the service account
  secret.
