// Example: Generate and verify proof programmatically

const snarkjs = require('snarkjs');
const axios = require('axios');
const fs = require('fs');

/**
 * Example: Complete ZKP Flow
 */

async function exampleCompleteFlow() {
  console.log('🚀 Medical ZKP Example: Complete Flow\n');

  const API_URL = 'http://localhost:5000/api';

  // Step 1: Create sample credential
  console.log('Step 1: Creating sample credential...');
  const credential = {
    patientId: 'P123456789',
    age: 35,
    gender: 'M',
    medicalData: {
      hemoglobin: 14.5, // g/dL (eligible)
      weight: 75,       // kg (eligible)
      metalImplants: false,
      pacemaker: false,
      pregnancy: false,
    },
  };

  console.log('✓ Credential created');
  console.log(`  Patient: ${credential.patientId}`);
  console.log(`  Age: ${credential.age}`);
  console.log(`  Test: Blood Donation\n`);

  // Step 2: Generate proof
  console.log('Step 2: Generating ZKP proof (this may take 3-5 seconds)...');
  try {
    const proofResponse = await axios.post(`${API_URL}/zk/generate-proof`, {
      credential,
      testType: 'blood',
    });

    const proofData = proofResponse.data.data;

    console.log('✓ Proof generated successfully');
    console.log(`  Eligible: ${proofData.eligible ? 'YES ✓' : 'NO ✗'}`);
    console.log(`  Proof size: ${JSON.stringify(proofData.proof).length} bytes`);
    console.log(`  Credential hash: ${proofData.credentialHash.substring(0, 20)}...\n`);

    // Step 3: Verify proof locally
    console.log('Step 3: Verifying proof locally...');
    const verifyResponse = await axios.post(`${API_URL}/zk/verify-proof`, {
      proof: proofData.proof,
      publicSignals: proofData.publicSignals,
    });

    const verifyData = verifyResponse.data.data;

    console.log('✓ Proof verification complete');
    console.log(`  Valid: ${verifyData.isValid ? 'YES ✓' : 'NO ✗'}\n`);

    // Step 4: Store on blockchain (requires contract deployment)
    console.log('Step 4: Storing proof on blockchain...');
    console.log('📝 Note: Requires smart contract deployment first\n');

    // Step 5: Retrieve result (example)
    console.log('Step 5: Retrieving stored result...');
    console.log(
      `Would query: ${API_URL}/zk/result/${proofData.credentialHash}\n`
    );

    // Step 6: Results summary
    console.log('═══════════════════════════════════════════════════════');
    console.log('📊 VERIFICATION RESULTS');
    console.log('═══════════════════════════════════════════════════════');
    console.log(`✓ ZKP Generated: ${proofData.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`);
    console.log(`✓ Proof Verified: ${verifyData.isValid ? 'VALID' : 'INVALID'}`);
    console.log(`✓ Privacy: MAINTAINED (no raw data exposed)`);
    console.log('═══════════════════════════════════════════════════════\n');
  } catch (error) {
    console.error('❌ Error:', error.response?.data || error.message);
  }
}

/**
 * Example: Test different eligibility scenarios
 */

async function exampleTestScenarios() {
  console.log('🧪 Testing Different Eligibility Scenarios\n');

  const testCases = [
    {
      name: 'Eligible Blood Donor',
      credential: {
        patientId: 'P001',
        age: 35,
        medicalData: { hemoglobin: 14.5, weight: 75 },
      },
      testType: 'blood',
      expectedEligible: true,
    },
    {
      name: 'Too Young for Blood Donation',
      credential: {
        patientId: 'P002',
        age: 16,
        medicalData: { hemoglobin: 14.5, weight: 75 },
      },
      testType: 'blood',
      expectedEligible: false,
    },
    {
      name: 'Low Hemoglobin',
      credential: {
        patientId: 'P003',
        age: 35,
        medicalData: { hemoglobin: 10.0, weight: 75 },
      },
      testType: 'blood',
      expectedEligible: false,
    },
    {
      name: 'Eligible for MRI',
      credential: {
        patientId: 'P004',
        age: 30,
        medicalData: {
          metalImplants: false,
          pacemaker: false,
          pregnancy: false,
        },
      },
      testType: 'mri',
      expectedEligible: true,
    },
    {
      name: 'Ineligible - Has Pacemaker',
      credential: {
        patientId: 'P005',
        age: 30,
        medicalData: {
          metalImplants: false,
          pacemaker: true,
          pregnancy: false,
        },
      },
      testType: 'mri',
      expectedEligible: false,
    },
  ];

  const API_URL = 'http://localhost:5000/api';

  for (const testCase of testCases) {
    try {
      const response = await axios.post(`${API_URL}/zk/generate-proof`, {
        credential: testCase.credential,
        testType: testCase.testType,
      });

      const eligible = response.data.data.eligible;
      const pass = eligible === testCase.expectedEligible;

      console.log(`${pass ? '✓' : '✗'} ${testCase.name}`);
      console.log(`  Expected: ${testCase.expectedEligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`);
      console.log(`  Got:      ${eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}\n`);
    } catch (error) {
      console.error(`✗ ${testCase.name}`);
      console.error(`  Error: ${error.message}\n`);
    }
  }
}

/**
 * Example: Batch proof generation
 */

async function exampleBatchGeneration() {
  console.log('⚙️ Batch Proof Generation Example\n');

  const API_URL = 'http://localhost:5000/api';
  const batchSize = 5;
  let successCount = 0;
  let failureCount = 0;

  for (let i = 0; i < batchSize; i++) {
    try {
      const credential = {
        patientId: `BATCH_P${String(i).padStart(6, '0')}`,
        age: 20 + Math.random() * 50,
        medicalData: {
          hemoglobin: 10 + Math.random() * 5,
          weight: 50 + Math.random() * 30,
        },
      };

      const response = await axios.post(`${API_URL}/zk/generate-proof`, {
        credential,
        testType: 'blood',
      });

      successCount++;
      console.log(`✓ Proof ${i + 1}/${batchSize}: ${response.data.data.eligible ? 'ELIGIBLE' : 'NOT ELIGIBLE'}`);
    } catch (error) {
      failureCount++;
      console.log(`✗ Proof ${i + 1}/${batchSize}: Failed`);
    }
  }

  console.log(`\n📊 Batch Results: ${successCount}/${batchSize} successful\n`);
}

/**
 * Main execution
 */

async function main() {
  console.log('╔════════════════════════════════════════════════════════╗');
  console.log('║   Medical ZKP Blockchain - Examples                   ║');
  console.log('╚════════════════════════════════════════════════════════╝\n');

  // Check if server is running
  try {
    await axios.get('http://localhost:5000/health');
  } catch (error) {
    console.error('❌ Backend server not running!');
    console.error('Please start backend first: cd backend && npm run dev\n');
    process.exit(1);
  }

  // Run examples
  await exampleCompleteFlow();
  console.log('\n---\n');
  await exampleTestScenarios();
  console.log('\n---\n');
  await exampleBatchGeneration();

  console.log('✅ Examples completed!\n');
}

main().catch(console.error);
