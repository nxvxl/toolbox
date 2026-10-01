interface ButtonProps {
  onClick: () => void
  children: React.ReactNode
  variant?: 'ghost' | 'primary'
}

export default function Button({
  onClick,
  children,
  variant = 'ghost',
}: ButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      data-variant={variant === 'primary' ? 'primary' : undefined}
      className="px-3 py-2 text-sm"
    >
      {children}
    </button>
  )
}
