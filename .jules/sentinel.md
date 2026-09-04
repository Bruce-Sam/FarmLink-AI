## Security Findings

### Production error responses
Unexpected 500 errors must not expose internal exception messages,
database errors, stack traces, or implementation details to clients.
Detailed diagnostics should remain server-side.

### Production credentials
Security-sensitive credentials must not have known fallback values in
production. Required production secrets should cause startup failure
when absent or unsafe.

### Regression expectations
Security fixes must include tests covering both the vulnerable behavior
and the intended production behavior.
