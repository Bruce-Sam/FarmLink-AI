## 2024-05-18 - [Prevent default ADMIN_PASSWORD in production]
**Vulnerability:** The application was allowing the default `ADMIN_PASSWORD` ('AdminPassword123!') to be used in production environments, potentially giving attackers administrative access if not changed by deployment personnel.
**Learning:** Default secrets should explicitly fail fast in production environments during configuration loading to prevent the application from starting in an insecure state.
**Prevention:** Implement checks in the environment configuration module (e.g., `src/config/env.ts`) that throw an error if `NODE_ENV` is 'production' and any critical secret matches its default value.
