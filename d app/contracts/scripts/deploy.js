/**
 * Deployment script for VerifyEligibility contract
 */

const hre = require("hardhat");

async function main() {
  console.log("🚀 Deploying VerifyEligibility contract...");

  // Get accounts
  const [deployer] = await ethers.getSigners();
  console.log(`📝 Deploying with account: ${deployer.address}`);

  // For production, you would deploy the actual Groth16 verifier generated from circuits
  // For now, we'll use a mock address
  const verifierAddress = process.env.VERIFIER_CONTRACT || deployer.address;

  // Deploy contract
  const VerifyEligibility = await ethers.getContractFactory("VerifyEligibility");
  const contract = await VerifyEligibility.deploy(verifierAddress);
  await contract.waitForDeployment();

  const contractAddress = await contract.getAddress();

  console.log(`\n✅ VerifyEligibility deployed to: ${contractAddress}`);
  console.log(`\n📋 Deployment Details:
  • Network: ${hre.network.name}
  • Deployer: ${deployer.address}
  • Verifier: ${verifierAddress}

  Next steps:
  1. Update .env with SMART_CONTRACT_ADDRESS=${contractAddress}
  2. Whitelist the contract if needed
  3. Test with sample proofs\n`);

  // Save deployment info
  const deploymentInfo = {
    network: hre.network.name,
    contractAddress,
    verifierAddress,
    deployerAddress: deployer.address,
    deploymentBlock: await ethers.provider.getBlockNumber(),
    deploymentTimestamp: new Date().toISOString(),
  };

  const fs = require("fs");
  const path = require("path");
  const deploymentPath = path.join(__dirname, "../deployments.json");

  let deployments = {};
  if (fs.existsSync(deploymentPath)) {
    deployments = JSON.parse(fs.readFileSync(deploymentPath, "utf8"));
  }

  deployments[hre.network.name] = deploymentInfo;
  fs.writeFileSync(deploymentPath, JSON.stringify(deployments, null, 2));

  console.log("💾 Deployment info saved to deployments.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
