import { motion } from 'framer-motion'

export interface StepperProps {
  steps: Array<{ id: string; label: string; icon: string }>
  currentStep: string
}

export function Stepper({ steps, currentStep }: StepperProps) {
  const currentIndex = steps.findIndex((s) => s.id === currentStep)

  return (
    <div className="mb-8">
      <div className="flex justify-between items-center">
        {steps.map((step, idx) => (
          <div key={step.id} className="flex items-center flex-1">
            {/* Step Circle */}
            <motion.div
              className={`flex items-center justify-center w-12 h-12 rounded-full font-bold text-lg ${
                idx <= currentIndex
                  ? 'bg-gradient-to-r from-primary-500 to-pink-500 text-white'
                  : 'bg-white/20 text-white/60'
              }`}
              animate={{
                scale: idx === currentIndex ? 1.1 : 1,
                boxShadow:
                  idx === currentIndex ? '0 0 20px rgba(102, 126, 234, 0.6)' : 'none',
              }}
            >
              {step.icon}
            </motion.div>

            {/* Step Label */}
            <div className="ml-3">
              <p className="text-white/90 font-semibold text-sm">{step.label}</p>
            </div>

            {/* Connector Line */}
            {idx < steps.length - 1 && (
              <motion.div
                className="flex-1 h-1 mx-4 bg-white/20 rounded-full"
                animate={{
                  backgroundColor:
                    idx < currentIndex ? 'rgba(240, 147, 251, 0.8)' : 'rgba(255, 255, 255, 0.2)',
                }}
              />
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
