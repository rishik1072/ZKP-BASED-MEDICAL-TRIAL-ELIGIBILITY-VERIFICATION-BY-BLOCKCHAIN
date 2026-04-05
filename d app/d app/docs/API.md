# 📋 API Reference Documentation

## Base URL
- **Development**: `http://localhost:5000/api`
- **Production**: `https://api.medical-zkp.example.com/api`

## Authentication

Currently, endpoints are open. For production:
```bash
Header: Authorization: Bearer <JWT_TOKEN>
```

## ZKP Endpoints

### 1. Generate Proof
**POST** `/zk/generate-proof`

**Description**: Generate a zero-knowledge proof for medical eligibility

**Request Body**:
```json
{
  "credential": {
    "patientId": "P123456",
    "age": 35,
    "gender": "M",
    "medicalData": {
      "hemoglobin": 14.5,
      "weight": 75,
      "metalImplants": false,
      "pacemaker": false,
      "pregnancy": false
    }
  },
  "testType": "blood",
  "nonce": 123456
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "proof": {
      "pi_a": ["12345...", "67890..."],
      "pi_b": [["11111...", "22222..."], ["33333...", "44444..."]],
      "pi_c": ["55555...", "66666..."]
    },
    "publicSignals": ["1", "98765..."],
    "credentialHash": "0xabcd1234...",
    "eligible": true,
    "nonce": 123456
  },
  "message": "Proof generated successfully. Status: Eligible"
}
```

**Parameters**:
- `credential` (object) - Encrypted medical credential
- `testType` (string) - Medical test type: "blood", "mri", or "ct"
- `nonce` (number, optional) - Random nonce (auto-generated if not provided)

**Error Cases**:
```json
{
  "success": false,
  "error": "Missing required fields: credential, testType"
}
```

---

### 2. Verify Proof
**POST** `/zk/verify-proof`

**Description**: Verify a ZKP proof without storing on-chain

**Request Body**:
```json
{
  "proof": {
    "pi_a": ["12345...", "67890..."],
    "pi_b": [["11111...", "22222..."], ["33333...", "44444..."]],
    "pi_c": ["55555...", "66666..."]
  },
  "publicSignals": ["1", "98765..."]
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "isValid": true,
    "credentialHash": "0xabcd1234...",
    "eligible": true
  },
  "message": "Proof is valid"
}
```

**Parameters**:
- `proof` (object) - Groth16 proof structure
- `publicSignals` (array) - Public signals from proof

---

### 3. Store Proof On-Chain
**POST** `/zk/store-on-chain`

**Description**: Verify and store proof on Polygon blockchain

**Request Body**:
```json
{
  "proof": {
    "pi_a": ["12345...", "67890..."],
    "pi_b": [["11111...", "22222..."], ["33333...", "44444..."]],
    "pi_c": ["55555...", "66666..."]
  },
  "publicSignals": ["1", "98765..."],
  "credentialHash": "0xabcd1234..."
}
```

**Response**:
```json
{
  "success": true,
  "data": {
    "transactionHash": "0xabcd123456...",
    "blockNumber": 45123456,
    "gasUsed": "1234567"
  },
  "message": "Proof stored on-chain successfully"
}
```

**Gas Cost**: ~1.2M gas on Polygon (~$0.01-0.05)

---

### 4. Get Verification Result
**GET** `/zk/result/:credentialHash`

**Description**: Retrieve stored verification result from blockchain

**URL Parameters**:
- `credentialHash` (string) - Credential hash (32-byte hex)

**Response**:
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "timestamp": 1704067200,
    "txHash": "0xabcd123456..."
  }
}
```

**Error Response**:
```json
{
  "success": false,
  "error": "No verification result found for this credential"
}
```

---

### 5. Check Eligibility Status
**GET** `/zk/eligibility/:credentialHash`

**Description**: Check only eligibility status on-chain

**URL Parameters**:
- `credentialHash` (string) - Credential hash

**Response**:
```json
{
  "success": true,
  "data": {
    "eligible": true,
    "credentialHash": "0xabcd1234..."
  }
}
```

---

## Blockchain Endpoints

### 1. Initialize Blockchain Service
**POST** `/blockchain/init`

**Description**: Initialize connection to Polygon blockchain

**Response**:
```json
{
  "success": true,
  "message": "Blockchain service initialized"
}
```

---

### 2. Get Blockchain Configuration
**GET** `/blockchain/config`

**Description**: Retrieve blockchain setup (without sensitive data)

**Response**:
```json
{
  "success": true,
  "data": {
    "chainId": "137",
    "rpcUrl": "https://polygon-rpc.com...",
    "contractAddress": "0xabcd1234567890...",
    "network": "Polygon Mainnet"
  }
}
```

---

## Health Check

### Server Health
**GET** `/health`

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2024-01-15T10:30:45.123Z",
  "environment": "development"
}
```

---

## Error Responses

### Standard Error Format
```json
{
  "success": false,
  "error": "Error message",
  "details": {}
}
```

### Common HTTP Status Codes
| Code | Meaning |
|------|---------|
| 200 | Success |
| 400 | Bad Request (invalid input) |
| 404 | Not Found (resource doesn't exist) |
| 500 | Internal Server Error |

---

## Rate Limiting

Currently no rate limiting. For production:
```
- 100 requests/minute per IP
- 1000 requests/hour per IP
- Burst: 10 requests/second
```

---

## CORS Policy

Allowed Origins (configurable):
```
- http://localhost:3000
- http://localhost:5173
- Production domain
```

---

## Request/Response Encoding

- **Content-Type**: `application/json`
- **Charset**: UTF-8
- **Compression**: gzip (enabled)

---

## Example: Complete Flow

### Step 1: Generate Proof
```bash
curl -X POST http://localhost:5000/api/zk/generate-proof \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "patientId": "P123456",
      "age": 35,
      "medicalData": {"hemoglobin": 14.5, "weight": 75}
    },
    "testType": "blood"
  }'
```

### Step 2: Store on Chain
```bash
curl -X POST http://localhost:5000/api/zk/store-on-chain \
  -H "Content-Type: application/json" \
  -d '{
    "proof": {...},
    "publicSignals": ["1", "hash..."],
    "credentialHash": "0xabcd..."
  }'
```

### Step 3: Query Result
```bash
curl -X GET http://localhost:5000/api/zk/result/0xabcd...
```

---

## Testing with cURL

### Generate Proof
```bash
curl -X POST http://localhost:5000/api/zk/generate-proof \
  -H "Content-Type: application/json" \
  -d '{"credential":{"patientId":"P1","age":30,"medicalData":{"hemoglobin":14}},"testType":"blood"}'
```

### Check Health
```bash
curl -X GET http://localhost:5000/health
```

---

## SDK Usage (JavaScript/TypeScript)

### Using Axios
```typescript
import axios from 'axios';

const API = axios.create({ baseURL: 'http://localhost:5000/api' });

// Generate proof
const response = await API.post('/zk/generate-proof', {
  credential: {...},
  testType: 'blood'
});

console.log(response.data.data.eligible);
```

### Using Fetch API
```javascript
const response = await fetch('http://localhost:5000/api/zk/generate-proof', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ credential, testType })
});

const data = await response.json();
console.log(data.data.eligible);
```

---

## Versioning

Current API Version: **v1** (no prefix)

Future versions will use paths like:
- `/api/v2/zk/generate-proof`

---

## Documentation Updates

Last Updated: January 2024
API Status: STABLE (production-ready)

For issues or questions: GitHub Issues or documentation

---
