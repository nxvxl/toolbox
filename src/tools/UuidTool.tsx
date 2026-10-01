import { useMemo, useState } from 'react'
import Button from '../components/Button'
import Panel from '../components/Panel'
import TitleBar from '../components/TitleBar'
import ToolHeader from '../components/ToolHeader'
import {
  formatUuid,
  generateUuids,
  type UuidFormatOptions,
  type UuidVersion,
} from '../lib/uuid'

const VERSIONS: { value: UuidVersion; label: string }[] = [
  { value: 'v4', label: 'v4 (random)' },
  { value: 'v7', label: 'v7 (time-ordered)' },
]

export default function UuidTool() {
  const [version, setVersion] = useState<UuidVersion>('v4')
  const [count, setCount] = useState(5)
  const [options, setOptions] = useState<UuidFormatOptions>({
    uppercase: false,
    hyphens: true,
    braces: false,
  })
  const [uuids, setUuids] = useState<string[]>(() => generateUuids('v4', 5))
  const [copied, setCopied] = useState<string | null>(null)

  const formatted = useMemo(
    () => uuids.map((uuid) => formatUuid(uuid, options)),
    [uuids, options],
  )

  const copy = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(null), 1500)
  }

  const toggle = (key: keyof UuidFormatOptions) =>
    setOptions((current) => ({ ...current, [key]: !current[key] }))

  return (
    <div className="flex h-full flex-col gap-4">
      <ToolHeader
        title="UUID Generator"
        description="Generate random (v4) and time-ordered (v7) UUIDs."
      >
        <Button
          variant="primary"
          onClick={() => {
            setUuids(generateUuids(version, count))
            setCopied(null)
          }}
        >
          Generate
        </Button>
      </ToolHeader>

      <Panel className="shrink-0">
        <TitleBar title="Options" />
        <div className="flex flex-wrap items-center gap-5 p-3 text-xs">
          <label className="flex items-center gap-2 text-slate-400">
            Version
            <select
              value={version}
              onChange={(event) => setVersion(event.target.value as UuidVersion)}
              className="px-2 py-1"
            >
              {VERSIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="flex items-center gap-2 text-slate-400">
            Count
            <input
              type="number"
              min={1}
              max={1000}
              value={count}
              onChange={(event) => setCount(Number(event.target.value))}
              className="w-20 px-2 py-1"
            />
          </label>
          {(
            [
              ['hyphens', 'Hyphens'],
              ['uppercase', 'Uppercase'],
              ['braces', 'Braces'],
            ] as [keyof UuidFormatOptions, string][]
          ).map(([key, label]) => (
            <label
              key={key}
              className="flex cursor-pointer items-center gap-2 text-slate-400"
            >
              <input
                type="checkbox"
                checked={options[key]}
                onChange={() => toggle(key)}
              />
              {label}
            </label>
          ))}
        </div>
      </Panel>

      <Panel className="flex min-h-0 flex-col">
        <TitleBar title={`UUIDs (${formatted.length})`}>
          <Button
            size="sm"
            onClick={() => copy('all', formatted.join('\n'))}
          >
            {copied === 'all' ? 'Copied' : 'Copy all'}
          </Button>
        </TitleBar>
        <ul className="min-h-0 flex-1 divide-y divide-slate-700 overflow-auto">
          {formatted.map((uuid, index) => (
            <li
              key={uuid}
              className="flex items-center gap-3 px-3 py-2"
            >
              <span className="w-8 shrink-0 text-right text-xs text-slate-500">
                {index + 1}
              </span>
              <code className="min-w-0 flex-1 break-all text-xs text-slate-200">
                {uuid}
              </code>
              <Button
                size="sm"
                onClick={() => copy(uuid, uuid)}
              >
                {copied === uuid ? 'Copied' : 'Copy'}
              </Button>
            </li>
          ))}
        </ul>
      </Panel>
    </div>
  )
}
