# 🐛 Troubleshooting Guide

Common issues and their solutions.

## Installation Issues

### "Cannot find circom"
```bash
# Verify installation
circom --version

# If not installed, install Rust first
curl --proto '=https' --tlsv1.2 -sSf https://sh.rustup.rs | sh
source $HOME/.cargo/env

# Install circom
cargo install circom --all-features

# Verify again
circom --version
```

### "npm install fails"
```bash
# Clear cache
npm cache clean --force

# Re-install
npm install

# For specific package errors:
npm install snarkjs --save
npm install ethers --save
```

### "Out of memory during build"
```bash
# Increase Node memory
export NODE_OPTIONS=--max-old-space-size=4096
npm run build

# Or with specific project:
cd circuits
NODE_OPTIONS=--max-old-space-size=4096 npm run build
```

### "Port already in use"
```bash
# Linux/macOS - Find and kill process
lsof -i :5000
kill -9 <PID>

# Windows - Find and kill process
netstat -ano | findstr :5000
taskkill /PID <PID> /F

# Or change port in .env
PORT=5001
```

## Compilation Errors

### "Error: Cannot find module 'circomlib'"
```bash
cd circuits
npm install circomlibjs --save
npm run compile
```

### "Circuit compilation takes too long"
- This is normal (5-10 minutes)
- Ensure you have 4GB+ RAM free
- Don't interrupt the process
- Check system resources:
  ```bash
  # Linux
  free -h
  
  # macOS
  vm_stat
  ```

### "R1CS file not found after compilation"
```bash
# Verify circom is installed correctly
which circom

# Try compilation manually
circom src/eligibility.circom --r1cs --wasm --sym -o dist

# Check output
ls -lah dist/
```

## Backend Issues

### "Cannot start backend - port 5000 in use"
```bash
# Use different port
PORT=5001 npm run dev

# Or update in .env
echo "PORT=5001" >> .env
```

### "Backend crashes on startup"
```bash
# Check environment variables
cat .env

# Verify all required variables:
# - CIRCUIT_WASM_PATH
# - CIRCUIT_ZKEY_PATH
# - VERIFYING_KEY_PATH

# Check file exists:
ls -la ../circuits/dist/eligibility.wasm

# Update if needed:
CIRCUIT_WASM_PATH=../circuits/dist/eligibility_js/eligibility.wasm
```

### "Error: Cannot find witness calculator"
```bash
# Rebuild circuits
cd circuits
npm run build

# Verify files exist
ls -la dist/eligibility_js/

# Update backend path if needed
```

### "Proof generation timeout"
```bash
# Increase backend timeout
# In backend/src/routes/zk/proofRoutes.ts
// Increase timeout or implement streaming

# Or increase Node timeout
NODE_OPTIONS=--max-old-space-size=4096 npm run dev
```

### "Module not found: snarkjs"
```bash
cd backend
npm install snarkjs --save
npm run dev
```

## Frontend Issues

### "Frontend won't load"
```bash
# Check if dev server is running
curl http://localhost:3000

# Check Vite logs
npm run dev

# Try different port (Vite auto-increments)
# Default: 5173
```

### "Cannot connect to backend"
```bash
# Verify backend is running
curl http://localhost:5000/health

# Check CORS configuration in backend
# In .env or hardcoded in index.ts
ALLOWED_ORIGINS=http://localhost:3000

# Check frontend proxy config
# vite.config.ts should have proxy setup
```

### "Tailwind CSS not working"
```bash
# Rebuild Tailwind
npm run build

# Or restart dev server
npm run dev

# Check tailwind.config.js includes correct paths
```

### "Module not found errors"
```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install

# Check imports use correct paths
# @/ alias should work (tsconfig.json configured)
```

## ZKP Issues

### "Proof generation fails"
```bash
# Check all files exist:
ls -la circuits/dist/
# Should have:
# - eligibility_js/eligibility.wasm
# - eligibility_0001.zkey
# - verification_key.json

# Try regenerating keys
cd circuits
npm run setup

# Check circuit input format in backend
```

### "Proof verification fails locally"
```bash
# Verify verification key exists
ls -la circuits/dist/verification_key.json

# Check backend verification logic
# In backend/src/services/zkp/proofService.ts

# Try with simple test case
```

### "WASM file too large/slow"
- Normal behavior (50-100MB)
- Proof generation: 3-5 seconds normal
- Consider using rapidsnark for GPU acceleration

### "Witness calculation fails"
```bash
# Check circuit input format
# In backend/src/services/zkp/proofService.ts

// Ensure inputs match:
const circuitInput = {
  age: inputs.age,
  testType: inputs.testType,
  hemoglobin: inputs.medicalValues.hemoglobin || 0,
  // ... all required fields
};
```

## Blockchain Issues

### "Cannot connect to RPC endpoint"
```bash
# Test RPC endpoint
curl -X POST https://polygon-rpc.com \
  -H "Content-Type: application/json" \
  -d '{"jsonrpc":"2.0","method":"web3_clientVersion","params":[],"id":1}'

# Update in .env
POLYGON_RPC_URL=https://polygon-rpc.com

# Or try alternative
POLYGON_RPC_URL=https://rpc-mainnet.maticvigil.com
```

### "Smart contract deployment fails"
```bash
# Verify private key format
# Should NOT have 0x prefix in .env
PRIVATE_KEY_BLOCKCHAIN=abc123...

# Check account has gas
# Visit https://www.maticvigil.com for Mumbai testnet

# Try deploying to testnet first
npm run deploy:mumbai
```

### "Transaction stuck/pending"
```bash
# Check status on blockchain explorer
# Polygon: https://polygonscan.com

# If stuck, try increasing gas:
# In contracts/scripts/deploy.js

# Or check nonce is correct
ethers.provider.getTransactionCount(signerAddress)
```

### "Contract verification fails"
```bash
# Manual verification on Etherscan-style explorers
# Copy contract code and source files

# Or use Hardhat verification:
npx hardhat verify <address> "<args>"
```

## Environment Issues

### "Environment variables not loading"
```bash
# Ensure .env file exists in correct directory
ls -la .env

# For backend
cd backend && ls -la .env

# For frontend
cd frontend && ls -la .env

# Reload shell
source .env
```

### "Keys not found in .env"
```bash
# Add to .env:
CIRCUIT_WASM_PATH=../circuits/dist/eligibility_js/eligibility.wasm
CIRCUIT_ZKEY_PATH=../circuits/dist/eligibility_0001.zkey
VERIFYING_KEY_PATH=../circuits/dist/verification_key.json
```

### ".env file permissions"
```bash
# Ensure readable
chmod 644 .env

# Ensure not in git (security)
grep ".env" .gitignore
```

## Database Issues

### "MongoDB connection fails"
```bash
# Check MongoDB is running
mongosh

# Update connection string
DATABASE_URL=mongodb://localhost:27017/medical-zkp

# Or use MongoDB Atlas for production
DATABASE_URL=mongodb+srv://user:pass@cluster.mongodb.net/medical-zkp
```

## Git Issues

### "Cannot commit (files too large)"
```bash
# Don't commit zkey files
echo "circuits/dist/*.zkey" >> .gitignore
echo "circuits/*.ptau" >> .gitignore

# Remove from git history if already committed
git rm --cached circuits/dist/*.zkey
git commit -m "Remove large files"
```

## Performance Issues

### "Slow proof generation"
- Normal: 3-5 seconds
- If slower: check system resources
- Solution: Ensure 4GB+ RAM free
- Alternative: Use GPU acceleration (rapidsnark)

### "High memory usage"
```bash
# Monitor resource usage
top  # Linux/macOS
Task Manager  # Windows

# Increase available memory
export NODE_OPTIONS=--max-old-space-size=8192
npm run dev
```

### "Slow API responses"
```bash
# Check backend logs
tail -f backend/logs/*.log

# Monitor system resources
htop

# Check if blockchain is syncing
```

## Testing Issues

### "Tests fail with 'Cannot find module'"
```bash
npm install  # Reinstall dependencies
npm test     # Run tests again
```

### "Test timeout"
```bash
# Increase Jest timeout
// In jest.config.js or package.json
"jest": {
  "testTimeout": 30000
}
```

## Debugging Tips

### Enable verbose logging
```bash
# Backend
DEBUG=* npm run dev

# Or update logger level in utils/logger.ts
LOG_LEVEL=debug

# Frontend
npm run dev  # Logs in browser console
```

### Use browser DevTools
1. Open Chrome/Firefox
2. Press F12
3. Check Console tab for errors
4. Check Network tab for API calls
5. Check Application > Local Storage for client state

### Check blockchain transactions
1. Go to https://polygonscan.com (mainnet)
2. Or https://mumbai.polygonscan.com (testnet)
3. Paste transaction hash
4. Check status and gas used

### Create minimal test case
```javascript
// Isolate issue
const input = {
  age: 35,
  testType: 0,
  hemoglobin: 1450,
  weight: 75,
  metalImplants: 0,
  pacemaker: 0,
  pregnancy: 0,
  nonce: 123456
};

// Try proof gen
generateProof(input).then(proof => {
  console.log('Success!', proof);
}).catch(err => {
  console.error('Error:', err);
});
```

## Getting Help

1. **Check console output** for error messages
2. **Read error message** carefully - often indicates the problem
3. **Search this guide** using Ctrl+F
4. **Check documentation** in docs/ folder
5. **Try examples** in examples/ folder
6. **Review setup** step-by-step in SETUP.md

## Still Stuck?

1. Gather information:
   ```bash
   npm list  # Check versions
   node --version
   npm --version
   ```

2. Check logs:
   ```bash
   cat logs/error.log
   tail -f logs/all.log
   ```

3. Try clean rebuild:
   ```bash
   npm run build  # Full rebuild
   ```

4. Review documentation again
5. Create minimal reproduction case
6. Check GitHub issues for similar problems

---

**Most issues can be resolved by:**
1. ✅ Running `npm run setup:all`
2. ✅ Following SETUP.md exactly
3. ✅ Checking environment variables
4. ✅ Ensuring all dependencies installed
5. ✅ Restarting services

If still stuck, carefully read error messages - they usually indicate the exact problem!
