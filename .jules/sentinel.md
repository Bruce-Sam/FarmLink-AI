
## 2024-05-18 - Reject Default Admin Password in Production
**Vulnerability:** The application was using the default `ADMIN_PASSWORD` ('AdminPassword123!') in production if it wasn't overridden, leaving it exposed to unauthorized admin access.
**Learning:** Security configuration checks (such as validating production secrets) must occur early in the application lifecycle, such as in `src/config/env.ts`, prior to database connections or account initialization, to prevent the system from entering a temporary insecure state. We must explicitly reject default, unsafe passwords in production environments.
**Prevention:** Ensured that `src/config/env.ts` throws an error if `NODE_ENV=production` and `ADMIN_PASSWORD` is left as its default string. Tests added using `vi.resetModules()` to ensure configurations are properly tested across environments.
