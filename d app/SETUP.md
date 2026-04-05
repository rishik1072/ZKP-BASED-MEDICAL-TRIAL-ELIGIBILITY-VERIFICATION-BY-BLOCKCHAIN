# 🚀 Complete Setup Guide

## Prerequisites

### System Requirements
- **Node.js**: >=16.0.0
- **npm**: >=8.0.0
- **Git**: Latest version
- **RAM**: At least 4GB (8GB recommended for circuit compilation)

### Installation Commands

#### 1. Install Circom (Global)
```bash
# For Linux/macOS
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
cargo install circom --all-features

# For Windows (using WSL or PowerShell with Rust)
# Follow: https://www.rust-lang.org/tools/install
cargo install circom --all-features

# Verify installation
circom --version
```

#### 2. Install Node Dependencies
```bash
cd d\ app
npm run setup:all
```

## Project Structure

```
d app/
├── backend/              # Node.js + Express API
│   ├── src/
│   │   ├── index.ts     # Main server
│   │   ├── routes/      # API endpoints
│   │   ├── services/    # Business logic
│   │   ├── middleware/  # Express middleware
│   │   └── utils/       # Utilities
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/             # React SPA
│   ├── src/
│   │   ├── main.tsx     # Entry point
│   │   ├── App.tsx      # Main component
│   │   ├── pages/       # Page components
│   │   ├── components/  # Reusable components
│   │   ├── services/    # API services
│   │   └── store/       # State management
│   ├── vite.config.ts
│   └── package.json
│
├── circuits/             # Circom ZKP circuits
│   ├── src/
│   │   └── eligibility.circom
│   ├── scripts/
│   │   └── setup.js
│   └── package.json
│
├── contracts/            # Solidity smart contracts
│   ├── contracts/
│   │   └── VerifyEligibility.sol
│   ├── scripts/
│   │   └── deploy.js
│   ├── hardhat.config.js
│   └── package.json
│
├── docs/                 # Documentation
├── .env.example          # Environment template
├── package.json          # Root workspace
└── README.md
```

## 🔧 Build & Compilation Steps

### Step 1: Compile Circom Circuits
```bash
cd circuits
npm run compile
```

This generates:
- `eligibility.wasm` - WebAssembly for witness calculation
- `eligibility.r1cs` - Rank-1 Constraint System
- `eligibility_js/eligibility.js` - JavaScript bindings

### Step 2: Generate Proving Keys & Setup
```bash
cd circuits
npm run setup
```

This creates:
- `eligibility_0001.zkey` - Proving key (⚠️ Large file, ~50MB)
- `verification_key.json` - Public verification key
- `VerifyEligibility.sol` - Solidity verifier contract

### Step 3: Deploy Smart Contracts

#### Local Testing (Hardhat)
```bash
cd contracts
npx hardhat node  # In one terminal
# In another terminal:
npm run deploy:local
```

#### Polygon Mumbai Testnet
```bash
cd contracts
# Ensure .env has MUMBAI_RPC_URL and PRIVATE_KEY
npm run deploy:mumbai
```

#### Polygon Mainnet (Production)
```bash
cd contracts
# Ensure .env has POLYGON_RPC_URL and PRIVATE_KEY_BLOCKCHAIN
npm run deploy:polygon
```

### Step 4: Build Backend
```bash
cd backend
npm run build
```

### Step 5: Build Frontend
```bash
cd frontend
npm run build
```

## 🌍 Environment Configuration

### Backend (.env)

```env
# Database
DATABASE_URL=mongodb://localhost:27017/medical-zkp

# JWT Security
JWT_SECRET=your-super-secret-key-min-32-chars
JWT_EXPIRY=7d

# Blockchain
POLYGON_RPC_URL=https://polygon-rpc.com
PRIVATE_KEY_BLOCKCHAIN=0x... # Your private key (WITHOUT 0x prefix in .env)
SMART_CONTRACT_ADDRESS=0x... # Deployed contract address
CHAIN_ID=137

# Circuit Paths
CIRCUIT_WASM_PATH=../circuits/dist/eligibility_js/eligibility.wasm
CIRCUIT_ZKEY_PATH=../circuits/dist/eligibility_0001.zkey
VERIFYING_KEY_PATH=../circuits/dist/verification_key.json

# Server
PORT=5000
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
ALLOWED_ORIGINS=http://localhost:3000,http://localhost:5173
```

### Frontend (.env)

```env
VITE_API_BASE_URL=http://localhost:5000/api
VITE_BLOCKCHAIN_RPC=https://polygon-rpc.com
VITE_CONTRACT_ADDRESS=0x...
```

## 🏃 Running the Application

### Development Mode

#### Terminal 1: Backend
```bash
cd backend
npm run dev
# Runs on http://localhost:5000
```

#### Terminal 2: Frontend
```bash
cd frontend
npm run dev
# Runs on http://localhost:3000 or http://localhost:5173
```

#### Terminal 3: Hardhat Node (Optional, for testing)
```bash
cd contracts
npx hardhat node
# Runs on http://localhost:8545
```

### Production Build & Deployment

```bash
# Build all packages
npm run build

# Backend
cd backend
npm start  # Requires NODE_ENV=production

# Frontend (served by backend or CDN)
cd frontend
# Deploy dist/ folder to hosting (Vercel, Netlify, etc.)
```

## 🧪 Testing

### Circuits
```bash
cd circuits
npm test
```

### Backend
```bash
cd backend
npm test
```

### Contracts
```bash
cd contracts
npx hardhat test
```

### Frontend
```bash
cd frontend
npm run test
```

### Integration Tests (End-to-End)
```bash
# Start all services in dev mode
npm run dev

# In another terminal:
npm run test:e2e
```

## 📝 Sample API Calls

### Generate Proof
```bash
curl -X POST http://localhost:5000/api/zk/generate-proof \
  -H "Content-Type: application/json" \
  -d '{
    "credential": {
      "patientId": "P123456",
      "age": 35,
      "medicalData": {
        "hemoglobin": 14.5,
        "weight": 75
      }
    },
    "testType": "blood"
  }'
```

### Verify Proof
```bash
curl -X POST http://localhost:5000/api/zk/verify-proof \
  -H "Content-Type: application/json" \
  -d '{
    "proof": { ... },
    "publicSignals": [ ... ]
  }'
```

### Store on Blockchain
```bash
curl -X POST http://localhost:5000/api/zk/store-on-chain \
  -H "Content-Type: application/json" \
  -d '{
    "proof": { ... },
    "publicSignals": [ ... ],
    "credentialHash": "0x..."
  }'
```

## 🔒 Security Checklist

- [ ] All private keys stored in `.env` (never in git)
- [ ] `.gitignore` includes sensitive files
- [ ] HTTPS enabled in production
- [ ] CORS properly configured
- [ ] Rate limiting implemented
- [ ] Input validation on all endpoints
- [ ] Circuit outputs verified
- [ ] Smart contracts audited
- [ ] No raw medical data in logs
- [ ] Encryption keys rotated regularly

## 🐛 Troubleshooting

### "Cannot find module 'snarkjs'"
```bash
npm install snarkjs --save
```

### Circom compilation fails
```bash
# Update Circom
cargo install circom --all-features --force

# Try compilation again
cd circuits
npm run compile
```

### Proof generation too slow
- Ensure you have at least 4GB RAM free
- Check if WASM file is properly compiled
- Consider using rapidsnark for GPU acceleration

### Smart contract deployment fails
```bash
# Check network connection
curl https://polygon-rpc.com

# Verify private key has gas
# Check contract bytecode
npx hardhat verify <address> "<args>"
```

### Port already in use
```bash
# Linux/macOS
lsof -i :5000
kill -9 <PID>

# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

## 📚 Key Files to Understand

1. **Circuit Logic**: `circuits/src/eligibility.circom`
   - Medical eligibility constraints
   - Poseidon hashing
   - Test-specific rules

2. **Proof Generation**: `backend/src/services/zkp/proofService.ts`
   - Uses snarkjs to generate witnesses & proofs
   - Groth16 proving system

3. **Smart Contract**: `contracts/contracts/VerifyEligibility.sol`
   - On-chain proof verification
   - Result storage

4. **Frontend Flow**: `frontend/src/App.tsx`
   - User journey (upload → select → generate → result)
   - Result visualization

## 📖 Additional Resources

- [Circom Documentation](https://docs.circom.io)
- [Snarkjs Guide](https://github.com/iden3/snarkjs)
- [Hardhat Docs](https://hardhat.org)
- [Solidity Best Practices](https://docs.soliditylang.org)
- [Polygon Network Guide](https://polygon.technology)

## 🆘 Getting Help

1. **Check existing issues** in the repository
2. **Review documentation** in `/docs` folder
3. **Run tests** to validate setup
4. **Check console logs** for specific error messages
5. **Verify all environment variables** are set

## ✅ Verification Checklist

After setup, verify:
- [ ] `npm run build` completes without errors
- [ ] `npm run dev` starts all services
- [ ] Backend responds to `/health` endpoint
- [ ] Frontend loads in browser
- [ ] Sample proof generates successfully
- [ ] Smart contract is deployed
- [ ] Circuit WASM and keys are generated
- [ ] Environment variables are configured

---

**🎉 Congratulations! Your Medical ZKP-Blockchain system is ready!**

For questions or issues, refer to the troubleshooting section or check the documentation.
