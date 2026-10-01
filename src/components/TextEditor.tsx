import Panel from './Panel'
import TitleBar from './TitleBar'

interface TextEditorProps {
  label: string
  value: string
  placeholder?: string
  onChange: (value: string) => void
}

export default function TextEditor({
  label,
  value,
  placeholder,
  onChange,
}: TextEditorProps) {
  return (
    <Panel className="flex min-h-[180px] flex-col">
      <TitleBar title={label} />
      <textarea
        value={value}
        onChange={(event) => onChange(event.target.value)}
        spellCheck={false}
        placeholder={placeholder}
        className="min-h-0 flex-1 resize-none p-3 text-sm outline-none"
      />
    </Panel>
  )
}
