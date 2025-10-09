Firebase & GCP setup notes

This document lists the recommended quick steps to configure Firebase and
Google Cloud for local development and CI for this repository.

1) Install CLIs

 - gcloud (Google Cloud SDK): https://cloud.google.com/sdk/docs/install
 - firebase-tools: npm i -g firebase-tools
 - google-github-actions/auth for GitHub workflows

2) Choose/create a GCP project

Pick an existing project or create one:

  gcloud projects create <PROJECT_ID> --name="Fresh Schedules dev"

3) Enable APIs

  gcloud services enable firebase.googleapis.com firestore.googleapis.com

4) Firebase initialization (in repo root)

  firebase login
  firebase init

Select: Firestore, Hosting (if using), Functions (if you plan serverless functions)

5) Create a CI service account (do NOT commit the key)

  gcloud iam service-accounts create ci-deployer --display-name="CI deployer"
  gcloud projects add-iam-policy-binding <PROJECT_ID> --member="serviceAccount:ci-deployer@<PROJECT_ID>.iam.gserviceaccount.com" --role="roles/firebase.admin"

  gcloud iam service-accounts keys create gcp-sa-key.json --iam-account=ci-deployer@<PROJECT_ID>.iam.gserviceaccount.com

Store the contents of gcp-sa-key.json in your CI provider's secure secrets store.

6) GitHub Actions example (snippet)

  - name: Authenticate to GCP
    uses: google-github-actions/auth@v1
    with:
      credentials_json: ${{ secrets.GCP_SA_KEY }}

7) Firestore rules

This repo includes `firestore.rules`. Use `firebase deploy --only firestore:rules` to upload rules.

8) Security

 - Never commit service account JSON to the repository.
 - Use environment variables and GitHub secrets for credentials in CI.

9) Notes

If you'd like, I can:
 - Add a `firebase.json` and `.firebaserc` starter file (non-sensitive) into the repo.
 - Add a GitHub Actions job template to authenticate with a service account secret.
