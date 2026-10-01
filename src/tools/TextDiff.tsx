import { useMemo, useState } from 'react'
import Button from '../components/Button'
import TextEditor from '../components/TextEditor'
import ToolHeader from '../components/ToolHeader'
import { diffText, type LineChangeType } from '../lib/textDiff'

const SAMPLE_OLD = `# Toolbox
A collection of small developer utilities.

## Included tools
- JSON diff (key-aware, detects moves)

## Roadmap
- Base64 encoder
`

const SAMPLE_NEW = `# Toolbox
A growing collection of small developer utilities.

## Included tools
- JSON diff (key-aware, detects moves)
- Text diff (line-based, Myers algorithm)

## Roadmap
- Base64 encoder
`

const ROW_STYLES: Record<LineChangeType, string> = {
  added: 'bg-emerald-500/10 text-emerald-300',
  removed: 'bg-rose-500/10 text-rose-300',
  equal: 'text-slate-400',
}

const TYPE_SIGNS: Record<LineChangeType, string> = {
  added: '+',
  removed: '-',
  equal: ' ',
}

export default function TextDiff() {
  const [left, setLeft] = useState(SAMPLE_OLD)
  const [right, setRight] = useState(SAMPLE_NEW)
  const [compared, setCompared] = useState<{ left: string; right: string } | null>(
    null,
  )
  const [showUnchanged, setShowUnchanged] = useState(true)

  const result = useMemo(
    () => (compared ? diffText(compared.left, compared.right) : null),
    [compared],
  )

  const visibleLines = useMemo(() => {
    if (!result) return []
    return showUnchanged
      ? result.lines
      : result.lines.filter((line) => line.type !== 'equal')
  }, [result, showUnchanged])

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
        title="Text Diff"
        description="Compare two blocks of text line by line."
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
          placeholder="Paste original text here..."
        />
        <TextEditor
          label="Modified"
          value={right}
          onChange={setRight}
          accent="text-emerald-400"
          placeholder="Paste modified text here..."
        />
      </div>

      <section className="window flex max-h-[45%] flex-col">
        <div className="title-bar">
          <span className="text-xs font-semibold">Result</span>
          {result && (
            <div className="flex gap-2 text-xs">
              <span className="border border-emerald-500/50 bg-emerald-500/10 px-2 py-0.5 font-medium text-emerald-400">
                + {result.added} added
              </span>
              <span className="border border-rose-500/50 bg-rose-500/10 px-2 py-0.5 font-medium text-rose-400">
                - {result.removed} removed
              </span>
            </div>
          )}
          <label className="ml-auto flex cursor-pointer items-center gap-2 text-xs text-slate-400">
            <input
              type="checkbox"
              checked={showUnchanged}
              onChange={(event) => setShowUnchanged(event.target.checked)}
            />
            Show unchanged
          </label>
        </div>

        <div className="min-h-24 flex-1 overflow-auto">
          {!compared && (
            <p className="p-3 text-sm text-slate-500">
              Press <span className="text-slate-300">Compare</span> to see the
              diff.
            </p>
          )}
          {compared && result && result.added + result.removed === 0 && (
            <p className="p-3 text-sm text-emerald-400">
              No differences found. The texts are identical.
            </p>
          )}
          {compared && result && result.added + result.removed > 0 && (
            <div className="min-w-max font-mono text-xs leading-5">
              {visibleLines.map((line, index) => (
                <div
                  key={index}
                  className={`grid grid-cols-[3.5rem_3.5rem_1.25rem_1fr] ${ROW_STYLES[line.type]}`}
                >
                  <span className="select-none border-r border-slate-800/60 px-2 text-right text-slate-600">
                    {line.oldLine ?? ''}
                  </span>
                  <span className="select-none border-r border-slate-800/60 px-2 text-right text-slate-600">
                    {line.newLine ?? ''}
                  </span>
                  <span className="select-none text-center font-bold">
                    {TYPE_SIGNS[line.type]}
                  </span>
                  <span className="whitespace-pre pr-4">
                    {line.value || '\u00a0'}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  )
}
