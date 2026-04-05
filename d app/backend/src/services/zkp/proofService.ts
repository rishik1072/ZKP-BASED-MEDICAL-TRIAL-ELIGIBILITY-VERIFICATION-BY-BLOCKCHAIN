import * as snarkjs from "snarkjs";
import { readFileSync } from "fs";
import { poseidonHash } from "./poseidonHash";
import { logger } from "../../utils/logger";

const WASM_PATH =
  process.env.CIRCUIT_WASM_PATH ||
  "circuits/dist/eligibility_js/eligibility.wasm";
const ZKEY_PATH =
  process.env.CIRCUIT_ZKEY_PATH || "circuits/dist/eligibility_0001.zkey";

export interface CircuitInputs {
  age: number;
  testType: number; // 0: Blood, 1: MRI, 2: CT
  medicalValues: {
    hemoglobin?: number; // Blood donation
    weight?: number;
    metalImplants?: number; // MRI
    pacemaker?: number;
    pregnancy?: number; // CT/MRI
  };
  nonce: number;
}

export interface ProofOutput {
  proof: {
    pi_a: string[];
    pi_b: string[][];
    pi_c: string[];
  };
  publicSignals: string[];
  credentialHash: string;
  eligible: boolean;
}

/**
 * Generate Zero-Knowledge Proof for medical eligibility
 */
export async function generateProof(
  inputs: CircuitInputs,
): Promise<ProofOutput> {
  try {
    logger.info("Generating ZKP proof...");

    // Create circuit inputs in correct format
    const circuitInput = {
      age: inputs.age,
      testType: inputs.testType,
      hemoglobin: inputs.medicalValues.hemoglobin || 0,
      weight: inputs.medicalValues.weight || 0,
      metalImplants: inputs.medicalValues.metalImplants || 0,
      pacemaker: inputs.medicalValues.pacemaker || 0,
      pregnancy: inputs.medicalValues.pregnancy || 0,
      nonce: inputs.nonce,
    };

    logger.debug("Circuit inputs:", circuitInput);

    // Generate witness
    const witness = await snarkjs.wtns.calculate(circuitInput, WASM_PATH);

    logger.info("Witness generated");

    // Generate proof
    const { proof, publicSignals } = await snarkjs.groth16.prove(
      ZKEY_PATH,
      witness,
    );

    logger.info("Proof generated");

    // Extract eligibility status from public signals
    const eligible = parseInt(publicSignals[0]) === 1;
    const credentialHash = publicSignals[1];

    return {
      proof: {
        pi_a: [proof.pi_a[0].toString(), proof.pi_a[1].toString()],
        pi_b: [
          [proof.pi_b[0][1].toString(), proof.pi_b[0][0].toString()],
          [proof.pi_b[1][1].toString(), proof.pi_b[1][0].toString()],
        ],
        pi_c: [proof.pi_c[0].toString(), proof.pi_c[1].toString()],
      },
      publicSignals: publicSignals.map((s: any) => s.toString()),
      credentialHash,
      eligible,
    };
  } catch (error) {
    logger.error("Error generating proof:", error);
    throw new Error(`Failed to generate proof: ${(error as Error).message}`);
  }
}

/**
 * Verify Zero-Knowledge Proof locally
 */
export async function verifyProof(
  proof: any,
  publicSignals: string[],
): Promise<boolean> {
  try {
    logger.info("Verifying ZKP proof...");

    // Read verification key
    const vKeyPath =
      process.env.VERIFYING_KEY_PATH || "circuits/dist/verification_key.json";
    const vKey = JSON.parse(readFileSync(vKeyPath, "utf8"));

    // Restructure proof for verification
    const proofForVerify = {
      pi_a: [proof.pi_a[0], proof.pi_a[1], "1"],
      pi_b: [
        [proof.pi_b[0][1], proof.pi_b[0][0]],
        [proof.pi_b[1][1], proof.pi_b[1][0]],
        ["1", "0"],
      ],
      pi_c: [proof.pi_c[0], proof.pi_c[1], "1"],
    };

    const isValid = await snarkjs.groth16.verify(
      vKey,
      publicSignals,
      proofForVerify,
    );

    logger.info(`Proof verification: ${isValid ? "VALID" : "INVALID"}`);
    return isValid;
  } catch (error) {
    logger.error("Error verifying proof:", error);
    return false;
  }
}

/**
 * Create circuit input from credential and test type
 */
export function createCircuitInput(
  credential: any,
  testType: "blood" | "mri" | "ct",
  nonce: number,
): CircuitInputs {
  const testTypeMap = {
    blood: 0,
    mri: 1,
    ct: 2,
  };

  const medicalValues: any = {};

  // Parse medical values based on test type
  switch (testType) {
    case "blood":
      medicalValues.hemoglobin = credential.medicalData?.hemoglobin || 0;
      medicalValues.weight = credential.medicalData?.weight || 0;
      break;
    case "mri":
      medicalValues.metalImplants = credential.medicalData?.metalImplants
        ? 1
        : 0;
      medicalValues.pacemaker = credential.medicalData?.pacemaker ? 1 : 0;
      medicalValues.pregnancy = credential.medicalData?.pregnancy ? 1 : 0;
      break;
    case "ct":
      medicalValues.pregnancy = credential.medicalData?.pregnancy ? 1 : 0;
      medicalValues.weight = credential.medicalData?.weight || 0;
      break;
  }

  return {
    age: credential.age,
    testType: testTypeMap[testType],
    medicalValues,
    nonce,
  };
}
