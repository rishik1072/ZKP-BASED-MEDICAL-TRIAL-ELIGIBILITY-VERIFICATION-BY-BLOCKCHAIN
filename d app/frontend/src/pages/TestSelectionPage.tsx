import { motion } from "framer-motion";

interface TestSelectionPageProps {
  onTestSelected: (testType: string) => void;
}

const tests = [
  {
    id: "blood",
    name: "Blood Donation",
    icon: "🩸",
    description: "Check eligibility for blood donation",
    requirements: [
      "Age > 18 years",
      "Hemoglobin > threshold",
      "Weight > 50 kg",
    ],
    color: "from-red-500 to-pink-500",
  },
  {
    id: "mri",
    name: "MRI Scan",
    icon: "🧲",
    description: "Check eligibility for MRI scan",
    requirements: ["No metal implants", "No pacemaker", "Age > 5 years"],
    color: "from-blue-500 to-cyan-500",
  },
  {
    id: "ct",
    name: "CT Scan",
    icon: "🔬",
    description: "Check eligibility for CT scan",
    requirements: ["Weight < 160 kg", "No pregnancy", "Age > 18 years"],
    color: "from-purple-500 to-indigo-500",
  },
];

export default function TestSelectionPage({
  onTestSelected,
}: TestSelectionPageProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="max-w-5xl mx-auto"
    >
      <div className="mb-8 text-center">
        <h2 className="text-2xl font-bold text-white mb-2">
          Select Medical Test
        </h2>
        <p className="text-white/70">
          Choose which medical test you want to verify eligibility for
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {tests.map((test, idx) => (
          <motion.div
            key={test.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: idx * 0.1 }}
            whileHover={{ scale: 1.05, y: -5 }}
            whileTap={{ scale: 0.95 }}
            className="group relative cursor-pointer"
            onClick={() => onTestSelected(test.id)}
          >
            <div
              className={`bg-gradient-to-br ${test.color} absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 blur-lg`}
            />
            <div className="relative glassmorphism rounded-2xl p-6 text-left h-full">
              <div className="text-4xl mb-3">{test.icon}</div>
              <h3 className="text-xl font-bold text-white mb-2">{test.name}</h3>
              <p className="text-white/70 text-sm mb-4">{test.description}</p>

              <div className="space-y-2">
                <p className="text-white/60 text-xs font-semibold">
                  Requirements:
                </p>
                {test.requirements.map((req, i) => (
                  <div
                    key={i}
                    className="flex items-start text-white/80 text-sm"
                  >
                    <span className="mr-2">✓</span>
                    <span>{req}</span>
                  </div>
                ))}
              </div>

              <div className="mt-6 w-full bg-white/20 hover:bg-white/30 text-white font-semibold py-2 rounded-lg smooth-transition text-center">
                Select Test
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </motion.div>
  );
}
