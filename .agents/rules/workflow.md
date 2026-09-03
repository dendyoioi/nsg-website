# Workflow Rule: Local Validation First Before Deployment

- **DO NOT push to `origin main` / deploy immediately upon making revisions.**
- Always apply changes and verify on **local development environment (`http://localhost:3000`)** first.
- Ask the user to check and validate the changes on `localhost:3000`.
- Only commit & push to trigger production deployment when the user gives explicit approval/instruction to deploy.
