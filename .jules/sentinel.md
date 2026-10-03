## 2024-05-24 - [CRITICAL] Prevent Default Admin Password in Production
**Vulnerability:** A default admin password (`AdminPassword123!`) was hardcoded in the configuration logic (`farmlink-backend/src/config/env.ts`) and allowed in production, posing a critical security risk.
**Learning:** Default secrets must always be rejected during initialization in production environments to prevent insecure deployments.
**Prevention:** Implement explicit environment configuration checks using a conditional block (`if (config.isProduction && config.ADMIN_PASSWORD === 'AdminPassword123!') throw new Error(...)`) and test the behavior across all environments.
