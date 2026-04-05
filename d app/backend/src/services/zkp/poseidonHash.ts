/**
 * Poseidon hash implementation using snarkjs
 * This is used inside the Circom circuits for hashing
 */

import { poseidon } from 'snarkjs';

export function poseidonHash(inputs: any[]): string {
  try {
    // Convert inputs to proper format
    const hashInputs = inputs.map(input => {
      if (typeof input === 'number') return BigInt(input);
      if (typeof input === 'string') return BigInt(input);
      return BigInt(0);
    });

    const hash = poseidon(hashInputs);
    return hash.toString();
  } catch (error) {
    console.error('Poseidon hash error:', error);
    throw new Error('Failed to compute Poseidon hash');
  }
}

/**
 * Hash credential data for commitment
 */
export function hashCredential(credentialData: any): string {
  const inputs = [
    credentialData.patientId || 0,
    credentialData.age || 0,
    credentialData.gender === 'M' ? 1 : 0,
    credentialData.issueTimestamp || 0,
  ];

  return poseidonHash(inputs);
}

/**
 * Create Merkle tree hash for credential inclusion proof
 */
export function merkleTreeHash(left: string, right: string): string {
  const inputs = [BigInt(left), BigInt(right)];
  const hash = poseidon(inputs);
  return hash.toString();
}
