# Source and academic report review

The original 25-page academic report covers objectives, tools, methodology, implementation, screenshots, future scope and references. Its workflow on page 8 and seven module screenshots on pages 17–21 match the project's broad structure. The report is not included because it contains personal academic identifiers and a screenshot displaying RSA private-key material. Keep it offline or redact and revise it before sharing.

## Technical corrections

- Fernet is AES-128-CBC with HMAC-SHA256, not AES-256-CBC. The original class name is retained for compatibility; the public algorithm label and selected UI claims are corrected.
- The network view is simulated. The application sends plaintext/passwords over HTTP to the backend; it does not implement TLS or guarantee protection from interception or MITM.
- RSA OAEP provides confidentiality for short messages, not digital signatures or sender authentication. Hybrid encryption is discussed but not implemented.
- The original report calls encrypted files encoded; use encrypted instead.
- Original dependency pins are retained, not audited for current vulnerabilities.

## Changes in this copy

Removed runtime uploads, outputs and bytecode; added documentation, ignore rules and unit tests; restricted development server to loopback and CORS to local frontend origins; sanitized uploaded filenames; restricted download paths; corrected selected UI claims. These are limited improvements, not a security audit. Files still persist and names can collide; authentication, TLS, cleanup and robust validation are missing. Browser/API end-to-end operation has not been verified in the review environment.
