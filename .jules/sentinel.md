## 2024-05-24 - Default Secrets in Production
**Vulnerability:** A hardcoded default value for `ADMIN_PASSWORD` ('AdminPassword123!') was allowed to bypass environment checks and run in the production environment.
**Learning:** Default configuration values intended to simplify development/testing environments can lead to complete system compromise if they accidentally slip into production deployments without validation.
**Prevention:** Critical configuration parameters (like passwords, secret keys) MUST include application-level guards that fail on startup if unsafe/default values are detected in production environments (`NODE_ENV=production`).
