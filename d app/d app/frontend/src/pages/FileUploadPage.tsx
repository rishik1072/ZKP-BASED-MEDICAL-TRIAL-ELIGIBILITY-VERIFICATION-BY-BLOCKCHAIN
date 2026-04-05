import { useRef, useState } from "react";
import { motion } from "framer-motion";
import JSZip from "jszip";
import { Loading, Alert } from "../components";

interface FileUploadPageProps {
  onUploadComplete: (credential: any, privateKey?: string) => void;
}

export default function FileUploadPage({
  onUploadComplete,
}: FileUploadPageProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [privateKey, setPrivateKey] = useState("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(e.type === "dragenter" || e.type === "dragover");
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const validateCredentialStructure = (credential: any) => {
    // Support two credential formats:
    // Format 1: Encrypted credential (user format)
    // Format 2: Standard credential (old format)

    // Check if it's the encrypted format (user's format)
    if (credential.credentialId && credential.encryptedData) {
      // Validate encrypted format
      const requiredEncryptedFields = [
        "credentialId",
        "encryptedData",
        "credentialHash",
        "signature",
      ];
      const missingFields = requiredEncryptedFields.filter(
        (field) => !(field in credential),
      );

      if (missingFields.length > 0) {
        throw new Error(
          `⚠️ Invalid Encrypted Credential Format:\n\nMissing required fields:\n• ${missingFields.join("\n• ")}`,
        );
      }

      // Validate encryptedData structure
      if (typeof credential.encryptedData !== "object") {
        throw new Error("❌ Invalid encryptedData: must be an object");
      }

      const requiredEncryptionFields = ["encrypted", "iv", "authTag", "salt"];
      const missingEncryptionFields = requiredEncryptionFields.filter(
        (field) => !(field in credential.encryptedData),
      );

      if (missingEncryptionFields.length > 0) {
        throw new Error(
          `❌ Invalid encryptedData structure:\n\nMissing fields: ${missingEncryptionFields.join(", ")}`,
        );
      }

      return true;
    }

    // Otherwise validate standard format
    const requiredFields = [
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
    const missingFields = requiredFields.filter(
      (field) => !(field in credential),
    );

    if (missingFields.length > 0) {
      throw new Error(
        `⚠️ Invalid Credential Format:\n\nMissing required fields:\n• ${missingFields.join("\n• ")}\n\nYour credential must contain all required fields.`,
      );
    }

    // Validate data types and structure
    if (
      typeof credential.patientId !== "string" ||
      !credential.patientId.trim()
    ) {
      throw new Error("❌ Invalid patientId: must be a non-empty string");
    }

    if (
      typeof credential.age !== "number" ||
      credential.age < 0 ||
      credential.age > 150
    ) {
      throw new Error("❌ Invalid age: must be a number between 0 and 150");
    }

    if (!["M", "F", "Other"].includes(credential.gender)) {
      throw new Error("❌ Invalid gender: must be M, F, or Other");
    }

    // Validate medicalData object
    if (!credential.medicalData || typeof credential.medicalData !== "object") {
      throw new Error("❌ Invalid medicalData: must be an object");
    }

    const medicalDataFields = [
      "hemoglobin",
      "weight",
      "bloodType",
      "metalImplants",
      "pacemaker",
      "pregnancy",
      "lastCheckup",
    ];
    const hasMedicalData = medicalDataFields.some(
      (field) => field in credential.medicalData,
    );

    if (!hasMedicalData) {
      throw new Error(
        `❌ Invalid medicalData: must contain at least one of: ${medicalDataFields.join(", ")}`,
      );
    }

    // Validate encrypted object
    if (!credential.encrypted || typeof credential.encrypted !== "object") {
      throw new Error("❌ Invalid encrypted: must be an object");
    }

    const requiredEncryptedFields = ["method", "iv", "tag", "ciphertext"];
    const missingEncryptedFields = requiredEncryptedFields.filter(
      (field) => !(field in credential.encrypted),
    );

    if (missingEncryptedFields.length > 0) {
      throw new Error(
        `❌ Invalid encrypted structure:\n\nMissing fields: ${missingEncryptedFields.join(", ")}`,
      );
    }

    // Validate signature
    if (
      typeof credential.rsaSignature !== "string" ||
      !credential.rsaSignature.trim()
    ) {
      throw new Error("❌ Invalid rsaSignature: must be a non-empty string");
    }

    // Validate nonce
    if (typeof credential.nonce !== "number" || credential.nonce < 0) {
      throw new Error("❌ Invalid nonce: must be a positive number");
    }

    return true;
  };

  const processFile = async (file: File) => {
    setError("");
    setIsLoading(true);

    try {
      let credential: any;

      if (file.name.endsWith(".json")) {
        // Handle plain JSON file
        const text = await file.text();
        credential = JSON.parse(text);
      } else if (file.name.endsWith(".zip")) {
        // Handle ZIP file with JSON inside
        const arrayBuffer = await file.arrayBuffer();
        const zip = new JSZip();

        try {
          await zip.loadAsync(arrayBuffer);
        } catch (zipErr) {
          // Check if it's an encrypted ZIP - be more specific about detection
          const errorMsg =
            zipErr instanceof Error ? zipErr.message : String(zipErr);
          const lowerMsg = errorMsg.toLowerCase();

          // Only flag as password-protected if error message specifically mentions password or encryption
          if (
            lowerMsg.includes("password") ||
            lowerMsg.includes("encrypted") ||
            lowerMsg.includes("required password")
          ) {
            throw new Error(
              "🔐 Password-Protected ZIP Detected:\n\nYour credential file is encrypted. Please:\n\n1. Use a ZIP extractor tool (WinRAR, 7-Zip, macOS Archive Utility)\n2. Extract with the correct password\n3. Upload the extracted JSON file\n\nAlternatively, contact your credential provider for an unencrypted version.",
            );
          }
          // For other errors, provide more helpful message
          throw new Error(
            `❌ Failed to read ZIP file: ${errorMsg}\n\nThe ZIP file may be corrupted. Try:\n1. Extracting manually with 7-Zip or WinRAR\n2. Re-uploading the extracted JSON file\n3. Checking if the file is a valid ZIP archive`,
          );
        }

        // Find the first JSON file in the ZIP
        let jsonFile: any = null;
        let jsonContent: string = "";

        for (const [filename, fileEntry] of Object.entries(zip.files)) {
          if (filename.endsWith(".json") && !fileEntry.dir) {
            jsonContent = await fileEntry.async("text");
            jsonFile = filename;
            break;
          }
        }

        if (!jsonFile) {
          throw new Error(
            "❌ No JSON file found inside the ZIP archive. The ZIP file appears to be corrupted or empty.",
          );
        }

        credential = JSON.parse(jsonContent);
      } else {
        throw new Error(
          "📋 Unsupported file format. Please upload either a .json file or a .zip file.",
        );
      }

      // Validate credential structure
      validateCredentialStructure(credential);

      setIsLoading(false);
      onUploadComplete(credential, privateKey || undefined);
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to parse credential file",
      );
    } finally {
      setIsLoading(false);
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
          Upload Medical Credential
        </h2>
        <p className="text-white/70 mb-8">
          Upload your medical credential file (JSON or ZIP format)
        </p>

        {/* Drag and Drop Area */}
        <motion.div
          onDragEnter={handleDrag}
          onDragLeave={handleDrag}
          onDragOver={handleDrag}
          onDrop={handleDrop}
          animate={{
            backgroundColor: isDragActive
              ? "rgba(255, 255, 255, 0.15)"
              : "rgba(255, 255, 255, 0.05)",
            borderColor: isDragActive
              ? "rgba(255, 255, 255, 0.5)"
              : "rgba(255, 255, 255, 0.2)",
          }}
          className="border-2 border-dashed rounded-xl p-12 text-center cursor-pointer mb-6 smooth-transition"
        >
          <input
            ref={fileInputRef}
            type="file"
            accept=".json,.zip"
            onChange={handleChange}
            className="hidden"
            disabled={isLoading}
          />

          <div onClick={() => fileInputRef.current?.click()}>
            <motion.div
              animate={{ y: isDragActive ? -5 : 0 }}
              className="text-5xl mb-4"
            >
              📄
            </motion.div>
            <p className="text-white font-semibold mb-2">
              {isDragActive
                ? "Drop your credential file here"
                : "Drag and drop your credential file"}
            </p>
            <p className="text-white/60">or click to browse</p>
          </div>
        </motion.div>

        {/* Error Message */}
        {error && (
          <Alert type="error" message={error} onClose={() => setError("")} />
        )}

        {/* Loading Indicator */}
        {isLoading && (
          <div className="mb-6">
            <Loading message="Processing credential..." size="md" />
          </div>
        )}

        {/* Private Key Input */}
        <div className="mb-8 bg-indigo-500/10 rounded-lg p-6 border border-indigo-500/30">
          <label className="block text-white font-semibold mb-3">
            🔐 Blockchain Private Key (Optional)
          </label>
          <p className="text-white/70 text-sm mb-3">
            Enter your Polygon private key for storing the proof on-chain. Your
            private key is never sent to our servers - it's used only in your
            browser for signing transactions.
          </p>
          <input
            type="password"
            placeholder="0x..."
            value={privateKey}
            onChange={(e) => setPrivateKey(e.target.value)}
            className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 text-white placeholder-white/50 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
          />
          <p className="text-yellow-400/70 text-xs mt-2">
            ⚠️ Warning: Never share your private key with anyone
          </p>
        </div>

        {/* Sample Credential Info */}
        <div className="mt-8 bg-white/10 rounded-lg p-6 text-white/80 text-sm space-y-4">
          <div>
            <p className="font-semibold text-white mb-2">
              📋 JSON Format Example:
            </p>
            <pre className="bg-black/30 p-3 rounded overflow-x-auto text-xs">
              {`{
  "patientId": "P123456",
  "age": 35,
  "gender": "M",
  "medicalData": {
    "hemoglobin": 14.5,
    "weight": 75,
    "metalImplants": false,
    "pacemaker": false,
    "pregnancy": false
  },
  "issuedAt": "2024-01-01T00:00:00Z"
}`}
            </pre>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="font-semibold text-white mb-2">
              📦 ZIP File Support:
            </p>
            <ul className="space-y-2 text-white/70 text-xs">
              <li>✅ Accepts unencrypted ZIP files with JSON inside</li>
              <li>
                ❌ Encrypted/password-protected ZIPs not supported in browser
              </li>
              <li>
                💡 For password-protected files: Extract manually → Upload JSON
              </li>
            </ul>
          </div>

          <div className="border-t border-white/10 pt-4">
            <p className="font-semibold text-white mb-2">🔑 Required Fields:</p>
            <ul className="text-white/70 text-xs">
              <li>
                • <strong>patientId</strong> - Unique patient identifier
              </li>
              <li>
                • <strong>age</strong> - Patient age (number)
              </li>
              <li>• Other fields recommended but optional</li>
            </ul>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
