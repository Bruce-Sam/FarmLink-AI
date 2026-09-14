## 2024-09-14 - Prevent Default Admin Password in Production
**Vulnerability:** The application allowed the use of a default `ADMIN_PASSWORD` ('AdminPassword123!') in production environments, potentially granting unauthorized access to the admin account.
**Learning:** Default secrets should never be permissible in a production environment as they are well-known and often left unchanged by mistake. The application lifecycle must include checks to fail early if defaults are used.
**Prevention:** We added a conditional check in the environment configuration module (`src/config/env.ts`) that explicitly rejects the default `ADMIN_PASSWORD` when `NODE_ENV` is set to 'production'. This fails the application startup process.
