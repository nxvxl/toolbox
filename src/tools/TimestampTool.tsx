import { useMemo, useState } from 'react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import ErrorNote from '../components/ErrorNote'
import Panel from '../components/Panel'
import TitleBar from '../components/TitleBar'
import ToolHeader from '../components/ToolHeader'
import {
  formatRelative,
  parseTimestamp,
  toUnixMilliseconds,
  toUnixSeconds,
  type ParsedTimestamp,
} from '../lib/timestamp'

const currentSeconds = () => String(Math.floor(Date.now() / 1000))

interface Row {
  label: string
  value: string
}

const buildRows = (parsed: ParsedTimestamp): Row[] => {
  const { date } = parsed
  return [
    { label: 'Unix (seconds)', value: String(toUnixSeconds(date)) },
    { label: 'Unix (milliseconds)', value: String(toUnixMilliseconds(date)) },
    { label: 'ISO 8601 (UTC)', value: date.toISOString() },
    { label: 'UTC', value: date.toUTCString() },
    {
      label: 'Local time',
      value: date.toLocaleString(undefined, { timeZoneName: 'short' }),
    },
    { label: 'Relative', value: formatRelative(date) },
  ]
}

export default function TimestampTool() {
  const [input, setInput] = useState(currentSeconds)
  const [copied, setCopied] = useState<string | null>(null)

  const parsed = useMemo(() => parseTimestamp(input), [input])
  const empty = input.trim() === ''
  const rows = parsed ? buildRows(parsed) : []

  const copy = async (label: string, value: string) => {
    await navigator.clipboard.writeText(value)
    setCopied(label)
    window.setTimeout(() => setCopied(null), 1500)
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <ToolHeader
        title="Unix Timestamp Converter"
        description="Convert between Unix epoch, ISO 8601 and local time."
      >
        <Button variant="primary" onClick={() => setInput(currentSeconds())}>
          Now
        </Button>
        <Button onClick={() => setInput('')}>Clear</Button>
      </ToolHeader>

      <Panel className="shrink-0">
        <TitleBar title="Input">
          {parsed?.inputKind === 'unix' && parsed.unit && (
            <Badge tone="moved">{parsed.unit}</Badge>
          )}
          {parsed?.inputKind === 'date' && <Badge tone="moved">date string</Badge>}
        </TitleBar>
        <div className="p-3">
          <input
            value={input}
            onChange={(event) => setInput(event.target.value)}
            spellCheck={false}
            placeholder="1700000000, 1700000000000 or 2023-11-14T22:13:20Z"
            className="w-full px-3 py-2 text-sm"
          />
        </div>
      </Panel>

      {empty ? (
        <p className="text-sm text-slate-500">
          Enter a Unix timestamp or a date string to convert it.
        </p>
      ) : parsed ? (
        <Panel className="flex min-h-0 flex-col">
          <TitleBar title="Converted" />
          <div className="min-h-0 flex-1 overflow-auto">
            <dl className="divide-y divide-slate-700">
              {rows.map((row) => (
                <div
                  key={row.label}
                  className="flex items-center gap-3 px-3 py-2"
                >
                  <dt className="w-44 shrink-0 text-xs text-slate-500">
                    {row.label}
                  </dt>
                  <dd className="min-w-0 flex-1 break-all font-mono text-xs text-slate-200">
                    {row.value}
                  </dd>
                  <Button size="sm" onClick={() => copy(row.label, row.value)}>
                    {copied === row.label ? 'Copied' : 'Copy'}
                  </Button>
                </div>
              ))}
            </dl>
          </div>
        </Panel>
      ) : (
        <ErrorNote>
          Could not parse "{input.trim()}" as a Unix timestamp or date.
        </ErrorNote>
      )}
    </div>
  )
}
