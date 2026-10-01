import type { ReactNode } from 'react'

export default function ErrorNote({ children }: { children: ReactNode }) {
  return (
    <p className="whitespace-pre-wrap break-words rounded-md border border-rose-500/30 bg-rose-500/10 p-3 font-mono text-xs text-rose-700">
      {children}
    </p>
  )
}
