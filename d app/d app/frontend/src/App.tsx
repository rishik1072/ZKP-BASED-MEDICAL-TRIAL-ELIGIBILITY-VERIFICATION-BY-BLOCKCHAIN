import { useState } from "react";
import { motion } from "framer-motion";
import { useVerificationStore } from "./store/verificationStore";
import { Stepper } from "./components";
import FileUploadPage from "./pages/FileUploadPage";
import TestSelectionPage from "./pages/TestSelectionPage";
import ProofGenerationPage from "./pages/ProofGenerationPage";
import ResultPage from "./pages/ResultPage";

type Step = "upload" | "testSelect" | "generation" | "result";

export default function App() {
  const [step, setStep] = useState<Step>("upload");
  const [credential, setCredential] = useState<any>(null);
  const [testType, setTestType] = useState<string>("");
  const [proofResult, setProofResult] = useState<any>(null);
  const { setPrivateKey } = useVerificationStore();

  const handleUploadComplete = (cred: any, privateKey?: string) => {
    setCredential(cred);
    if (privateKey) {
      setPrivateKey(privateKey);
    }
    // Always show test selection
    setStep("testSelect");
  };

  const handleTestSelected = (test: string) => {
    setTestType(test);
    setStep("generation");
  };

  const handleProofGenerated = (proof: any) => {
    setProofResult(proof);
    setStep("result");
  };

  const handleReset = () => {
    setCredential(null);
    setTestType("");
    setProofResult(null);
    setStep("upload");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-600 via-purple-600 to-pink-500 py-8 px-4 relative overflow-hidden">
      {/* Background Video */}
      <video
        className="fixed inset-0 w-full h-full object-cover -z-10 opacity-30"
        autoPlay
        loop
        muted
        playsInline
      >
        <source src="/bg-video.mp4" type="video/mp4" />
      </video>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="max-w-4xl mx-auto"
      >
        {/* Header */}
        <motion.div
          className="text-center mb-12"
          initial={{ y: -20 }}
          animate={{ y: 0 }}
        >
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-2">
            🏥 Medical Eligibility Verification
          </h1>
          <p className="text-white/80 text-lg">
            Zero-Knowledge Proof Based Blockchain Technology
          </p>
        </motion.div>

        {/* Stepper */}
        <Stepper
          steps={[
            { id: "upload", label: "Upload", icon: "📤" },
            { id: "testSelect", label: "Select", icon: "🩺" },
            { id: "generation", label: "Generate", icon: "⚙️" },
            { id: "result", label: "Result", icon: "✅" },
          ]}
          currentStep={step}
        />

        {/* Content */}
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
        >
          {step === "upload" && (
            <FileUploadPage onUploadComplete={handleUploadComplete} />
          )}
          {step === "testSelect" && (
            <TestSelectionPage onTestSelected={handleTestSelected} />
          )}
          {step === "generation" && (
            <ProofGenerationPage
              credential={credential}
              testType={testType}
              onProofGenerated={handleProofGenerated}
            />
          )}
          {step === "result" && (
            <ResultPage proofResult={proofResult} onReset={handleReset} />
          )}
        </motion.div>
      </motion.div>
    </div>
  );
}
