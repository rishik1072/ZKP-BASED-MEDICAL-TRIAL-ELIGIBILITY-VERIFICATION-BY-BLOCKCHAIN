import { motion } from 'framer-motion'

export interface ProgressBarProps {
  value: number
  max?: number
  showLabel?: boolean
  animated?: boolean
}

export function ProgressBar({
  value,
  max = 100,
  showLabel = true,
  animated = true,
}: ProgressBarProps) {
  const percentage = Math.min((value / max) * 100, 100)

  return (
    <div className="w-full">
      <div className="relative w-full h-2 bg-white/20 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-gradient-to-r from-primary-500 to-pink-500"
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: animated ? 0.5 : 0, ease: 'easeOut' }}
        />
      </div>
      {showLabel && (
        <p className="text-white/60 text-xs mt-2 text-center">{Math.round(percentage)}%</p>
      )}
    </div>
  )
}
