## 2025-02-18 - [CRITICAL] Fix default ADMIN_PASSWORD in production
**Vulnerability:** The application was not checking if `ADMIN_PASSWORD` was still the default value (`AdminPassword123!`) in a production environment. This could allow attackers to gain unauthorized access if the environment variable wasn't properly set.
**Learning:** Hardcoded default credentials in fallback configurations can act as unintentional backdoors in production if validation isn't explicitly enforced on startup.
**Prevention:** Fail fast on application startup in production if sensitive environment variables retain their insecure default values. Always write assertions within the environment configuration file to validate these secrets against default placeholder values.
