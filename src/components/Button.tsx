import type { ButtonHTMLAttributes } from 'react'

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'ghost' | 'primary'
  size?: 'sm' | 'md'
}

export default function Button({
  variant = 'ghost',
  size = 'md',
  className = '',
  children,
  ...rest
}: ButtonProps) {
  const sizing = size === 'sm' ? 'px-2 py-0.5 text-xs' : 'px-3 py-2 text-sm'

  return (
    <button
      type="button"
      data-variant={variant === 'primary' ? 'primary' : undefined}
      className={`${sizing} ${className}`}
      {...rest}
    >
      {children}
    </button>
  )
}
