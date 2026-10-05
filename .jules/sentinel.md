## 2023-10-25 - [Reject Default Admin Password in Production]
**Vulnerability:** Default secrets like `ADMIN_PASSWORD` were allowed in production, posing a serious security risk for unauthorized access.
**Learning:** Security configurations such as preventing default secrets in production need to be enforced early in the application lifecycle before database connection or initialization.
**Prevention:** Include checks during configuration load to reject default secrets if running in production. Also, ensure tests cover this behavior while maintaining correct functionality in dev and test environments. Use `vi.resetModules()` in tests to re-evaluate the config module top-level logic.
