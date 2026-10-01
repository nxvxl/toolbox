import type { ReactNode } from 'react'

interface TitleBarProps {
  title: string
  className?: string
  children?: ReactNode
}

export default function TitleBar({
  title,
  className = '',
  children,
}: TitleBarProps) {
  return (
    <div className={`title-bar ${className}`}>
      <span className="text-xs font-semibold">{title}</span>
      {children && (
        <div className="ml-auto flex flex-wrap items-center gap-2">
          {children}
        </div>
      )}
    </div>
  )
}
