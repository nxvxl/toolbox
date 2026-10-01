import type { ReactNode } from 'react'

interface PanelProps {
  className?: string
  children: ReactNode
}

export default function Panel({ className = '', children }: PanelProps) {
  return <section className={`window ${className}`}>{children}</section>
}
