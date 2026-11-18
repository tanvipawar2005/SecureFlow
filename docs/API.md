# API reference

Base URL: `http://localhost:5000`. JSON requests use `Content-Type: application/json`; file requests use multipart form data.

| Method | Route | Input | Main output |
|---|---|---|---|
| GET | `/` | None | API overview |
| POST | `/encrypt-text` | text, password | encrypted, salt, algorithm, network_view |
| POST | `/decrypt-text` | encrypted_text, password, salt | decrypted_text |
| GET | `/generate-rsa-keys` | None | public_key, private_key, key_size |
| POST | `/rsa-encrypt` | text, public_key | encrypted |
| POST | `/rsa-decrypt` | encrypted_text, private_key | decrypted_text |
| POST | `/encrypt-file` | file, password | encrypted_filename, download_url |
| POST | `/decrypt-file` | file, password | original_filename, download_url |
| POST | `/encrypt-image` | file, password | encrypted_filename, sizes, download_url |
| POST | `/decrypt-image` | file, password | original_filename, download_url, preview_data for supported images |
| GET | `/download/<filename>` | Filename | Encrypted file |
| GET | `/download-decrypted/<filename>` | Filename | Decrypted file |
| GET | `/get-image-preview/<filename>` | Filename | Base64 preview |

Requests are limited to 16 MiB including multipart overhead. Error responses generally include an `error` field. This API has no authentication and is intended only for local sample data.
