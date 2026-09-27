## 2026-09-27 - Default Admin Password Allowed in Production
**Vulnerability:** The application configured a default administrator password (`AdminPassword123!`) in `src/config/env.ts` which was not prevented from being used in the production environment, potentially exposing the admin account.
**Learning:** Security configuration checks must validate all critical production secrets early in the application lifecycle to avoid entering a temporary insecure state. Specifically, default values meant for local development can easily leak into production if not actively rejected.
**Prevention:** Implement explicit checks in the configuration loader (`env.ts`) that throw errors and halt the startup process if default or unsafe values are detected when `NODE_ENV === 'production'`.
