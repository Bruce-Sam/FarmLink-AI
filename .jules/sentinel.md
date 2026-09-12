## 2024-05-24 - Reject Default Secrets in Production
**Vulnerability:** Application allowed starting in production with the default `ADMIN_PASSWORD`, potentially leading to unauthorized admin access.
**Learning:** Default configuration secrets for development should be explicitly blocked during the application startup process in production environments to avoid accidental exposure.
**Prevention:** Implement early initialization checks in the environment configuration module (e.g., `src/config/env.ts`) that throw an error if critical secrets match their known default values when `NODE_ENV=production`. Ensure these checks are thoroughly covered by unit tests validating both production rejection and development acceptance.
