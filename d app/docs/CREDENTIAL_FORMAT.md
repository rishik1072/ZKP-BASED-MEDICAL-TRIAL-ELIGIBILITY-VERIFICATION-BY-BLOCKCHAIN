# Medical Credential Format

This guide explains the exact JSON structure required for medical credentials in this system.

## Complete Credential Example

```json
{
  "patientId": "P123456789",
  "age": 35,
  "gender": "M",
  "issuedAt": "2024-01-15T10:00:00Z",
  "issuerDID": "did:example:doctor123",
  "medicalData": {
    "hemoglobin": 14.5,
    "weight": 75,
    "bloodType": "O+",
    "metalImplants": false,
    "pacemaker": false,
    "pregnancy": false,
    "lastCheckup": "2024-01-10"
  },
  "encrypted": {
    "method": "aes-256-gcm",
    "iv": "base64_encoded_iv",
    "tag": "base64_encoded_tag",
    "ciphertext": "base64_encoded_ciphertext"
  },
  "rsaSignature": "base64_encoded_signature",
  "nonce": 987654321
}
```

## Field Descriptions

### Top-Level Fields (Required)

| Field          | Type   | Description                                   | Example                      |
| -------------- | ------ | --------------------------------------------- | ---------------------------- |
| `patientId`    | string | Unique patient identifier                     | `"P123456789"`               |
| `age`          | number | Patient age (0-150)                           | `35`                         |
| `gender`       | string | Gender (M, F, or Other)                       | `"M"`                        |
| `issuedAt`     | string | ISO 8601 timestamp when credential was issued | `"2024-01-15T10:00:00Z"`     |
| `issuerDID`    | string | Decentralized Identifier of the issuer        | `"did:example:doctor123"`    |
| `medicalData`  | object | Medical information (see below)               | `{...}`                      |
| `encrypted`    | object | Encrypted credential data (see below)         | `{...}`                      |
| `rsaSignature` | string | Base64-encoded RSA signature for verification | `"base64_encoded_signature"` |
| `nonce`        | number | Random number for proof generation            | `987654321`                  |

### Medical Data Object

**Note: At least one field is required**

| Field           | Type    | Description                                  | Valid Range                                      |
| --------------- | ------- | -------------------------------------------- | ------------------------------------------------ |
| `hemoglobin`    | number  | Hemoglobin level (for blood tests)           | 7.0 - 20.0 g/dL                                  |
| `weight`        | number  | Weight in kilograms                          | 20 - 300 kg                                      |
| `bloodType`     | string  | Blood type                                   | "A+", "A-", "B+", "B-", "O+", "O-", "AB+", "AB-" |
| `metalImplants` | boolean | Has metal implants (concerns for MRI)        | `true` or `false`                                |
| `pacemaker`     | boolean | Has pacemaker (contraindication for MRI)     | `true` or `false`                                |
| `pregnancy`     | boolean | Currently pregnant (concerns for some tests) | `true` or `false`                                |
| `lastCheckup`   | string  | Date of last medical checkup (YYYY-MM-DD)    | `"2024-01-10"`                                   |

### Encrypted Object (Required)

| Field        | Type   | Description                                   |
| ------------ | ------ | --------------------------------------------- |
| `method`     | string | Encryption method **must be** `"aes-256-gcm"` |
| `iv`         | string | Base64-encoded initialization vector          |
| `tag`        | string | Base64-encoded authentication tag             |
| `ciphertext` | string | Base64-encoded encrypted payload              |

## Test Type Specific Requirements

### Blood Test

- Requires: `medicalData.hemoglobin` and `medicalData.weight`
- Eligibility: Age ≥ 18, Hemoglobin ≥ 12.5 g/dL for females / ≥ 13.5 for males

### MRI Test

- Requires: `medicalData.metalImplants`, `medicalData.pacemaker`, `medicalData.pregnancy`
- Contraindications: Pacemaker = true, Active pregnancy = true

### CT Test

- Requires: `medicalData.pregnancy` and `medicalData.weight`
- Contraindications: Active pregnancy = true

## Validation Rules

1. **All top-level fields are required** - missing any field will cause validation to fail
2. **Age must be between 0 and 150** - other values will be rejected
3. **Gender must be one of**: "M", "F", "Other"
4. **Encryption method must be "aes-256-gcm"** - other methods are not supported
5. **Nonce must be a positive number** - used for proof generation
6. **issuedAt must be a valid ISO 8601 timestamp**

## Uploading a Credential

Your credential can be uploaded in two ways:

### 1. Plain JSON File

- Name: `credential.json`
- Direct submission of the JSON object

### 2. ZIP Archive

- Contains a single JSON file with the credential data
- Useful for organizing along with other documents
- Can be password-protected (you'll be prompted to extract manually)

## Common Issues

| Issue                         | Solution                                                        |
| ----------------------------- | --------------------------------------------------------------- |
| "Missing required fields"     | Ensure all fields are present at top level                      |
| "Invalid age"                 | Age must be a number between 0 and 150                          |
| "Invalid encrypted structure" | Ensure `encrypted.method` is exactly `"aes-256-gcm"`            |
| "No JSON file found in ZIP"   | ZIP should contain exactly one `.json` file                     |
| "Password-Protected ZIP"      | Extract manually using 7-Zip, WinRAR, or built-in archive tools |

## Example Minimal Credential

For testing, here's a minimal valid credential:

```json
{
  "patientId": "TEST001",
  "age": 25,
  "gender": "M",
  "issuedAt": "2024-01-15T10:00:00Z",
  "issuerDID": "did:example:issuer",
  "medicalData": {
    "weight": 70
  },
  "encrypted": {
    "method": "aes-256-gcm",
    "iv": "abc123",
    "tag": "def456",
    "ciphertext": "ghi789"
  },
  "rsaSignature": "signature123",
  "nonce": 12345
}
```

## Security Notes

- Never share the `rsaSignature` or encryption credentials
- The `nonce` should be randomly generated for each proof
- Credentials should be encrypted at rest
- Only trusted issuers (verified DID) should be accepted in production
