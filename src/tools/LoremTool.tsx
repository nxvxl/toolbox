import { useState } from 'react'
import Button from '../components/Button'
import Panel from '../components/Panel'
import TitleBar from '../components/TitleBar'
import ToolHeader from '../components/ToolHeader'
import {
  generateLorem,
  type LoremOptions,
  type LoremUnit,
} from '../lib/lorem'

const UNITS: { value: LoremUnit; label: string }[] = [
  { value: 'paragraphs', label: 'Paragraphs' },
  { value: 'sentences', label: 'Sentences' },
  { value: 'words', label: 'Words' },
]

const DEFAULT_COUNT: Record<LoremUnit, number> = {
  paragraphs: 3,
  sentences: 5,
  words: 50,
}

const INITIAL: LoremOptions = {
  unit: 'paragraphs',
  count: 3,
  startWithLorem: true,
}

export default function LoremTool() {
  const [options, setOptions] = useState<LoremOptions>(INITIAL)
  const [text, setText] = useState(() => generateLorem(INITIAL))
  const [copied, setCopied] = useState(false)

  const changeUnit = (unit: LoremUnit) =>
    setOptions((current) => ({ ...current, unit, count: DEFAULT_COUNT[unit] }))

  const copy = async () => {
    await navigator.clipboard.writeText(text)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  const words = text.trim() === '' ? 0 : text.trim().split(/\s+/).length

  return (
    <div className="flex h-full flex-col gap-4">
      <ToolHeader
        title="Lorem Ipsum Generator"
        description="Generate placeholder text by paragraphs, sentences or words."
      >
        <Button
          variant="primary"
          onClick={() => {
            setText(generateLorem(options))
            setCopied(false)
          }}
        >
          Generate
        </Button>
      </ToolHeader>

      <Panel className="shrink-0">
        <TitleBar title="Options" />
        <div className="flex flex-wrap items-center gap-5 p-3 text-xs">
          <label className="flex items-center gap-2 text-slate-400">
            Type
            <select
              value={options.unit}
              onChange={(event) => changeUnit(event.target.value as LoremUnit)}
              className="px-2 py-1"
            >
              {UNITS.map((unit) => (
                <option key={unit.value} value={unit.value}>
                  {unit.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-slate-400">
            Amount
            <input
              type="number"
              min={1}
              max={100}
              value={options.count}
              onChange={(event) =>
                setOptions((current) => ({
                  ...current,
                  count: Number(event.target.value),
                }))
              }
              className="w-20 px-2 py-1"
            />
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-slate-400">
            <input
              type="checkbox"
              checked={options.startWithLorem}
              onChange={() =>
                setOptions((current) => ({
                  ...current,
                  startWithLorem: !current.startWithLorem,
                }))
              }
            />
            Start with &ldquo;Lorem ipsum&rdquo;
          </label>
        </div>
      </Panel>

      <Panel className="flex min-h-0 flex-col">
        <TitleBar title={`Output (${words} words)`}>
          <Button size="sm" onClick={copy}>
            {copied ? 'Copied' : 'Copy'}
          </Button>
        </TitleBar>
        <div className="min-h-0 flex-1 overflow-auto p-3">
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-slate-200">
            {text}
          </p>
        </div>
      </Panel>
    </div>
  )
}
