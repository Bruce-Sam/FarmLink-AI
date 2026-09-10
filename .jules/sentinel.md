## 2025-02-19 - [CRITICAL] Prevent Default Admin Password in Production
**Vulnerability:** The application was missing an initialization check to prevent starting up with a default ADMIN_PASSWORD in production environments.
**Learning:** Security configuration checks should occur early in the app lifecycle (during env parsing/initialization) before database connection or user account creation to avoid entering an insecure state.
**Prevention:** Implement fail-fast checks in configuration layers that throw exceptions when sensitive variables like ADMIN_PASSWORD match predefined default/insecure values in production environments. Regression tests must explicitly verify both rejection in production and preservation of normal behavior in non-production environments.
