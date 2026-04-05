import axios from "axios";

const API_BASE = "/api";

export const zkService = {
  generateProof: async (credential: any, testType: string, nonce?: number) => {
    const response = await axios.post(`${API_BASE}/zk/generate-proof`, {
      credential,
      testType,
      nonce,
    });
    return response.data;
  },

  verifyProof: async (
    proof: any,
    publicSignals: string[],
    isEncrypted?: boolean,
  ) => {
    const response = await axios.post(`${API_BASE}/zk/verify-proof`, {
      proof,
      publicSignals,
      isEncrypted,
    });
    return response.data;
  },

  storeOnChain: async (
    proof: any,
    publicSignals: string[],
    credentialHash: string,
    privateKey?: string,
  ) => {
    try {
      const response = await axios.post(`${API_BASE}/zk/store-on-chain`, {
        proof,
        publicSignals,
        credentialHash,
        privateKey,
      });
      return response.data;
    } catch (error: any) {
      // If backend returned an error with details, pass it through
      if (error.response?.data) {
        return error.response.data;
      }
      // Otherwise create a generic error response
      return {
        success: false,
        error: error.message || "Failed to store proof on blockchain",
      };
    }
  },

  getResult: async (credentialHash: string) => {
    const response = await axios.get(`${API_BASE}/zk/result/${credentialHash}`);
    return response.data;
  },

  checkEligibility: async (credentialHash: string) => {
    const response = await axios.get(
      `${API_BASE}/zk/eligibility/${credentialHash}`,
    );
    return response.data;
  },
};

export const blockchainService = {
  init: async () => {
    const response = await axios.post(`${API_BASE}/blockchain/init`);
    return response.data;
  },

  getConfig: async () => {
    const response = await axios.get(`${API_BASE}/blockchain/config`);
    return response.data;
  },
};
