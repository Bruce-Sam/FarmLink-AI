## 2024-10-27 - Reject Default ADMIN_PASSWORD in Production
**Vulnerability:** The application was not rejecting the default `ADMIN_PASSWORD` (`AdminPassword123!`) when running in production, potentially leading to unauthorized administrative access if not overridden in the `.env` file.
**Learning:** Default configuration secrets must be explicitly rejected during production initialization to enforce secure deployments.
**Prevention:** Include validation checks at application startup (in `env.ts` or similar) that trigger fatal errors when default values are detected in critical variables (e.g. JWT secrets, admin passwords) if `NODE_ENV === 'production'`.
