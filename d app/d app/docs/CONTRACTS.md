# 🔗 Smart Contract Architecture

## Overview

The `VerifyEligibility` smart contract stores and verifies zero-knowledge proofs on the blockchain, ensuring immutable proof of medical eligibility verification without exposing sensitive data.

## Smart Contract: VerifyEligibility.sol

### Core Functionality

#### 1. Proof Verification & Storage
```solidity
function verifyAndStoreProof(
    uint256[2] calldata _pA,
    uint256[2][2] calldata _pB,
    uint256[2] calldata _pC,
    uint256[1] calldata _pubSignals
) external returns (bool success)
```

**Flow**:
1. Receives Groth16 proof from backend
2. Delegates verification to verifier contract
3. Stores result with timestamp
4. Emits event for transparency

**Gas Cost**: ~1-2M gas

#### 2. Result Retrieval
```solidity
function getResult(bytes32 _credentialHash)
    external view returns (VerificationResult memory)
```

**Returns**:
```solidity
struct VerificationResult {
    bool eligible;
    uint256 timestamp;
    string transactionHash;
    address verifier;
}
```

#### 3. Status Checking
```solidity
function isEligible(bytes32 _credentialHash) 
    external view returns (bool)

function getStatus(bytes32 _credentialHash)
    external view returns (string memory)  // "ELIGIBLE" or "NOT_ELIGIBLE"
```

## Data Structures

### VerificationResult

```solidity
struct VerificationResult {
    bool eligible;           // 1-bit eligibility status
    uint256 timestamp;       // Verification timestamp
    string transactionHash;  // Reference TX hash
    address verifier;        // Address of verifier
}
```

**Storage**:
```solidity
mapping(bytes32 => VerificationResult) public results;
```

**Key**: Credential hash (32 bytes)  
**Value**: Full result (1 slot + optional strings)

## Security Model

### Access Control

```solidity
// Any address can call verification functions
// No role-based access control
// Read-only functions are view (no state change)
```

**Rationale**: Data aggregation is public benefit

### Proof Validation

```solidity
function verifyAndStoreProof(...) external returns (bool) {
    require(
        verifier.verifyProof(_pA, _pB, _pC, _pubSignals),
        "Proof verification failed"
    );
    // ... store result
}
```

**Security**: Only valid proofs are stored

### Replay Attack Prevention

```
Circuit Input: [age, testType, nonce, ...]
                                    ^^^^
                              Unique per proof

Backend: Generates unique nonce per request
Frontend: Never reuses nonce
```

## Events

### ProofVerified
```solidity
event ProofVerified(
    bytes32 indexed credentialHash,
    bool eligible,
    uint256 timestamp,
    address indexed verifier
);
```

**Use Cases**:
- Audit trail
- Real-time monitoring
- Off-chain indexing

### ResultStored
```solidity
event ResultStored(
    bytes32 indexed credentialHash,
    bool eligible,
    string transactionHash
);
```

## Integration Points

### From Backend

**1. Initialize on deployment**:
```javascript
const contract = new ethers.Contract(
    contractAddress,
    ABI,
    signer  // Must be authorized account
);
```

**2. Send proof**:
```javascript
const tx = await contract.verifyAndStoreProof(
    [proof.pi_a[0], proof.pi_a[1]],
    [[proof.pi_b[0][0], proof.pi_b[0][1]], [...]],
    [proof.pi_c[0], proof.pi_c[1]],
    [publicSignals[0]]  // Only first signal (eligible)
);

await tx.wait();  // Wait for confirmation
```

**3. Query result**:
```javascript
const result = await contract.getResult(credentialHash);
console.log(result.eligible);       // boolean
console.log(result.timestamp);      // uint256
```

## Gas Optimization

### Storage Layout

**Proof data** (on-chain):
- Only first public signal stored (eligible/not eligible)
- Hash of credential instead of full data
- ~1 storage slot per result

**Cost Analysis**:
- Storage write: ~20k gas
- Verification: ~1M gas
- Total transaction: ~1.2M gas
- Cost at 30 gwei: ~$36 USD

### State Variables

```solidity
IGroth16Verifier public verifier;          // 1 slot (20 bytes)
mapping(bytes32 => VerificationResult) public results;  // 1 slot per entry
```

## Deployment Architecture

### Network Options

#### 1. **Polygon Mainnet**
- Smart chain: 137
- Low gas: ~$0.01 per transaction
- Production ready
- Mainnet security

#### 2. **Polygon Mumbai Testnet**
- Chain ID: 80001
- Free test MATIC from faucet
- Development/testing
- Same codebase as mainnet

#### 3. **Ethereum Mainnet**
- Chain ID: 1
- High gas costs: ~$50-200 per transaction
- Maximum security
- Not recommended for this use case

#### 4. **Sepolia Testnet**
- Chain ID: 11155111
- Free ETH from faucet
- Test Ethereum
- Good for contract testing

### Contract Initialization

```javascript
// Deploy new verifier contract or use existing
const VerifyEligibility = await ethers.getContractFactory("VerifyEligibility");
const contract = await VerifyEligibility.deploy(verifierAddress);
await contract.deployTransaction.wait();

console.log("Contract deployed at:", contract.address);
```

## Verification Flow (On-Chain)

```
Backend Request
    ↓
Edge-Chain Verification (local)
    ↓
Groth16 Proof ✓
    ↓
Smart Contract Call
    ↓
Solidity Verifier
    ↓
Check: π * G = π_B  (Pairing check)
    ↓
Verify Public Signals
    ↓
Store Result + Event
    ↓
Return TX Hash to Frontend
```

## Advanced Features

### 1. Multi-Test Support

```solidity
// Already supported through multiplexing in circuit
// testType parameter selects which test's constraints apply
```

### 2. Batch Verification

```solidity
// Future enhancement: Verify multiple proofs in one transaction
function verifyBatch(
    Proof[] calldata proofs,
    bytes32[] calldata hashes
) external {
    for (uint i = 0; i < proofs.length; i++) {
        verifyAndStoreProof(...);
    }
}
```

### 3. Eligibility Expiration

```solidity
// Future: Add expiration check
function isCurrentlyEligible(bytes32 hash) 
    external view returns (bool) 
{
    VerificationResult memory result = results[hash];
    return result.eligible && 
           (block.timestamp - result.timestamp) < 365 days;
}
```

### 4. Batch Result Update

```solidity
// Allow verifier to update multiple results atomically
function batchStoreResults(
    bytes32[] calldata hashes,
    bool[] calldata eligibilities
) external onlyVerifier {
    // ...
}
```

## Testing Strategy

### Unit Tests

```javascript
describe("VerifyEligibility", () => {
    it("should store eligible result", async () => {
        const result = await contract.verifyAndStoreProof(
            proof.pi_a, proof.pi_b, proof.pi_c, signals
        );
        expect(result).to.be.true;
    });

    it("should retrieve stored result", async () => {
        const retrieved = await contract.getResult(hash);
        expect(retrieved.eligible).to.be.true;
    });
});
```

### Integration Tests

```javascript
describe("Full Flow", () => {
    it("should generate, verify, and store proof", async () => {
        // 1. Generate proof off-chain
        const proof = await generateProof(input);

        // 2. Verify and store on-chain
        const tx = await contract.verifyAndStoreProof(...);

        // 3. Query result
        const result = await contract.getResult(hash);
        expect(result.eligible).to.equal(expectedValue);
    });
});
```

## Monitoring & Analytics

### Event Indexing

```javascript
// Listen for ProofVerified events
contract.on("ProofVerified", (hash, eligible, timestamp, verifier) => {
    console.log(`Proof verified: ${hash}`);
    console.log(`Eligible: ${eligible}`);
    console.log(`Block time: ${new Date(timestamp * 1000)}`);
});
```

### Graph Protocol Indexing

```graphql
# Subgraph query example
query {
  verifications(first: 10, orderBy: timestamp, orderDirection: desc) {
    id
    credentialHash
    eligible
    timestamp
    verifier
  }
}
```

## Maintenance & Upgrades

### Upgaradeable Pattern (Optional)

If using proxy pattern:

```solidity
// Using UUPS proxy
import "@openzeppelin/contracts/proxy/utils/UUPSUpgradeable.sol";

contract VerifyEligibility is UUPSUpgradeable {
    // Can be upgraded with new logic
}
```

### Migrations

```javascript
// If contract needs to migrate:
// 1. Deploy new contract
// 2. Copy existing results to new contract
// 3. Update contract address in backend
// 4. Update frontend configuration
```

## Cost Analysis

### Per-Verification Cost (Polygon)

| Component | Cost |
|-----------|------|
| Proof verification | ~1M gas @ 30 gwei |
| State write | 20k gas |
| Event emission | 1k gas |
| **Total** | **~1.02M gas** |
| **USD Cost** | **~$0.01-0.05** |

### Monthly Cost (1000 verifications)

| Network | Cost |
|---------|------|
| Polygon | ~$10-50 |
| Ethereum | ~$50-200 |
| Mumbai (free) | N/A |

## Compliance & Privacy

### GDPR Considerations

- ✅ No personal data stored on-chain
- ✅ Only anonymized credential hash stored
- ✅ No indirect identification possible
- ✅ Results are immutable (cannot delete)

### Data Retention

- Smart contract: Indefinite retention
- For GDPR compliance, may need off-chain storage policy
- Consider "right to be forgotten" limitations

---

**See Also**:
- [Solidity Security Best Practices](https://solidity.readthedocs.io)
- [OpenZeppelin Contracts](https://docs.openzeppelin.com)
- [Polygon Documentation](https://docs.polygon.technology)
