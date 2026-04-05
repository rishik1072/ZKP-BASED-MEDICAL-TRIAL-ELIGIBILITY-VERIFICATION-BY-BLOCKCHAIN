/**
 * Setup script for Circom circuits
 * Compiles circuit and generates Groth16 proving system files
 */

const snarkjs = require("snarkjs");
const fs = require("fs");
const path = require("path");

async function setup() {
  try {
    console.log("🔧 Setting up Circom circuits...");

    const distDir = path.join(__dirname, "../dist");
    if (!fs.existsSync(distDir)) {
      fs.mkdirSync(distDir, { recursive: true });
    }

    // Path to compiled R1CS file
    const r1csPath = path.join(distDir, "eligibility.r1cs");

    if (!fs.existsSync(r1csPath)) {
      console.log("⚠️  R1CS file not found. Please compile circuit first:");
      console.log("   npm run compile");
      return;
    }

    console.log("📝 Generating Groth16 setup...");

    // Generate random beacon for trusted setup
    const beacon = Buffer.from("0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e1f", "hex");

    // Generate proving key
    const { fd: fdPtau, path: ptauPath } = await snarkjs.powersOfTau.newAccumulator(
      snarkjs,
      12,
      path.join(distDir, "pot12_0000.ptau")
    );

    await snarkjs.powersOfTau.import(snarkjs, ptauPath, 0);
    await snarkjs.powersOfTau.computeNext(snarkjs, ptauPath, Utils, 1);

    // Create Zkey
    await snarkjs.zKey.new(
      r1csPath,
      ptauPath,
      path.join(distDir, "eligibility_0001.zkey")
    );

    // Contribute to ceremony (proving key)
    const contribution = "Medical ZKP Circuit Setup";
    await snarkjs.zKey.contribute(
      path.join(distDir, "eligibility_0001.zkey"),
      path.join(distDir, "eligibility_0002.zkey"),
      contribution,
      Buffer.from("0102030405060708090a0b0c0d0e0f101112131415161718191a1b1c1d1e", "hex")
    );

    // Verify setup
    await snarkjs.zKey.verify(
      r1csPath,
      ptauPath,
      path.join(distDir, "eligibility_0002.zkey")
    );

    // Rename to final zkey
    fs.renameSync(
      path.join(distDir, "eligibility_0002.zkey"),
      path.join(distDir, "eligibility_0001.zkey")
    );

    // Export verification key
    const zkeyBuffer = fs.readFileSync(path.join(distDir, "eligibility_0001.zkey"));
    const vkey = await snarkjs.zKey.exportVerificationKey(zkeyBuffer);

    fs.writeFileSync(
      path.join(distDir, "verification_key.json"),
      JSON.stringify(vkey, null, 2)
    );

    // Generate Solidity verifier
    const solPath = path.join(distDir, "VerifyEligibility.sol");
    const solCode = await snarkjs.zKey.exportSolidityVerifier(zkeyBuffer);
    fs.writeFileSync(solPath, solCode);

    console.log("✅ Circuit setup complete!");
    console.log(`\n📁 Output files:
  ✓ eligibility.wasm (WASM for proof generation)
  ✓ eligibility_0001.zkey (Proving key)
  ✓ verification_key.json (Verification key)
  ✓ VerifyEligibility.sol (Solidity verifier)\n`);

  } catch (error) {
    console.error("❌ Setup failed:", error);
    process.exit(1);
  }
}

// Utility class (placeholder for actual implementation)
const Utils = {
  // Implementation depends on snarkjs version
};

setup();
