import type { ReactNode } from 'react'

interface PageTransitionProps {
  className?: string
  children: ReactNode
}

/**
 * Wraps a route's content so it fades/slides in on mount. Re-key it (e.g. by
 * tool id) to replay the animation when navigating within the same route.
 */
export default function PageTransition({
  className = '',
  children,
}: PageTransitionProps) {
  return <div className={`page-enter ${className}`}>{children}</div>
}
