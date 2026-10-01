import { useMemo, useState } from 'react'
import Button from '../components/Button'
import ErrorNote from '../components/ErrorNote'
import Panel from '../components/Panel'
import SplitPane from '../components/SplitPane'
import TextEditor from '../components/TextEditor'
import TitleBar from '../components/TitleBar'
import ToolHeader from '../components/ToolHeader'
import {
  byteLength,
  formatJson,
  indentValue,
  minifyJson,
  parseJson,
  type IndentOption,
} from '../lib/jsonFormat'

const SAMPLE = `{"name":"toolbox","version":"0.1.0","private":true,"tags":["utils","web"],"config":{"theme":"dark","retries":3,"timeout":null},"contributors":[{"name":"Ada","commits":42},{"name":"Grace","commits":17}]}`

type Mode = 'format' | 'minify'

export default function JsonFormatter() {
  const [input, setInput] = useState(SAMPLE)
  const [indent, setIndent] = useState<IndentOption>('2')
  const [sortKeys, setSortKeys] = useState(false)
  const [mode, setMode] = useState<Mode>('format')
  const [copied, setCopied] = useState(false)

  const parsed = useMemo(() => parseJson(input), [input])

  const output = useMemo(() => {
    if (parsed.error || input.trim() === '') return ''
    try {
      return mode === 'minify'
        ? minifyJson(parsed.value)
        : formatJson(parsed.value, indentValue(indent), sortKeys)
    } catch {
      return ''
    }
  }, [parsed, input, mode, indent, sortKeys])

  const copy = async () => {
    await navigator.clipboard.writeText(output)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <ToolHeader
        title="JSON Formatter"
        description="Beautify, minify and validate JSON."
      >
        <Button onClick={() => setInput(SAMPLE)}>Sample</Button>
        <Button
          onClick={() => {
            setInput('')
            setCopied(false)
          }}
        >
          Clear
        </Button>
      </ToolHeader>

      <Panel className="shrink-0">
        <TitleBar title="Options">
          <div className="flex gap-2">
            <Button
              size="sm"
              variant={mode === 'format' ? 'primary' : 'ghost'}
              onClick={() => setMode('format')}
            >
              Format
            </Button>
            <Button
              size="sm"
              variant={mode === 'minify' ? 'primary' : 'ghost'}
              onClick={() => setMode('minify')}
            >
              Minify
            </Button>
          </div>
        </TitleBar>
        <div className="flex flex-wrap items-center gap-5 p-3 text-xs">
          <label className="flex items-center gap-2 text-slate-400">
            Indent
            <select
              value={indent}
              onChange={(event) => setIndent(event.target.value as IndentOption)}
              className="px-2 py-1"
              disabled={mode === 'minify'}
            >
              <option value="2">2 spaces</option>
              <option value="4">4 spaces</option>
              <option value="tab">Tab</option>
            </select>
          </label>
          <label className="flex cursor-pointer items-center gap-2 text-slate-400">
            <input
              type="checkbox"
              checked={sortKeys}
              onChange={(event) => setSortKeys(event.target.checked)}
              disabled={mode === 'minify'}
            />
            Sort keys
          </label>
          {output && (
            <span className="text-slate-500">
              {byteLength(output)} bytes · {output.split('\n').length} lines
            </span>
          )}
        </div>
      </Panel>

      <SplitPane id="json-formatter">
        <TextEditor
          label="Input"
          value={input}
          onChange={setInput}
          placeholder="Paste JSON here..."
        />
        <Panel className="flex min-h-0 flex-col">
          <TitleBar title="Output">
            {output && (
              <Button size="sm" onClick={copy}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
            )}
          </TitleBar>
          <div className="min-h-0 flex-1 overflow-auto">
            {parsed.error ? (
              <div className="p-3">
                <ErrorNote>{parsed.error}</ErrorNote>
              </div>
            ) : output ? (
              <pre className="p-3 text-xs leading-relaxed text-slate-200">
                {output}
              </pre>
            ) : (
              <p className="p-3 text-sm text-slate-500">
                Enter some JSON to format it.
              </p>
            )}
          </div>
        </Panel>
      </SplitPane>
    </div>
  )
}
