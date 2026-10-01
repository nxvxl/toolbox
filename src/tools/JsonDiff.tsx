import { useMemo, useState } from 'react'
import Button from '../components/Button'
import TextEditor from '../components/TextEditor'
import ToolHeader from '../components/ToolHeader'
import { diffJson, type ChangeType, type DiffEntry } from '../lib/jsonDiff'

const SAMPLE_OLD = `{
  "name": "toolbox",
  "version": "0.1.0",
  "private": true,
  "tags": ["utils", "web"],
  "users": [
    { "id": 1, "name": "Ada", "role": "admin" },
    { "id": 2, "name": "Linus", "role": "user" },
    { "id": 3, "name": "Grace", "role": "user" }
  ]
}`

const SAMPLE_NEW = `{
  "name": "toolbox",
  "version": "0.2.0",
  "private": true,
  "tags": ["utils", "web", "react"],
  "users": [
    { "id": 3, "name": "Grace", "role": "moderator" },
    { "id": 1, "name": "Ada", "role": "admin" },
    { "id": 2, "name": "Linus", "role": "user" }
  ],
  "license": "MIT"
}`

const TYPE_STYLES: Record<ChangeType, string> = {
  added: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30',
  removed: 'bg-rose-500/10 text-rose-400 border-rose-500/30',
  changed: 'bg-amber-500/10 text-amber-400 border-amber-500/30',
  moved: 'bg-sky-500/10 text-sky-400 border-sky-500/30',
}

const TYPE_SIGNS: Record<ChangeType, string> = {
  added: '+',
  removed: '-',
  changed: '~',
  moved: '→',
}

const formatValue = (value: unknown): string => {
  if (value === undefined) return 'undefined'
  return JSON.stringify(value, null, 2)
}

export default function JsonDiff() {
  const [left, setLeft] = useState(SAMPLE_OLD)
  const [right, setRight] = useState(SAMPLE_NEW)
  const [compared, setCompared] = useState<{ left: string; right: string } | null>(
    null,
  )

  const error = useMemo(() => {
    if (!compared) return null
    const parse = (text: string, label: string) => {
      try {
        return { value: JSON.parse(text) as unknown, error: null as string | null }
      } catch (err) {
        return {
          value: undefined,
          error: `${label}: ${err instanceof Error ? err.message : 'invalid JSON'}`,
        }
      }
    }
    const a = parse(compared.left, 'Original')
    const b = parse(compared.right, 'Modified')
    return a.error ?? b.error
  }, [compared])

  const entries = useMemo<DiffEntry[]>(() => {
    if (!compared || error) return []
    const a = JSON.parse(compared.left) as unknown
    const b = JSON.parse(compared.right) as unknown
    return diffJson(a, b)
  }, [compared, error])

  const counts = useMemo(() => {
    const base: Record<ChangeType, number> = {
      added: 0,
      removed: 0,
      changed: 0,
      moved: 0,
    }
    for (const entry of entries) base[entry.type]++
    return base
  }, [entries])

  const compare = () => setCompared({ left, right })

  const clear = () => {
    setLeft('')
    setRight('')
    setCompared(null)
  }

  const loadSample = () => {
    setLeft(SAMPLE_OLD)
    setRight(SAMPLE_NEW)
    setCompared(null)
  }

  const swap = () => {
    setLeft(right)
    setRight(left)
    setCompared(null)
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <ToolHeader
        title="JSON Diff"
        description="Compare two JSON documents and highlight the differences."
      >
        <Button onClick={loadSample}>Sample</Button>
        <Button onClick={swap}>Swap</Button>
        <Button onClick={clear}>Clear</Button>
        <Button onClick={compare} variant="primary">
          Compare
        </Button>
      </ToolHeader>

      <div className="grid min-h-0 flex-1 grid-cols-1 gap-4 lg:grid-cols-2">
        <TextEditor
          label="Original"
          value={left}
          onChange={setLeft}
          accent="text-rose-400"
          placeholder="Paste JSON here..."
        />
        <TextEditor
          label="Modified"
          value={right}
          onChange={setRight}
          accent="text-emerald-400"
          placeholder="Paste JSON here..."
        />
      </div>

      <ResultPanel
        error={error}
        compared={!!compared}
        entries={entries}
        counts={counts}
      />
    </div>
  )
}

interface ResultPanelProps {
  compared: boolean
  error: string | null
  entries: DiffEntry[]
  counts: Record<ChangeType, number>
}

function ResultPanel({ compared, error, entries, counts }: ResultPanelProps) {
  return (
    <section className="window flex max-h-[45%] flex-col">
      <div className="title-bar">
        <span className="text-xs font-semibold">Result</span>
        {compared && !error && (
          <div className="flex gap-2 text-xs">
            <Badge type="added" count={counts.added} />
            <Badge type="removed" count={counts.removed} />
            <Badge type="changed" count={counts.changed} />
            <Badge type="moved" count={counts.moved} />
          </div>
        )}
      </div>

      <div className="min-h-24 flex-1 overflow-auto p-3">
        {!compared && (
          <p className="text-sm text-slate-500">
            Press <span className="text-slate-300">Compare</span> to see the diff.
          </p>
        )}
        {compared && error && (
          <p className="font-mono text-sm text-rose-400">{error}</p>
        )}
        {compared && !error && entries.length === 0 && (
          <p className="text-sm text-emerald-400">
            No differences found. The documents are identical.
          </p>
        )}
        {compared && !error && entries.length > 0 && (
          <ul className="flex flex-col gap-2">
            {entries.map((entry, index) => (
              <ChangeRow key={`${entry.path}-${index}`} entry={entry} />
            ))}
          </ul>
        )}
      </div>
    </section>
  )
}

function Badge({ type, count }: { type: ChangeType; count: number }) {
  return (
    <span
      className={`rounded border px-2 py-0.5 font-medium ${TYPE_STYLES[type]}`}
    >
      {TYPE_SIGNS[type]} {count} {type}
    </span>
  )
}

function ChangeRow({ entry }: { entry: DiffEntry }) {
  return (
    <li
      className={`rounded-md border px-3 py-2 font-mono text-xs ${TYPE_STYLES[entry.type]}`}
    >
      <div className="flex items-center gap-2">
        <span className="font-bold">{TYPE_SIGNS[entry.type]}</span>
        <span className="break-all text-slate-200">{entry.path}</span>
        {entry.type === 'moved' && (
          <span className="text-sky-300">
            [{entry.fromIndex}] → [{entry.toIndex}]
          </span>
        )}
      </div>
      {entry.type === 'moved' ? (
        <pre className="mt-1 whitespace-pre-wrap break-all pl-4 text-slate-300">
          {formatValue(entry.oldValue)}
        </pre>
      ) : (
        <div className="mt-1 grid gap-1 pl-4 text-slate-300">
          {entry.type !== 'added' && (
            <pre className="whitespace-pre-wrap break-all text-rose-300">
              - {formatValue(entry.oldValue)}
            </pre>
          )}
          {entry.type !== 'removed' && (
            <pre className="whitespace-pre-wrap break-all text-emerald-300">
              + {formatValue(entry.newValue)}
            </pre>
          )}
        </div>
      )}
    </li>
  )
}
