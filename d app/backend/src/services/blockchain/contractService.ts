import { ethers } from "ethers";
import { logger } from "../../utils/logger";

const VERIFIER_ABI = [
  "function storeResult(bytes32 _credentialHash, bool _eligible) external",
  "function getResult(bytes32 _credentialHash) external view returns (tuple(bool eligible, uint256 timestamp, address verifier))",
  "function isEligible(bytes32 _credentialHash) external view returns (bool)",
];

let provider: ethers.JsonRpcProvider;
let contract: ethers.Contract;
let signer: ethers.Wallet;

export function initializeBlockchainService(): void {
  try {
    const rpcUrl = process.env.POLYGON_RPC_URL || "https://polygon-rpc.com";
    const privateKey = process.env.PRIVATE_KEY_BLOCKCHAIN || "";
    const contractAddress = process.env.SMART_CONTRACT_ADDRESS || "";

    if (!privateKey || !contractAddress) {
      logger.warn(
        "Blockchain credentials not configured. Blockchain features will be limited.",
      );
      return;
    }

    provider = new ethers.JsonRpcProvider(rpcUrl);
    signer = new ethers.Wallet(privateKey, provider);
    contract = new ethers.Contract(contractAddress, VERIFIER_ABI, signer);

    logger.info("✅ Blockchain service initialized");
    logger.debug(`Contract: ${contractAddress}`);
    logger.debug(`Network: ${process.env.CHAIN_ID}`);
  } catch (error) {
    logger.error("Failed to initialize blockchain service:", error);
  }
}

export interface VerificationResult {
  eligible: boolean;
  timestamp: number;
  txHash: string;
}

/**
 * Send proof to smart contract for verification and storage
 * Optionally accepts user's private key for signing transactions
 */
export async function verifyAndStoreProof(
  proofData: any,
  credentialHash: string,
  userPrivateKey?: string,
): Promise<any> {
  try {
    let contractToUse = contract;

    // If user provided private key, create a new signer/contract with their key
    if (userPrivateKey && provider) {
      logger.info("🔑 Using user-provided private key for transaction signing");
      const userSigner = new ethers.Wallet(userPrivateKey, provider);
      contractToUse = new ethers.Contract(
        process.env.SMART_CONTRACT_ADDRESS || "",
        VERIFIER_ABI,
        userSigner,
      );
    }

    if (!contractToUse) {
      throw new Error(
        "Blockchain service not initialized and no private key provided",
      );
    }

    logger.info(`📝 Storing proof on-chain for credential: ${credentialHash}`);

    // Determine eligibility from public signals
    const eligible =
      proofData.publicSignals && proofData.publicSignals[0] === "1";

    // Convert credential hash to bytes32
    const credentialHashBytes32 = "0x" + credentialHash.substring(0, 64);

    logger.info(`📋 Eligible: ${eligible}, Hash: ${credentialHashBytes32}`);

    // Send transaction to contract
    logger.info("🔗 Submitting transaction to Polygon Mainnet...");
    const tx = await contractToUse.storeResult(credentialHashBytes32, eligible);

    logger.info(`⏳ Waiting for confirmation... TX: ${tx.hash}`);
    const receipt = await tx.wait();

    logger.info(`✅ Proof stored on-chain successfully!`);
    logger.info(`   Transaction Hash: ${receipt.hash}`);
    logger.info(`   Block Number: ${receipt.blockNumber}`);
    logger.info(`   Gas Used: ${receipt.gasUsed.toString()}`);

    return {
      success: true,
      transactionHash: receipt.hash,
      blockNumber: receipt.blockNumber,
      gasUsed: receipt.gasUsed.toString(),
    };
  } catch (error) {
    logger.error("Error storing proof on-chain:", error);
    throw new Error(
      `Failed to store proof on-chain: ${(error as Error).message}`,
    );
  }
}

/**
 * Retrieve verification result from smart contract
 */
export async function getVerificationResult(
  credentialHash: string,
): Promise<VerificationResult | null> {
  try {
    if (!contract) {
      throw new Error("Blockchain service not initialized");
    }

    const result = await contract.getResult(credentialHash);
    return {
      eligible: result.eligible,
      timestamp: parseInt(result.timestamp.toString()),
      txHash: result.txHash,
    };
  } catch (error) {
    logger.error("Error retrieving verification result:", error);
    return null;
  }
}

/**
 * Check eligibility status on-chain
 */
export async function checkEligibilityOnChain(
  credentialHash: string,
): Promise<boolean> {
  try {
    if (!contract) {
      throw new Error("Blockchain service not initialized");
    }

    const eligible = await contract.isEligible(credentialHash);
    return eligible;
  } catch (error) {
    logger.error("Error checking eligibility on-chain:", error);
    return false;
  }
}

export { provider, contract, signer };
