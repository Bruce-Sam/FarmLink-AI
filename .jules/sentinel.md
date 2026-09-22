## 2023-10-27 - [CRITICAL] Prevent Default Admin Password in Production
**Vulnerability:** The application was not rejecting the default `ADMIN_PASSWORD` ('AdminPassword123!') in production environments, potentially allowing unauthorized administrative access.
**Learning:** Default secrets should never be permissible in a production setting as they are a common vector for immediate compromise. Development conveniences can easily leak into production without explicit environmental constraints.
**Prevention:** Hardcode runtime checks in configuration initialization (e.g., `src/config/env.ts`) to immediately throw errors and halt startup if a default secret is detected in `NODE_ENV === 'production'`.
