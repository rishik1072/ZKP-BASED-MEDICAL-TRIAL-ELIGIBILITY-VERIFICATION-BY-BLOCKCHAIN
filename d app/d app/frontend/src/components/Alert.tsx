import { motion } from 'framer-motion'
import { ReactNode } from 'react'

export interface AlertProps {
  type: 'success' | 'error' | 'warning' | 'info'
  message: string
  icon?: ReactNode
  onClose?: () => void
}

export function Alert({ type, message, icon, onClose }: AlertProps) {
  const config = {
    success: {
      bg: 'from-green-500/20 to-green-600/10',
      border: 'border-green-500/50',
      icon: icon || '✓',
      color: 'text-green-300',
    },
    error: {
      bg: 'from-red-500/20 to-red-600/10',
      border: 'border-red-500/50',
      icon: icon || '✕',
      color: 'text-red-300',
    },
    warning: {
      bg: 'from-yellow-500/20 to-yellow-600/10',
      border: 'border-yellow-500/50',
      icon: icon || '⚠',
      color: 'text-yellow-300',
    },
    info: {
      bg: 'from-blue-500/20 to-blue-600/10',
      border: 'border-blue-500/50',
      icon: icon || 'ℹ',
      color: 'text-blue-300',
    },
  }[type]

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={`glassmorphism border ${config.border} bg-gradient-to-r ${config.bg} p-4 rounded-lg flex items-center gap-3 mb-4`}
    >
      <span className={`text-xl ${config.color}`}>{config.icon}</span>
      <p className="text-white flex-1">{message}</p>
      {onClose && (
        <button
          onClick={onClose}
          className="text-white/60 hover:text-white transition-colors"
        >
          ✕
        </button>
      )}
    </motion.div>
  )
}
