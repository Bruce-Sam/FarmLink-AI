## 2026-09-05 - Critical Defaults Allowed in Production
**Vulnerability:** The ADMIN_PASSWORD uses a default hardcoded value ('AdminPassword123!') via zod's default schema. This could allow an attacker to gain admin access easily in production if the variable is omitted from the .env.
**Learning:** Security guidelines mandate failing on startup if critical secrets use default or unsafe values in production, but only JWT_ACCESS_SECRET was being validated for defaults.
**Prevention:** Apply a runtime verification check for production environments ensuring that ADMIN_PASSWORD is NOT the default fallback value 'AdminPassword123!'.
