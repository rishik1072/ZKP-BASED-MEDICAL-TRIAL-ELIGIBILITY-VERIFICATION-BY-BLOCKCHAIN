# 🔐 ZKP Circuit Documentation

## Overview

The Medical Eligibility ZKP system uses Circom circuits to generate zero-knowledge proofs that verify medical eligibility WITHOUT exposing any raw medical data.

## Circuit: `eligibility.circom`

### Purpose
Verify that a patient is eligible for a specific medical test based on configured constraints, without revealing their actual medical values.

### Design Philosophy
1. **Inputs**: Medical data + test type
2. **Computation**: Verify constraints silently
3. **Output**: Only "Eligible" or "Not Eligible" + credential hash
4. **Privacy**: No intermediate values leaked

### Input Signals

```circom
signal input age;                      // Age in years
signal input testType;                 // 0=Blood, 1=MRI, 2=CT
signal input hemoglobin;               // Hemoglobin * 100
signal input weight;                   // Weight in kg
signal input metalImplants;            // 1 if true, 0 if false
signal input pacemaker;                // 1 if true, 0 if false
signal input pregnancy;                // 1 if true, 0 if false
signal input nonce;                    // Random nonce for replay protection
```

### Output Signals

```circom
signal output eligible;                // 1 = Eligible, 0 = Not Eligible
signal output credentialHash;          // Poseidon(age, weight, nonce)
```

### Eligibility Rules

#### Blood Donation (testType = 0)
```
✓ Age > 18 years
✓ Hemoglobin > 12.5 g/dL (stored as 1250)
✓ Weight > 50 kg
✓ All above conditions must be true
```

Circuit representation:
```circom
signal bloodEligible;
signal bloodAge <== age > 18 ? 1 : 0;
signal bloodHemoglobin <== hemoglobin > 1250 ? 1 : 0;
signal bloodWeight <== weight > 50 ? 1 : 0;
bloodEligible <== bloodAge * bloodHemoglobin * bloodWeight;
```

#### MRI Scan (testType = 1)
```
✓ No metal implants
✓ No pacemaker
✓ Age > 5 years
✓ Not pregnant
✓ All above conditions must be true
```

Circuit representation:
```circom
signal mriEligible;
signal mriNoMetals <== metalImplants === 0 ? 1 : 0;
signal mriNoPacemaker <== pacemaker === 0 ? 1 : 0;
signal mriAge <== age > 5 ? 1 : 0;
signal mriNotPregnant <== pregnancy === 0 ? 1 : 0;
mriEligible <== mriAge * mriNoMetals * mriNoPacemaker * mriNotPregnant;
```

#### CT Scan (testType = 2)
```
✓ Not pregnant
✓ Age > 18 years
✓ Weight < 160 kg
✓ All above conditions must be true
```

Circuit representation:
```circom
signal ctEligible;
signal ctAge <== age > 18 ? 1 : 0;
signal ctWeight <== weight < 160000 ? 1 : 0;
signal ctNotPregnant <== pregnancy === 0 ? 1 : 0;
ctEligible <== ctAge * ctWeight * ctNotPregnant;
```

### Test Type Multiplexing

```circom
signal isBloo <== testType === 0 ? 1 : 0;
signal isMRI <== testType === 1 ? 1 : 0;
signal isCT <== testType === 2 ? 1 : 0;

eligible <== (isBloo * bloodEligible) + (isMRI * mriEligible) + (isCT * ctEligible);
```

### Hashing with Poseidon

```circom
include "circomlib/poseidon.circom";

signal hash <== Poseidon(3)([age, weight, nonce]);
credentialHash <== hash;
```

**Why Poseidon?**
- Efficient inside zero-knowledge circuits
- ZK-friendly (arithmetic circuit optimized)
- Unlike SHA-256 (requires many constraints)
- Standard for privacy protocols

## Constraint System

### R1CS (Rank-1 Constraint System)

The compiled circuit generates constraints of the form:
```
<a, witness> * <b, witness> = <c, witness>
```

For Blood Donation:
- Constraint: `age > 18` → 18 constraints
- Constraint: `hemoglobin > 1250` → 20 constraints
- Constraint: `weight > 50` → 15 constraints
- Multiplication gates → ~50 constraints

**Total**: ~200-300 constraints per circuit

### Witness Size

- Input signals: 8
- Intermediate signals: ~50
- Constants: Hardcoded
- **Total witness size**: ~10-20 KB

## Proving System: Groth16

### Key Components

1. **Trusted Setup**
   - Powers of Tau ceremony
   - Generating proving key (zkey file)
   - Public parameters trusted setup

2. **Witness Generation**
   - Input values → WASM execution
   - Computes all intermediate signals
   - Creates witness file (~50 KB)

3. **Proof Generation**
   - Uses witness + proving key
   - Generates proof (~200 bytes)
   - Proof structure: (πA, πB, πC)

4. **Verification**
   - Uses public signals + proof + verifying key
   - Polynomial identity check
   - Returns boolean (valid/invalid)

### Proof Size
- πA: 2 field elements (64 bytes)
- πB: 3 points × 2 coordinates = 6 elements (192 bytes)
- πC: 2 field elements (64 bytes)
- **Total**: ~320 bytes on-chain

## Compilation Process

### Step 1: Circom Compilation
```bash
circom src/eligibility.circom --r1cs --wasm --sym -o dist
```

Outputs:
- `eligibility.r1cs` - Constraint system
- `eligibility_js/eligibility.wasm` - Witness calculator
- `eligibility_js/eligibility.js` - JavaScript wrapper
- `eligibility.sym` - Symbol table (debugging)

### Step 2: Trusted Setup
```bash
npm run setup
```

Generates:
- `pot12_0000.ptau` - Powers of Tau (2.4 GB)
- `eligibility_0001.zkey` - Proving key (~50 MB)
- `verification_key.json` - Verification key

### Step 3: Solidity Verifier
```bash
snarkjs zKey exportSolidityVerifier eligibility_0001.zkey VerifyEligibility.sol
```

Produces smart contract:
```solidity
function verifyProof(
    uint256[2] calldata _pA,
    uint256[2][2] calldata _pB,
    uint256[2] calldata _pC,
    uint256[1] calldata _pubSignals
) external view returns (bool)
```

## Usage Flow

### 1. Credential Input
```javascript
{
  age: 35,
  testType: 0, // Blood donation
  hemoglobin: 1450, // 14.5 g/dL
  weight: 75,
  metalImplants: 0,
  pacemaker: 0,
  pregnancy: 0,
  nonce: 123456
}
```

### 2. Witness Generation
```javascript
const witness = await snarkjs.wtns.calculate(
  input,
  'eligibility.wasm'
);
```

### 3. Proof Generation
```javascript
const { proof, publicSignals } = await snarkjs.groth16.prove(
  'eligibility_0001.zkey',
  witness
);
```

### 4. Verification (Off-Chain)
```javascript
const verified = await snarkjs.groth16.verify(
  verificationKey,
  publicSignals,
  proof
);
```

### 5. On-Chain Verification
```solidity
bool verified = verifier.verifyProof(
    proof.pi_a,
    proof.pi_b,
    proof.pi_c,
    publicSignals
);
```

## Security Considerations

### 1. Trusted Setup Toxicity
- Powers of Tau ceremony destroys "toxic waste"
- Security depends on ceremony integrity
- Cannot re-verify setup (one-time)

**Mitigation**: Use established PTAU ceremonies (Ethereum Foundation, etc.)

### 2. Front-Running
- Proof doesn't expire
- Same proof can be replayed with different `testType`

**Mitigation**: Include `nonce` in witness

### 3. Public Signals
- Eligibility status is visible on-chain
- Others can see who is eligible/ineligible

**Mitigation**: 
- Encrypt public signals on-chain
- Use confidential transactions
- Store only hash of eligibility

### 4. Correctness of Constraints
- Must ensure all paths are covered
- Off-by-one errors leak information

**Mitigation**:
- Fuzz testing of constraints
- Symbolic verification
- Comprehensive unit tests

## Performance Characteristics

| Operation | Time | Size |
|-----------|------|------|
| Witness generation | 1-2 sec | 50 KB |
| Proof generation | 3-5 sec | 250 bytes |
| Proof verification (off-chain) | 100-200 ms | - |
| On-chain verification | 1-2M gas | - |
| Circuit compilation | 5-10 min | - |

## Extensibility

### Adding New Tests

1. **Add test type** to circuit:
```circom
signal isNewTest <== testType === 3 ? 1 : 0;
```

2. **Define constraints**:
```circom
signal newTestEligible;
signal newTestConstraint1 <== condition1 ? 1 : 0;
signal newTestConstraint2 <== condition2 ? 1 : 0;
newTestEligible <== newTestConstraint1 * newTestConstraint2;
```

3. **Add to multiplexing**:
```circom
eligible <== (isBloo * bloodEligible) + ... + (isNewTest * newTestEligible);
```

4. **Recompile circuit** and regenerate keys

### Enhancing Privacy

**Option 1**: Add Merkle tree commitment
```circom
include "circomlib/poseidon.circom";
include "circomlib/merkleproof.circom";

signal input merkleProof[depth];
signal merkleRoot <== MerkleTreeVerifier(merkleProof);
```

**Option 2**: Batched proofs
```circom
// Multiple patients in one proof
```

## Testing

### Unit Tests
```bash
cd circuits
npm test
```

### Manual Proof Generation
```javascript
// In Node.js
const { groth16, wtns } = require('snarkjs');
const input = {...};
const witness = await wtns.calculate(input, 'eligibility.wasm');
const { proof, publicSignals } = await groth16.prove('eligibility_0001.zkey', witness);
```

### Verification Tests
```bash
npm run test:verify
```

## Debugging

### Generate Witness Debug Output
```bash
circom src/eligibility.circom --debug --r1cs --wasm -o dist
node dist/eligibility_js/generate_witness.js input.json witness.wtns
```

### Inspect R1CS
```bash
snarkjs r1cs info dist/eligibility.r1cs
```

### Check Constants
```bash
snarkjs r1cs export json dist/eligibility.r1cs dist/eligibility.json
```

---

**For more information, see:**
- [Circom Docs](https://docs.circom.io)
- [Circomlib Reference](https://github.com/iden3/circomlib)
- [Groth16 Paper](https://eprint.iacr.org/2016/260.pdf)
