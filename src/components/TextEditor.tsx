interface TextEditorProps {
  label: string
  value: string
  accent: string
  placeholder?: string
  onChange: (value: string) => void
}

export default function TextEditor({
  label,
  value,
  accent,
  placeholder,
  onChange,
}: TextEditorProps) {
  return (
    <div className="window flex min-h-[180px] flex-col">
      <div className="title-bar">
        <span className={`text-xs font-semibold ${accent}`}>
          {label}
        </span>
      </div>
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        placeholder={placeholder}
        className="min-h-0 flex-1 resize-none p-3 text-sm outline-none"
      />
    </div>
  )
}
