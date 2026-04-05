/**
 * Medical Credential Types
 */

export interface MedicalData {
  hemoglobin?: number;
  weight?: number;
  bloodType?: string;
  metalImplants?: boolean;
  pacemaker?: boolean;
  pregnancy?: boolean;
  lastCheckup?: string;
}

export interface EncryptedData {
  method: "aes-256-gcm";
  iv: string; // Base64 encoded
  tag: string; // Base64 encoded
  ciphertext: string; // Base64 encoded
}

export interface MedicalCredential {
  patientId: string;
  age: number;
  gender: "M" | "F" | "Other";
  issuedAt: string; // ISO 8601 timestamp
  issuerDID: string; // Decentralized Identifier
  medicalData: MedicalData;
  encrypted: EncryptedData;
  rsaSignature: string; // Base64 encoded RSA signature
  nonce: number; // Random number for proof generation
}

/**
 * Verify credential has all required fields
 */
export function isValidCredential(
  credential: any,
): credential is MedicalCredential {
  const required = [
    "patientId",
    "age",
    "gender",
    "issuedAt",
    "issuerDID",
    "medicalData",
    "encrypted",
    "rsaSignature",
    "nonce",
  ];

  return required.every((field) => field in credential);
}
