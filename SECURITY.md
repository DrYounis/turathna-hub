# Security Policy

## Supported Versions
Currently, only the `main` branch deployed to production is actively supported with security updates.

| Version | Supported          |
| ------- | ------------------ |
| v1.x    | :white_check_mark: |

## Reporting a Vulnerability
If you discover a security vulnerability within this project, please send an e-mail to the maintainers. Do not open public github issues for critical bugs. All security vulnerabilities will be promptly addressed.

## Security Measures Implemented
* **Pydantic Hardening**: All FastApi endpoints strictly enforce constraints (regex, min/max length, value caps) on inputs preventing underflow/overflow DOS issues.
* **Payment Safeguards**: The Stripe 'Demo Mode' fallback has been permanently disabled in production, preventing unauthorized creation of free checkout sessions.
* **Brute-force Mitigations**: A Token-bucket Rate Limiter provides burst protection against abusive scripts hitting POST endpoints (like `/artisans/register` and `/orders`).
* **Security Headers**: HSTS, Content-Security-Policy (CSP), and XSS-Protection definitions are injected by a custom FastApi middleware on every request.
