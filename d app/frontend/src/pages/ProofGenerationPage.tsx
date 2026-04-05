import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Loading, ProgressBar, Alert } from "../components";
import { zkService } from "../services/api";
import { useVerificationStore } from "../store/verificationStore";

interface ProofGenerationPageProps {
  credential: any;
  testType: string;
  onProofGenerated: (proof: any) => void;
}

type Stage =
  | "idle"
  | "generating"
  | "verifying"
  | "storing"
  | "completed"
  | "error";

export default function ProofGenerationPage({
  credential,
  testType,
  onProofGenerated,
}: ProofGenerationPageProps) {
  const [stage, setStage] = useState<Stage>("idle");
  const [error, setError] = useState("");
  const [proof, setProof] = useState<any>(null);
  const [progress, setProgress] = useState(0);
  const { privateKey } = useVerificationStore();

  useEffect(() => {
    startProofGeneration();
  }, []);

  const startProofGeneration = async () => {
    setStage("generating");
    setProgress(0);
    setError("");

    try {
      // Simulate progress
      const progressInterval = setInterval(() => {
        setProgress((p) => Math.min(p + Math.random() * 30, 90));
      }, 500);

      // Step 1: Generate Proof
      const generatedProof = await zkService.generateProof(
        credential,
        testType,
      );
      setProgress(50);

      // Check if it's an encrypted credential
      const isEncrypted = credential.credentialId && credential.encryptedData;

      // Step 2: Verify locally
      setStage("verifying");
      const verification = await zkService.verifyProof(
        generatedProof.data.proof,
        generatedProof.data.publicSignals,
        isEncrypted,
      );
      setProgress(70);

      if (!verification.data.isValid) {
        throw new Error("Proof verification failed");
      }

      // Step 3: Store on blockchain
      setStage("storing");
      const blockchainResponse = await zkService.storeOnChain(
        generatedProof.data.proof,
        generatedProof.data.publicSignals,
        generatedProof.data.credentialHash,
        privateKey,
      );
      setProgress(100);

      clearInterval(progressInterval);

      // Complete - check if blockchain response has an error
      const proofData = {
        ...generatedProof.data,
        blockchainResult: blockchainResponse.data,
        blockchainError: blockchainResponse.error || null,
        blockchainError_details: blockchainResponse.details || null,
      };

      setProof(proofData);
      setStage("completed");

      setTimeout(() => {
        onProofGenerated(proofData);
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error occurred");
      setStage("error");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-2xl mx-auto"
    >
      <div className="glassmorphism rounded-2xl p-8 md:p-12">
        <h2 className="text-2xl font-bold text-white mb-2">
          Generating ZKP Proof
        </h2>
        <p className="text-white/70 mb-8">
          Privacy-preserving proof generation in progress...
        </p>

        {/* Progress Bar */}
        <div className="mb-8">
          <ProgressBar
            value={progress}
            max={100}
            showLabel={true}
            animated={true}
          />
        </div>

        {/* Stages */}
        <div className="space-y-4 mb-8">
          <StageItem
            icon="⚙️"
            label="Generating ZKP Witness"
            status={
              stage === "generating"
                ? "in-progress"
                : stage !== "idle"
                  ? "complete"
                  : "pending"
            }
          />
          <StageItem
            icon="🔍"
            label="Verifying Proof Locally"
            status={
              stage === "verifying"
                ? "in-progress"
                : stage === "storing" || stage === "completed"
                  ? "complete"
                  : "pending"
            }
          />
          <StageItem
            icon="🔗"
            label="Storing on Blockchain"
            status={
              stage === "storing"
                ? "in-progress"
                : stage === "completed"
                  ? "complete"
                  : "pending"
            }
          />
        </div>

        {/* Error Message */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        {/* Success Message */}
        {stage === "completed" && (
          <Alert
            type="success"
            message={`Proof Generated Successfully! Your eligibility status: ${proof?.eligible ? "ELIGIBLE" : "NOT ELIGIBLE"}`}
          />
        )}

        {/* Retry Button */}
        {stage === "error" && (
          <button
            onClick={startProofGeneration}
            className="w-full bg-primary-500 hover:bg-primary-600 text-white font-semibold py-3 rounded-lg smooth-transition"
          >
            Retry
          </button>
        )}
      </div>
    </motion.div>
  );
}

function StageItem({
  icon,
  label,
  status,
}: {
  icon: string;
  label: string;
  status: "pending" | "in-progress" | "complete";
}) {
  const colors = {
    pending: "bg-white/10 text-white/50",
    "in-progress": "bg-blue-500/20 text-blue-200",
    complete: "bg-green-500/20 text-green-200",
  };

  return (
    <div
      className={`${colors[status]} rounded-lg p-4 flex items-center gap-4 smooth-transition`}
    >
      <div className="text-2xl">{icon}</div>
      <div className="flex-1">{label}</div>
      <div className="text-sm">
        {status === "in-progress" && (
          <motion.span
            animate={{ opacity: [1, 0.5, 1] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            Processing...
          </motion.span>
        )}
        {status === "complete" && <span>✓</span>}
        {status === "pending" && <span>○</span>}
      </div>
    </div>
  );
}
