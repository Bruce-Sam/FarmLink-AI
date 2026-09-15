## 2024-05-24 - Unsafe Default Admin Password in Production
**Vulnerability:** The application was allowing the default `ADMIN_PASSWORD` ('AdminPassword123!') to be used in production environments.
**Learning:** Hardcoded default credentials in environment configuration logic can lead to critical vulnerabilities if they are not explicitly restricted in production environments.
**Prevention:** Implement failing fast runtime checks in configuration initialization (e.g., `src/config/env.ts`) that throw errors if `NODE_ENV='production'` and critical secrets match default or insecure values.
