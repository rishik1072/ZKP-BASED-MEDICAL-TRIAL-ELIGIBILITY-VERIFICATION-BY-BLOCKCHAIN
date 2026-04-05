import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import { useVerificationStore } from "../store/verificationStore";

interface ResultPageProps {
  proofResult: any;
  onReset: () => void;
}

export default function ResultPage({ proofResult, onReset }: ResultPageProps) {
  const [showPrivateKey, setShowPrivateKey] = useState(false);
  const { privateKey } = useVerificationStore();

  const eligible = proofResult?.eligible;
  const txHash = proofResult?.blockchainResult?.transactionHash;
  const blockNumber = proofResult?.blockchainResult?.blockNumber;
  const gasUsed = proofResult?.blockchainResult?.gasUsed || "N/A";
  const blockchainError = proofResult?.blockchainError;
  const isRealBlockchain =
    !!privateKey && !!txHash && txHash.startsWith("0x") && !blockchainError;

  const downloadCertificate = () => {
    const certificateData = {
      status: eligible ? "ELIGIBLE" : "NOT ELIGIBLE",
      timestamp: new Date().toISOString(),
      transactionHash: txHash || "N/A",
      blockNumber: blockNumber || "N/A",
      gasUsed: gasUsed || "N/A",
      credentialHash: proofResult?.credentialHash,
      method: "Zero-Knowledge Proof (Groth16)",
      blockchain: isRealBlockchain
        ? "Polygon Mainnet (REAL)"
        : "Polygon Mumbai Testnet (Mock)",
      signedBy: privateKey
        ? `${privateKey.substring(0, 10)}...${privateKey.substring(privateKey.length - 8)}`
        : "Backend",
    };

    const certificateText = `
MEDICAL ELIGIBILITY VERIFICATION CERTIFICATE
=============================================

Status: ${certificateData.status}

Verification Details:
- Timestamp: ${certificateData.timestamp}
- Method: ${certificateData.method}
- Blockchain Network: ${certificateData.blockchain}
- Signed By: ${certificateData.signedBy}
- Transaction Mode: ${isRealBlockchain ? "REAL BLOCKCHAIN" : "MOCK MODE"}
- Credential Hash: ${certificateData.credentialHash}
- Transaction Hash: ${certificateData.transactionHash}
- Block Number: ${certificateData.blockNumber}
- Gas Used: ${certificateData.gasUsed || "N/A"}

Verification Chain:
${
  certificateData.transactionHash !== "N/A"
    ? `1. Private key holder signed the transaction
2. Transaction submitted to ${certificateData.blockchain}
3. Zero-Knowledge Proof verified on-chain
4. Eligibility status recorded immutably`
    : "Mock verification - not recorded on real blockchain"
}

Privacy Notice:
Your medical data was never exposed. This certificate is based on
zero-knowledge proofs, ensuring complete privacy while verifying eligibility.
All computation is done client-side with zero exposure of underlying medical data.

Generated: ${new Date().toLocaleString()}
    `.trim();

    const element = document.createElement("a");
    element.setAttribute(
      "href",
      "data:text/plain;charset=utf-8," + encodeURIComponent(certificateText),
    );
    element.setAttribute(
      "download",
      `eligibility-certificate-${Date.now()}.txt`,
    );
    element.style.display = "none";
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="max-w-2xl mx-auto"
    >
      {/* Result Card */}
      <motion.div
        className={`glassmorphism rounded-2xl p-12 text-center mb-8 ${
          eligible
            ? "border-2 border-green-500/50 bg-gradient-to-b from-green-500/10 to-transparent"
            : "border-2 border-red-500/50 bg-gradient-to-b from-red-500/10 to-transparent"
        }`}
      >
        <motion.div
          animate={{ scale: [1, 1.1, 1] }}
          transition={{ duration: 0.6, repeat: 2 }}
          className="text-7xl mb-6"
        >
          {eligible ? "✅" : "❌"}
        </motion.div>

        <h1
          className={`text-4xl font-bold mb-2 ${
            eligible ? "text-green-300" : "text-red-300"
          }`}
        >
          {eligible ? "ELIGIBLE" : "NOT ELIGIBLE"}
        </h1>

        <p
          className={`text-lg mb-6 ${
            eligible ? "text-green-200/80" : "text-red-200/80"
          }`}
        >
          {eligible
            ? "You are eligible for the selected medical test."
            : "Unfortunately, you do not meet the eligibility criteria."}
        </p>

        {/* Privacy Notice */}
        <div className="bg-white/10 rounded-lg p-4 mb-6 text-left">
          <p className="text-white/80 text-sm">
            <span className="font-semibold">🔐 Privacy:</span> Your medical data
            was never exposed. This result is based on zero-knowledge proofs,
            ensuring complete privacy while verifying eligibility.
          </p>
        </div>
      </motion.div>

      {/* Blockchain Error Alert */}
      {blockchainError && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="glassmorphism rounded-2xl p-6 mb-8 border-2 border-red-500/50 bg-gradient-to-b from-red-500/10 to-transparent"
        >
          <div className="flex items-start gap-4">
            <div className="text-3xl">❌</div>
            <div className="flex-1">
              <h3 className="text-red-200 font-bold mb-2">
                Blockchain Transaction Failed
              </h3>
              <p className="text-red-200/80 text-sm mb-4">{blockchainError}</p>

              {proofResult?.blockchainError_details?.tips && (
                <div className="bg-white/5 rounded-lg p-3 mb-4">
                  <p className="text-white/70 text-xs font-semibold mb-2">
                    🔧 Troubleshooting Tips:
                  </p>
                  <ul className="space-y-1">
                    {proofResult.blockchainError_details.tips.map(
                      (tip: string, i: number) => (
                        <li key={i} className="text-white/60 text-xs font-mono">
                          {tip}
                        </li>
                      ),
                    )}
                  </ul>
                </div>
              )}

              <div className="bg-blue-500/10 border border-blue-500/30 rounded-lg p-3">
                <p className="text-blue-200 text-xs">
                  <span className="font-semibold">💡 Next Steps:</span>
                  <br />
                  1. Check that SMART_CONTRACT_ADDRESS is deployed on Polygon
                  Mainnet
                  <br />
                  2. Verify you have enough MATIC in your wallet for gas fees
                  <br />
                  3. Restart backend after updating .env
                  <br />
                  4. Try again with the same private key
                </p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Blockchain Details */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className={`glassmorphism rounded-2xl p-6 mb-8 border-2 ${
          isRealBlockchain
            ? "border-green-500/50 bg-gradient-to-b from-green-500/10 to-transparent"
            : "border-yellow-500/50 bg-gradient-to-b from-yellow-500/10 to-transparent"
        }`}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-white font-bold">
            🔗 Blockchain Verification{" "}
            {isRealBlockchain ? "✅ REAL" : "🎭 MOCK"}
          </h2>
          <span
            className={`px-3 py-1 rounded-full text-sm font-semibold ${
              isRealBlockchain
                ? "bg-green-500/30 text-green-200"
                : "bg-yellow-500/30 text-yellow-200"
            }`}
          >
            {isRealBlockchain ? "🚀 REAL BLOCKCHAIN" : "⚠️ Mock Mode"}
          </span>
        </div>

        <div className="space-y-3 mb-6">
          {/* Private Key Used */}
          {privateKey && (
            <div className="bg-white/5 rounded-lg p-3 mb-4 border border-indigo-500/30">
              <div className="flex justify-between items-center">
                <span className="text-white/70 font-semibold">
                  Your Private Key:
                </span>
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  onClick={() => setShowPrivateKey(!showPrivateKey)}
                  className="px-3 py-1 bg-indigo-500/20 hover:bg-indigo-500/40 text-indigo-200 rounded text-xs font-mono"
                >
                  {showPrivateKey ? "🙈 Hide" : "👁️ Show"}
                </motion.button>
              </div>
              <AnimatePresence>
                {showPrivateKey ? (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 bg-black/30 p-2 rounded text-mono break-all text-yellow-300 text-sm font-mono"
                  >
                    {privateKey}
                  </motion.div>
                ) : (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-2 text-green-300 text-sm font-mono"
                  >
                    ✓ Key Registered & Active
                    <br />
                    <span className="text-white/70 text-xs">
                      Signed by: {privateKey.substring(0, 10)}...
                      {privateKey.substring(privateKey.length - 8)}
                    </span>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          )}

          <div className="flex justify-between items-start">
            <span className="text-white/70">Transaction Hash:</span>
            <a
              href={`https://polygonscan.com/tx/${txHash}`}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-300 hover:text-green-200 font-mono text-sm break-all underline"
            >
              {txHash
                ? `${txHash.substring(0, 15)}...${txHash.substring(txHash.length - 10)}`
                : "N/A"}
            </a>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/70">Network:</span>
            <span className="text-white text-sm font-semibold">
              {isRealBlockchain
                ? "🟣 Polygon Mainnet"
                : "🟡 Polygon Mumbai (Mock)"}
            </span>
          </div>

          <div className="flex justify-between items-center">
            <span className="text-white/70">Status:</span>
            <span
              className={`px-3 py-1 rounded-full text-sm font-semibold ${
                isRealBlockchain
                  ? "bg-green-500/30 text-green-200"
                  : "bg-yellow-500/30 text-yellow-200"
              }`}
            >
              {isRealBlockchain ? "✓ Real Transaction" : "⚠️ Mock Transaction"}
            </span>
          </div>

          {blockNumber && (
            <div className="flex justify-between items-center">
              <span className="text-white/70">Block Number:</span>
              <span className="text-white text-sm font-mono">
                {blockNumber}
              </span>
            </div>
          )}

          {gasUsed && gasUsed !== "N/A" && (
            <div className="flex justify-between items-center">
              <span className="text-white/70">Gas Used:</span>
              <span className="text-white text-sm font-mono">{gasUsed}</span>
            </div>
          )}

          <div className="flex justify-between items-center">
            <span className="text-white/70">Proof Method:</span>
            <span className="text-white text-sm">
              Zero-Knowledge Proof (Groth16)
            </span>
          </div>
        </div>

        {txHash && (
          <a
            href={`https://polygonscan.com/tx/${txHash}`}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 block text-center py-2 text-green-300 hover:text-green-200 underline text-sm font-semibold"
          >
            🔍 View Real Transaction on Polygonscan →
          </a>
        )}
      </motion.div>

      {/* Actions */}
      <div className="flex gap-4">
        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={onReset}
          className="flex-1 bg-primary-500 hover:bg-primary-600 text-white font-bold py-3 rounded-lg smooth-transition"
        >
          ↻ Start New Verification
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={downloadCertificate}
          className="flex-1 bg-white/10 hover:bg-white/20 text-white font-bold py-3 rounded-lg smooth-transition"
        >
          📋 Download Certificate
        </motion.button>
      </div>

      {/* Footer */}
      <div className="mt-8 text-center">
        {isRealBlockchain ? (
          <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg">
            <p className="text-green-200 font-semibold mb-2">
              ✅ REAL BLOCKCHAIN VERIFICATION
            </p>
            <p className="text-green-200/80 text-sm">
              Your zero-knowledge proof has been stored on Polygon mainnet using
              your private key.
              <br />
              Transaction is immutable and publicly verifiable on the
              blockchain.
            </p>
          </div>
        ) : (
          <div className="p-4 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
            <p className="text-yellow-200 font-semibold mb-2">
              ⚠️ MOCK VERIFICATION MODE
            </p>
            <p className="text-yellow-200/80 text-sm">
              No private key provided. Proof verification is simulated (not on
              real blockchain).
              <br />
              To use REAL blockchain, provide your private key on the upload
              page.
            </p>
          </div>
        )}
      </div>
    </motion.div>
  );
}
