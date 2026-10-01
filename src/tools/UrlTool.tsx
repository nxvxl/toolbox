import { useMemo, useState } from 'react'
import Button from '../components/Button'
import ErrorNote from '../components/ErrorNote'
import Panel from '../components/Panel'
import SplitPane from '../components/SplitPane'
import TitleBar from '../components/TitleBar'
import ToolHeader from '../components/ToolHeader'
import {
  buildUrl,
  parseUrl,
  sortParams,
  type UrlParam,
  type UrlParts,
} from '../lib/url'

const SAMPLE =
  'https://user:pass@api.example.com:8443/v1/search?q=opencode&tag=tools&tag=cli&page=2#results'

export default function UrlTool() {
  const [input, setInput] = useState(SAMPLE)
  const [edited, setEdited] = useState<{
    input: string
    params: UrlParam[]
  } | null>(null)
  const [copied, setCopied] = useState(false)

  const parsed = useMemo<{ parts: UrlParts | null; error: string | null }>(
    () => {
      if (input.trim() === '') return { parts: null, error: null }
      try {
        return { parts: parseUrl(input), error: null }
      } catch (error) {
        return {
          parts: null,
          error: error instanceof Error ? error.message : 'Invalid URL.',
        }
      }
    },
    [input],
  )

  const empty = input.trim() === ''
  const parts = parsed.parts
  const params = parts
    ? edited && edited.input === input
      ? edited.params
      : parts.params
    : []
  const rebuilt = parts ? buildUrl(parts, params) : ''

  const updateParams = (next: UrlParam[]) =>
    setEdited({ input, params: next })

  const copy = async () => {
    await navigator.clipboard.writeText(rebuilt)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <ToolHeader
        title="URL Parser"
        description="Break a URL into its parts and edit the query string."
      >
        <Button onClick={() => setInput(SAMPLE)}>Sample</Button>
        <Button
          onClick={() => {
            setInput('')
            setEdited(null)
          }}
        >
          Clear
        </Button>
      </ToolHeader>

      <SplitPane id="url-parser">
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto">
          <Panel className="shrink-0">
            <TitleBar title="URL" />
            <div className="p-3">
              <input
                value={input}
                onChange={(event) => setInput(event.target.value)}
                spellCheck={false}
                placeholder="https://example.com/path?key=value#hash"
                className="w-full px-3 py-2 font-mono text-sm"
              />
            </div>
          </Panel>

          {parts && (
            <Panel className="shrink-0">
              <TitleBar title="Components" />
              <dl className="divide-y divide-slate-700 text-xs">
                <Component label="Protocol" value={parts.protocol} />
                {parts.username && (
                  <Component label="Username" value={parts.username} />
                )}
                {parts.password && (
                  <Component label="Password" value={parts.password} />
                )}
                <Component label="Hostname" value={parts.hostname} />
                <Component label="Port" value={parts.port || '—'} />
                <Component label="Path" value={parts.pathname} />
                <Component label="Hash" value={parts.hash || '—'} />
                <Component label="Origin" value={parts.origin} />
              </dl>
            </Panel>
          )}
        </div>

        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto">
          {empty && (
            <p className="text-sm text-slate-500">
              Enter an absolute URL to parse it.
            </p>
          )}

          {parsed.error && <ErrorNote>{parsed.error}</ErrorNote>}

          {parts && (
            <>
              <Panel className="flex min-h-0 flex-col">
                <TitleBar title={`Query parameters (${params.length})`}>
                  <Button
                    size="sm"
                    onClick={() => updateParams(sortParams(params))}
                  >
                    Sort
                  </Button>
                  <Button
                    size="sm"
                    onClick={() =>
                      updateParams([...params, { key: '', value: '' }])
                    }
                  >
                    Add
                  </Button>
                </TitleBar>
                <div className="min-h-0 flex-1 overflow-auto p-3">
                  {params.length === 0 ? (
                    <p className="text-xs text-slate-500">
                      This URL has no query parameters.
                    </p>
                  ) : (
                    <div className="flex flex-col gap-2">
                      {params.map((param, index) => (
                        <div key={index} className="flex items-center gap-2">
                          <input
                            value={param.key}
                            onChange={(event) =>
                              updateParams(
                                params.map((item, i) =>
                                  i === index
                                    ? { ...item, key: event.target.value }
                                    : item,
                                ),
                              )
                            }
                            spellCheck={false}
                            placeholder="key"
                            className="min-w-0 flex-1 px-2 py-1 font-mono text-xs"
                          />
                          <span className="text-slate-500">=</span>
                          <input
                            value={param.value}
                            onChange={(event) =>
                              updateParams(
                                params.map((item, i) =>
                                  i === index
                                    ? { ...item, value: event.target.value }
                                    : item,
                                ),
                              )
                            }
                            spellCheck={false}
                            placeholder="value"
                            className="min-w-0 flex-[2] px-2 py-1 font-mono text-xs"
                          />
                          <Button
                            size="sm"
                            onClick={() =>
                              updateParams(
                                params.filter((_, i) => i !== index),
                              )
                            }
                          >
                            Remove
                          </Button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </Panel>

              <Panel className="flex min-h-0 flex-col">
                <TitleBar title="Rebuilt URL">
                  <Button size="sm" onClick={copy}>
                    {copied ? 'Copied' : 'Copy'}
                  </Button>
                </TitleBar>
                <pre className="min-h-0 flex-1 overflow-auto whitespace-pre-wrap break-all p-3 text-xs leading-relaxed text-slate-200">
                  {rebuilt}
                </pre>
              </Panel>
            </>
          )}
        </div>
      </SplitPane>
    </div>
  )
}

function Component({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center gap-3 px-3 py-2">
      <dt className="w-24 shrink-0 text-slate-500">{label}</dt>
      <dd className="min-w-0 flex-1 break-all font-mono text-slate-200">
        {value}
      </dd>
    </div>
  )
}
