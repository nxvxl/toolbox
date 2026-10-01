import Button from './Button'

interface SearchInputProps {
  value: string
  onChange: (value: string) => void
  placeholder?: string
  ariaLabel?: string
  autoFocus?: boolean
  /** Sizing/padding/text classes for the input. */
  className?: string
}

export default function SearchInput({
  value,
  onChange,
  placeholder = 'Search...',
  ariaLabel = 'Search',
  autoFocus = false,
  className = '',
}: SearchInputProps) {
  return (
    <div className="relative">
      <input
        type="search"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        aria-label={ariaLabel}
        autoFocus={autoFocus}
        className={`w-full outline-none ${className}`}
      />
      {value !== '' && (
        <Button
          size="sm"
          className="absolute right-2 top-1/2 -translate-y-1/2"
          onClick={() => onChange('')}
          aria-label="Clear search"
        >
          ×
        </Button>
      )}
    </div>
  )
}
