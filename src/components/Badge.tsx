import type { ReactNode } from 'react'
import { toneClass, type Tone } from './tones'

interface BadgeProps {
  tone: Tone
  className?: string
  children: ReactNode
}

export default function Badge({ tone, className = '', children }: BadgeProps) {
  return (
    <span
      className={`inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${toneClass(
        tone,
      )} ${className}`}
    >
      {children}
    </span>
  )
}
