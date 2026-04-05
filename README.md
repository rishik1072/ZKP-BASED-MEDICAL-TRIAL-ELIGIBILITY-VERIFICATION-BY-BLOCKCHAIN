# 🏥 ZKP-Based Medical Trial Eligibility Verification System

A complete **Zero-Knowledge Proof (ZKP) based medical eligibility verification system** integrated with **blockchain** and a **secure full-stack web application**.

This system allows patients to prove eligibility **without revealing sensitive medical data**, ensuring privacy, security, and trust.

---

# 🚀 Features

### 🔐 Privacy & Security

* Zero-Knowledge Proofs (Circom + Groth16)
* AES-256-GCM Encryption (secure credentials)
* RSA Digital Signatures (doctor authentication)
* JWT Authentication & bcrypt password hashing
* Password-protected ZIP credential download

### ⛓️ Blockchain Integration

* Solidity Smart Contracts
* Immutable verification storage
* On-chain eligibility status + credential hash
* Polygon/Ethereum support

### 🧠 Smart Verification

* NMC Registry Doctor Verification (via Puppeteer)
* Eligibility logic via ZKP circuits
* Replay protection using nonce
* Merkle Tree commitments

### 🎨 Frontend

* React + Tailwind CSS UI
* Smooth animations (Framer Motion)
* Multi-step workflow (upload → proof → result)

---

# 📁 Project Structure

```text
ZKP-PROJECT/
├── d app/                # ZKP + Blockchain system
│   ├── backend/
│   ├── frontend/
│   ├── circuits/
│   ├── contracts/
│   └── docs/
│
├── web-app/             # Full-stack medical system
│   ├── backend/
│   ├── frontend/
│   └── README.md
```

---

# ⚙️ Prerequisites

* Node.js ≥ 16/18
* npm ≥ 8
* Circom
* Snarkjs
* Hardhat
* MetaMask (optional)

---

# 🛠️ Installation

## 🔹 1. Clone Repository

```bash
git clone https://github.com/rishik1072/ZKP-BASED-MEDICAL-TRIAL-ELIGIBILITY-VERIFICATION-BY-BLOCKCHAIN.git
cd ZKP-BASED-MEDICAL-TRIAL-ELIGIBILITY-VERIFICATION-BY-BLOCKCHAIN
```

---

## 🔹 2. Setup ZKP System

```bash
cd "d app"
npm run setup:all
npm run dev
```

---

## 🔹 3. Setup Web App

### Backend

```bash
cd web-app/backend
npm install
npm run dev
```

### Frontend

```bash
cd web-app/frontend
npm install
npm start
```

---

# 🌐 Running the System

| Service     | URL                   |
| ----------- | --------------------- |
| Frontend    | http://localhost:3000 |
| Backend API | http://localhost:5000 |

---

# 🧬 ZKP Workflow

1. Upload encrypted medical credential
2. Select test (Blood / MRI / CT)
3. Generate ZKP proof
4. Verify proof locally + blockchain
5. Store eligibility result on-chain

---

# 🧪 Medical Test Criteria

### Blood Donation

* Age > 18
* Hemoglobin threshold
* Weight > 50kg

### MRI Scan

* No metal implants
* No pacemaker
* Not pregnant

### CT Scan

* Age > 18
* No pregnancy
* No contrast allergy

---

# 🔄 API Endpoints

### ZKP

* `POST /zk/generate-proof`
* `POST /zk/verify-proof`
* `POST /zk/store-on-chain`
* `GET /zk/result/:hash`

### Web App

* `/api/auth` → login/register
* `/api/eligibility` → credential generation

---

# 🔐 Security Features

* Poseidon hashing (ZKP circuits)
* AES-256 encryption
* RSA signatures
* Nonce replay protection
* JWT authentication

---

# 🛠️ Tech Stack

### Backend

* Node.js + Express
* Snarkjs
* Ethers.js
* MongoDB (optional)

### Frontend

* React 18
* Tailwind CSS
* Axios

### ZKP

* Circom
* Groth16

### Blockchain

* Solidity
* Hardhat

---

# 🧪 Testing

```bash
npm run test:backend
npm run test:circuits
npm run test:contracts
npm run test:frontend
```

---

# ⚠️ Important Notes

* Never upload `node_modules`
* Never expose medical data
* Always use `.env` for secrets
* Test locally before deployment

---

# 🚀 Deployment

### Backend

```bash
npm start
```

### Frontend

```bash
npm run build
```

---

# 🤝 Contribution

1. Fork repo
2. Create branch
3. Make changes
4. Submit PR

---

# 📄 License

MIT License

---

# ❤️ Built for Privacy & Security

Secure medical verification using ZKP + Blockchain
