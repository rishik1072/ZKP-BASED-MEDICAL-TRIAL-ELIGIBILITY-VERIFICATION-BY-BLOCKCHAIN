# Sepolia ETH Configuration Guide

## Overview

This application has been reconfigured to use **Sepolia ETH Testnet** instead of Polygon. Sepolia is Ethereum's official testnet.

## Network Details

| Parameter          | Value                            |
| ------------------ | -------------------------------- |
| **Chain ID**       | 11155111                         |
| **RPC Endpoint**   | https://rpc.ankr.com/eth_sepolia |
| **Currency**       | Sepolia ETH (sETH)               |
| **Block Explorer** | https://sepolia.etherscan.io     |
| **Status**         | Testnet                          |

## Alternative RPC Endpoints

If the primary RPC is slow, use one of these:

- **Ankr**: `https://rpc.ankr.com/eth_sepolia` ✅ (Primary)
- **Infura**: `https://sepolia.infura.io/v3/YOUR_INFURA_KEY`
- **Alchemy**: `https://eth-sepolia.g.alchemy.com/v2/YOUR_ALCHEMY_KEY`
- **Etherscan**: `https://rpc-sepolia.etherscan.io`

## Setup Instructions

### 1. Get Sepolia ETH Test Tokens

You'll need testnet Sepolia ETH to pay for gas fees. Get free testnet ETH from:

- **Alchemy Faucet**: https://www.alchemy.com/faucets/ethereum-sepolia
- **Sepolia Faucet**: https://sepoliafaucet.com
- **QuickNode**: https://faucet.quicknode.com/ethereum/sepolia
- **Infura**: https://www.infura.io/faucet/sepolia

### 2. Environment Configuration

Create or update your `.env` file:

```env
# BLOCKCHAIN (Sepolia ETH Testnet)
SEPOLIA_RPC_URL=https://rpc.ankr.com/eth_sepolia
PRIVATE_KEY_BLOCKCHAIN=0x... (your testnet wallet private key)
SMART_CONTRACT_ADDRESS=0x... (deployed contract address on Sepolia)
CHAIN_ID=11155111

# Other configs...
DATABASE_URL=mongodb://localhost:27017/medical-zkp
JWT_SECRET=your_jwt_secret_key_here
ENCRYPTION_KEY=your_32_byte_hex_key_here
```

### 3. Private Key Setup

To get a private key:

1. Create a wallet in **MetaMask** or similar
2. Go to account settings → "Export Private Key"
3. Add the private key (with `0x` prefix) to your `.env` file
4. Request testnet ETH from faucets mentioned above

### 4. Deploy Smart Contract

```bash
cd contracts

# Deploy to Sepolia
npx hardhat run scripts/deploy.js --network sepolia

# Or use the QuickDeploy for faster deployment
npx hardhat run scripts/deploy.js --network sepoliaAlt
```

The contract will output its address - save this as `SMART_CONTRACT_ADDRESS`.

### 5. Verify Contract on Etherscan

```bash
# Set Etherscan API key
export ETHERSCAN_API_KEY=your_etherscan_api_key

# Verify contract
npx hardhat verify --network sepolia CONTRACT_ADDRESS
```

### 6. Start the Application

```bash
# Backend
cd backend
npm install
npm run dev

# Frontend (in new terminal)
cd frontend
npm install
npm run dev
```

## Modified Files

✅ **Updated for Sepolia:**

- `contracts/hardhat.config.js` - Added Sepolia network config
- `backend/src/services/blockchain/contractService.ts` - Changed RPC to Sepolia
- `backend/src/routes/blockchain/contractRoutes.ts` - Updated network detection
- `backend/src/routes/zk/proofRoutes.ts` - Updated blockchain messages
- `.env.example` - Updated with Sepolia RPC URL and Chain ID

## Testing Flow

1. **Upload Credential** → Select file
2. **Generate Proof** → ZKP generation locally
3. **Store on Blockchain** → Transaction sent to Sepolia testnet
4. **View Result** → Transaction appears on Etherscan after confirmation

## Monitoring Transactions

View your transactions on: **https://sepolia.etherscan.io**

Search for your wallet address or transaction hash to see confirmations.

## Gas Costs

Sepolia transactions are **free or minimal cost** since it's testnet ETH. This is perfect for:

- ✅ Development
- ✅ Testing
- ✅ Deployment verification
- ✅ Circuit refinement

## Common Issues

### "Invalid network"

- Check if `CHAIN_ID=11155111` is set in `.env`
- Verify RPC URL is accessible

### "Insufficient gas"

- You need testnet Sepolia ETH - request from faucets above
- Check wallet address in MetaMask is same as private key

### "Contract not found"

- Ensure contract is deployed on Sepolia
- Verify `SMART_CONTRACT_ADDRESS` matches deployment

### "RPC timeout"

- Switch to alternative RPC endpoint
- Try `https://rpc-sepolia.etherscan.io`

## Next Steps

1. ✅ Get Sepolia ETH from faucet
2. ✅ Configure `.env` with your private key
3. ✅ Deploy contract: `npx hardhat run scripts/deploy.js --network sepolia`
4. ✅ Update `SMART_CONTRACT_ADDRESS` in `.env`
5. ✅ Start backend: `cd backend && npm run dev`
6. ✅ Start frontend: `cd frontend && npm run dev`
7. ✅ Test the full workflow

---

**Need Help?**

- Sepolia Docs: https://ethereum.org/en/developers/docs/networks/#sepolia
- Etherscan: https://sepolia.etherscan.io
- Hardhat Docs: https://hardhat.org/hardhat-runner/docs/guides/hardhat-network
