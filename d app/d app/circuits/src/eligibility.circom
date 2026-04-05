// These are the business logic constraints for medical eligibility

// Blood Donation Requirements:
// - Age > 18
// - Hemoglobin > threshold (varies by gender)
// - Weight > 50 kg
// - No infected markers (assumed valid from credential)

// MRI Scan Requirements:
// - No metal implants
// - No pacemaker  
// - Age > 5 years
// - Not pregnant (for female patients)

// CT Scan Requirements:
// - Not pregnant
// - Age > 18
// - No contrast allergy (assumed from credential)
// - Weight < 160 kg
// - No recent barium studies (assumed from credential)

pragma circom 2.0;

include "circomlib/poseidon.circom";
include "circomlib/mux1.circom";
include "circomlib/gates.circom";

/**
 * Main Eligibility Circuit
 * Inputs:
 * - age: Patient age in years
 * - testType: 0=Blood, 1=MRI, 2=CT
 * - hemoglobin: Hemoglobin level * 100 (to avoid decimals)
 * - weight: Weight in kg
 * - metalImplants: 1 if has metal implants, 0 otherwise
 * - pacemaker: 1 if has pacemaker, 0 otherwise
 * - pregnancy: 1 if pregnant, 0 otherwise
 * - nonce: Random nonce for replay protection
 *
 * Outputs:
 * - eligible: 1 if eligible, 0 otherwise
 * - credentialHash: Poseidon hash of credential data
 */
template MedicalEligibility() {
  signal input age;
  signal input testType;
  signal input hemoglobin;
  signal input weight;
  signal input metalImplants;
  signal input pacemaker;
  signal input pregnancy;
  signal input nonce;

  signal output eligible;
  signal output credentialHash;

  // Blood donation eligibility check
  signal bloodEligible;
  signal bloodAge <== age > 18 ? 1 : 0;
  signal bloodHemoglobin <== hemoglobin > 1250 ? 1 : 0;  // > 12.5 g/dL
  signal bloodWeight <== weight > 50 ? 1 : 0;
  bloodEligible <== bloodAge * bloodHemoglobin * bloodWeight;

  // MRI eligibility check
  signal mriEligible;
  signal mriAge <== age > 5 ? 1 : 0;
  signal mriNoMetals <== metalImplants === 0 ? 1 : 0;
  signal mriNoPacemaker <== pacemaker === 0 ? 1 : 0;
  signal mriNotPregnant <== pregnancy === 0 ? 1 : 0;
  mriEligible <== mriAge * mriNoMetals * mriNoPacemaker * mriNotPregnant;

  // CT scan eligibility check
  signal ctEligible;
  signal ctAge <== age > 18 ? 1 : 0;
  signal ctWeight <== weight < 160000 ? 1 : 0;  // < 160 kg
  signal ctNotPregnant <== pregnancy === 0 ? 1 : 0;
  ctEligible <== ctAge * ctWeight * ctNotPregnant;

  // Select eligibility based on test type
  signal isBloo <== testType === 0 ? 1 : 0;
  signal isMRI <== testType === 1 ? 1 : 0;
  signal isCT <== testType === 2 ? 1 : 0;

  eligible <== (isBloo * bloodEligible) + (isMRI * mriEligible) + (isCT * ctEligible);

  // Hash credential data using Poseidon
  signal hash <== Poseidon(3)([age, weight, nonce]);
  credentialHash <== hash;
}

component main { public [testType, nonce] } = MedicalEligibility();
