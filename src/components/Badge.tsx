import type { KeyboardEvent, ReactNode } from 'react'
import { toneClass, type Tone } from './tones'

interface BadgeProps {
  tone: Tone
  className?: string
  children: ReactNode
  onClick?: () => void
  active?: boolean
}

export default function Badge({
  tone,
  className = '',
  children,
  onClick,
  active = true,
}: BadgeProps) {
  const classes = `inline-block rounded-md border px-2 py-0.5 text-xs font-medium ${toneClass(
    tone,
  )} ${className}`

  if (!onClick) return <span className={classes}>{children}</span>

  const onKeyDown = (event: KeyboardEvent<HTMLSpanElement>) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault()
      onClick()
    }
  }

  return (
    <span
      role="button"
      tabIndex={0}
      aria-pressed={active}
      onClick={onClick}
      onKeyDown={onKeyDown}
      className={`${classes} cursor-pointer select-none outline-none focus-visible:ring-2 focus-visible:ring-indigo-500 ${
        active ? '' : 'opacity-40'
      }`}
    >
      {children}
    </span>
  )
}
