# 🏥 Medical ZKP Blockchain Eligibility Verification System

A complete Zero-Knowledge Proof based medical trial eligibility verification system with blockchain integration. This system allows patients to prove their medical eligibility for trials WITHOUT revealing sensitive medical data.

## 🎯 Features

✅ **Zero-Knowledge Proofs (Circom + Groth16)** - Verify eligibility without exposing raw data  
✅ **Blockchain Integration (Solidity)** - Store verification results immutably  
✅ **Privacy-First Design** - Only eligibility status and credential hash on-chain  
✅ **Doctor Authentication** - JWT + RSA signature verification  
✅ **Encrypted Credentials** - AES-256-GCM encryption  
✅ **Modern UI/UX** - Glassmorphism design with smooth animations  
✅ **Modular Architecture** - Separate ZKP, blockchain, and business logic layers  

## 📋 System Architecture

```
medical-zkp-blockchain/
├── backend/          # Node.js + Express API with ZKP integration
├── frontend/         # React SPA with modern UI
├── circuits/         # Circom circuits for eligibility proofs
├── contracts/        # Solidity smart contracts
└── docs/            # Documentation
```

## 🚀 Quick Start

### Prerequisites
- Node.js >= 16
- npm >= 8
- Circom compiler
- Snarkjs
- Hardhat
- MetaMask (for blockchain interaction)

### Installation

```bash
# Clone and setup
cd d\ app
npm run setup:all

# Start development servers
npm run dev
```

### Build for Production

```bash
npm run build
```

## 📁 Directory Structure

### Backend (`backend/`)
- `src/routes/zk/` - ZKP endpoints
- `src/services/zkp/` - ZKP logic
- `src/services/blockchain/` - Smart contract interaction
- `src/models/` - Database models

### Frontend (`frontend/`)
- `src/pages/` - Main pages
- `src/components/` - Reusable components
- `src/services/` - API services
- `src/hooks/` - Custom React hooks

### Circuits (`circuits/`)
- `src/eligibility.circom` - Main eligibility circuit
- `src/poseidon.circom` - Poseidon hash circuit
- `src/merkle.circom` - Merkle tree circuit

### Contracts (`contracts/`)
- `contracts/VerifyEligibility.sol` - Main verifier contract
- `deploy/` - Deployment scripts

## 🔐 Security Features

- **Poseidon Hash** - Used inside ZKP circuits (not SHA-256)
- **Groth16 Proofs** - Proof of eligibility without data exposure
- **AES-256-GCM** - Credential encryption
- **RSA Signatures** - Doctor authentication
- **Merkle Trees** - Credential commitment
- **Nonce Protection** - Replay attack prevention

## 📊 ZKP Flow

1. **Upload Credential** → JSON with encrypted medical data
2. **Select Test** → Blood Donation, MRI, or CT Scan
3. **Generate Proof** → Circom circuit generates witness & proof
4. **Verify Proof** → Groth16 verification (local + on-chain)
5. **Store Result** → Hash + status on blockchain
6. **Get Result** → Query blockchain or REST API

## 🧬 Medical Test Requirements

### Blood Donation
- Age > 18 years
- Hemoglobin > 12.5 g/dL (female), > 13.5 g/dL (male)
- Weight > 50 kg
- No infected blood markers

### MRI Scan
- No metal implants
- No pacemaker
- Age > 5 years
- Not pregnant (if female)
- No recent tattoos

### CT Scan
- No pregnancy
- Age > 18 years
- No contrast allergy
- Weight < 160 kg
- No recent barium studies

## 🔄 API Endpoints

### ZKP Endpoints

**POST** `/zk/generate-proof`
- Generate ZKP proof for eligibility
- Input: credential, testType
- Output: proof, publicSignals

**POST** `/zk/verify-proof`
- Verify ZKP proof locally
- Input: proof, publicSignals
- Output: isValid

**POST** `/zk/store-on-chain`
- Store verification result on blockchain
- Input: proof, publicSignals, credentialHash
- Output: txHash, blockchainStatus

**GET** `/zk/result/:credentialHash`
- Get stored result from blockchain
- Output: status, timestamp, txHash

## 🛠️ Technology Stack

### Backend
- **Runtime**: Node.js
- **Framework**: Express.js
- **Proof Generation**: Snarkjs
- **Blockchain**: Ethers.js
- **Database**: MongoDB (optional)
- **Encryption**: crypto (Node.js native)

### Frontend
- **UI Framework**: React 18
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **State Management**: TanStack Query + Zustand
- **Web3**: wagmi + viem

### Circuits
- **Language**: Circom
- **Prover**: Snarkjs (Groth16)
- **Hash**: Poseidon

### Blockchain
- **Language**: Solidity
- **Development**: Hardhat
- **Network**: Polygon (or Ethereum)
- **Verifier**: Groth16 Solidity verifier

## 📝 Setup Instructions

### Step 1: Install Dependencies
```bash
npm run setup:all
```

### Step 2: Compile Circuits
```bash
npm run build:circuits
```

This generates:
- `eligibility.wasm`
- `eligibility_0001.zkey`
- `verification_key.json`
- Solidity verifier contract

### Step 3: Deploy Smart Contracts
```bash
cd contracts
npx hardhat run scripts/deploy.js --network polygon
```

### Step 4: Update Environment Variables
Copy `.env.example` to `.env` and fill in:
- `SMART_CONTRACT_ADDRESS` (from deployment)
- `PRIVATE_KEY_BLOCKCHAIN`
- `POLYGON_RPC_URL`
- Other credentials

### Step 5: Start Development
```bash
npm run dev
```

Backend runs on `http://localhost:5000`  
Frontend runs on `http://localhost:3000` or `http://localhost:5173`

## 🧪 Testing

```bash
# Backend tests
npm run test:backend

# Circuit tests
npm run test:circuits

# Contract tests
npm run test:contracts

# Frontend tests
npm run test:frontend
```

## 📚 Circuit Documentation

### Eligibility Logic

The circuit validates four main inputs:
1. **age** - Birth year
2. **medicalValues** - Test-specific values (hemoglobin, pregnancy status, etc.)
3. **testType** - 0: Blood, 1: MRI, 2: CT
4. **nonce** - Replay protection

Output:
1. **eligible** - 0 or 1 (binary eligibility status)
2. **credentialHash** - Poseidon hash of credential

## 🔗 Smart Contract Functions

```solidity
function verifyAndStoreProof(
  uint256[2] calldata _pA,
  uint256[2][2] calldata _pB,
  uint256[2] calldata _pC,
  uint256[1] calldata _pubSignals
) external returns (bool)

function getResult(bytes32 credentialHash) 
  external view returns (VerificationResult)

function isEligible(bytes32 credentialHash) 
  external view returns (bool)
```

## 🎨 UI Components

- **FileUploadDragDrop** - Drag & drop credential upload
- **TestSelector** - Test type selection with descriptions
- **ProofGenerator** - Progress indicator for proof generation
- **ResultCard** - Interactive result display
- **TransactionViewer** - Blockchain transaction details
- **Stepper** - Multi-step workflow navigation

## ⚠️ Important Notes

1. **Never expose raw medical data** - Only eligibility status goes on-chain
2. **Use Poseidon hashing** - Required for ZKP circuit compatibility
3. **Keep circuits updated** - Ensure compatibility with new test requirements
4. **Test locally first** - Before deploying to mainnet
5. **Store keys securely** - Use environment variables, never hardcode

## 🐛 Troubleshooting

### Circuit compilation fails
```bash
# Ensure circom is installed
circom --version

# If not installed:
npm install -g circom
```

### Proof generation too slow
- Generated WASM is large; ensure sufficient memory
- Consider using GPU acceleration with rapidsnark

### Smart contract deployment fails
- Check network RPC endpoint
- Verify private key has sufficient gas
- Confirm contract address format

## 📖 Additional Resources

- [Circom Documentation](https://docs.circom.io)
- [Snarkjs Guide](https://github.com/iden3/snarkjs)
- [Solidity Docs](https://docs.soliditylang.org)
- [Hardhat Guide](https://hardhat.org/docs)

## 📄 License

MIT License - See LICENSE.md

## 👥 Support

For issues or questions:
1. Check documentation in `/docs`
2. Review example flows in `/examples`
3. Open an issue on the repository

---

**Built with ❤️ for secure, privacy-preserving medical verification**
