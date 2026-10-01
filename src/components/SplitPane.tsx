import {
  Children,
  useCallback,
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type KeyboardEvent as ReactKeyboardEvent,
  type PointerEvent as ReactPointerEvent,
  type ReactNode,
} from 'react'

const MIN = 20
const MAX = 80

const clamp = (value: number) => Math.min(MAX, Math.max(MIN, value))
const storageKey = (id: string) => `toolbox.split.${id}`

const readRatio = (id: string, fallback: number): number => {
  try {
    const raw = localStorage.getItem(storageKey(id))
    if (raw === null) return fallback
    const value = Number(raw)
    return Number.isFinite(value) ? clamp(value) : fallback
  } catch {
    return fallback
  }
}

type Orientation = 'horizontal' | 'vertical'

interface SplitPaneProps {
  /** Persistence key; the split ratio is stored per id in localStorage. */
  id: string
  /** `horizontal` = side by side (default); `vertical` = stacked. */
  orientation?: Orientation
  /** Ratio (%) for the first pane; used initially and on double-click reset. */
  defaultRatio?: number
  className?: string
  /** Exactly two panes: [first, second]. */
  children: ReactNode
}

/**
 * Two panes separated by a draggable divider, resizable along one axis and
 * persisted per id. Double-click the divider to reset to `defaultRatio`.
 * A horizontal split collapses to a column below `lg`.
 */
export default function SplitPane({
  id,
  orientation = 'horizontal',
  defaultRatio = 50,
  className = '',
  children,
}: SplitPaneProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const userChanged = useRef(false)
  const endDragRef = useRef<(() => void) | null>(null)
  const initial = clamp(defaultRatio)
  const [ratio, setRatio] = useState(() => readRatio(id, initial))
  const [dragging, setDragging] = useState(false)
  const vertical = orientation === 'vertical'

  // Only persist after the user actually changes the ratio, so a later change
  // to `defaultRatio` still takes effect for anyone who never resized.
  const changeRatio = useCallback((value: number) => {
    userChanged.current = true
    setRatio(value)
  }, [])

  useEffect(() => {
    if (!userChanged.current) return
    try {
      localStorage.setItem(storageKey(id), String(Math.round(ratio)))
    } catch {
      // ignore storage access errors
    }
  }, [id, ratio])

  // Tear down an in-flight drag if the component unmounts.
  useEffect(() => () => endDragRef.current?.(), [])

  const onPointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    event.preventDefault()
    setDragging(true)

    const onMove = (moveEvent: PointerEvent) => {
      const element = containerRef.current
      if (!element) return
      const rect = element.getBoundingClientRect()
      const percent = vertical
        ? ((moveEvent.clientY - rect.top) / rect.height) * 100
        : ((moveEvent.clientX - rect.left) / rect.width) * 100
      if (Number.isFinite(percent)) changeRatio(clamp(percent))
    }

    const endDrag = () => {
      window.removeEventListener('pointermove', onMove)
      window.removeEventListener('pointerup', endDrag)
      document.body.style.cursor = ''
      document.body.style.userSelect = ''
      endDragRef.current = null
      setDragging(false)
    }
    endDragRef.current = endDrag

    window.addEventListener('pointermove', onMove)
    window.addEventListener('pointerup', endDrag)
    document.body.style.cursor = vertical ? 'row-resize' : 'col-resize'
    document.body.style.userSelect = 'none'
  }

  const onKeyDown = (event: ReactKeyboardEvent<HTMLDivElement>) => {
    const [decrease, increase] = vertical
      ? ['ArrowUp', 'ArrowDown']
      : ['ArrowLeft', 'ArrowRight']
    if (event.key === decrease) {
      event.preventDefault()
      changeRatio(clamp(ratio - 2))
    } else if (event.key === increase) {
      event.preventDefault()
      changeRatio(clamp(ratio + 2))
    }
  }

  const [first, second] = Children.toArray(children)
  const style = { '--split': `${ratio}%` } as CSSProperties

  return (
    <div
      ref={containerRef}
      className={`split ${vertical ? 'split-vertical' : ''} ${className}`}
      style={style}
    >
      <div className="split-pane split-pane-left">{first}</div>
      <div
        className="split-handle"
        role="separator"
        aria-orientation={vertical ? 'horizontal' : 'vertical'}
        aria-label="Resize panes"
        aria-valuemin={MIN}
        aria-valuemax={MAX}
        aria-valuenow={Math.round(ratio)}
        title="Drag to resize, double-click to reset"
        tabIndex={0}
        data-dragging={dragging ? '' : undefined}
        onPointerDown={onPointerDown}
        onKeyDown={onKeyDown}
        onDoubleClick={() => changeRatio(initial)}
      >
        {dragging && <span className="split-tooltip">{Math.round(ratio)}%</span>}
      </div>
      <div className="split-pane">{second}</div>
    </div>
  )
}
