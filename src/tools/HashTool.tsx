import { useEffect, useState } from 'react'
import Button from '../components/Button'
import Panel from '../components/Panel'
import SplitPane from '../components/SplitPane'
import TextEditor from '../components/TextEditor'
import TitleBar from '../components/TitleBar'
import ToolHeader from '../components/ToolHeader'
import { HASH_ALGORITHMS, hashAll, type HashAlgorithm } from '../lib/hash'

const SAMPLE = 'The quick brown fox jumps over the lazy dog'

export default function HashTool() {
  const [input, setInput] = useState(SAMPLE)
  const [result, setResult] = useState<{
    input: string
    hashes: Record<HashAlgorithm, string>
  } | null>(null)

  useEffect(() => {
    if (input === '') return
    let cancelled = false
    hashAll(input).then((hashes) => {
      if (!cancelled) setResult({ input, hashes })
    })
    return () => {
      cancelled = true
    }
  }, [input])

  const hashes = result && result.input === input ? result.hashes : null

  return (
    <div className="flex h-full flex-col gap-4">
      <ToolHeader
        title="Hash Generator"
        description="Compute SHA-1, SHA-256, SHA-384 and SHA-512 digests of text."
      >
        <Button onClick={() => setInput(SAMPLE)}>Sample</Button>
        <Button onClick={() => setInput('')}>Clear</Button>
      </ToolHeader>

      <SplitPane id="hash">
        <TextEditor
          label="Input"
          value={input}
          onChange={setInput}
          placeholder="Type or paste text to hash..."
        />
        <div className="flex min-h-0 flex-col gap-4 overflow-y-auto">
          {hashes ? (
            HASH_ALGORITHMS.map((algorithm) => (
              <HashRow
                key={algorithm}
                algorithm={algorithm}
                value={hashes[algorithm]}
              />
            ))
          ) : (
            <p className="text-sm text-slate-500">
              Enter some text to compute its hashes.
            </p>
          )}
        </div>
      </SplitPane>
    </div>
  )
}

function HashRow({
  algorithm,
  value,
}: {
  algorithm: HashAlgorithm
  value: string
}) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Panel className="shrink-0">
      <TitleBar title={algorithm}>
        <Button size="sm" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </TitleBar>
      <pre className="overflow-x-auto whitespace-pre-wrap break-all p-3 text-xs leading-relaxed text-slate-200">
        {value}
      </pre>
    </Panel>
  )
}
