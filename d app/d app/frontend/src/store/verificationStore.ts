import { create } from "zustand";

interface VerificationStore {
  credential: any;
  testType: string;
  proofData: any;
  privateKey: string;
  setCredential: (credential: any) => void;
  setTestType: (testType: string) => void;
  setProofData: (proofData: any) => void;
  setPrivateKey: (privateKey: string) => void;
  reset: () => void;
}

export const useVerificationStore = create<VerificationStore>((set) => ({
  credential: null,
  testType: "",
  proofData: null,
  privateKey: "",
  setCredential: (credential) => set({ credential }),
  setTestType: (testType) => set({ testType }),
  setProofData: (proofData) => set({ proofData }),
  setPrivateKey: (privateKey) => set({ privateKey }),
  reset: () =>
    set({ credential: null, testType: "", proofData: null, privateKey: "" }),
}));
