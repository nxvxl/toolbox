import { useMemo, useState } from 'react'
import Button from '../components/Button'
import ErrorNote from '../components/ErrorNote'
import Panel from '../components/Panel'
import SplitPane from '../components/SplitPane'
import TextEditor from '../components/TextEditor'
import TitleBar from '../components/TitleBar'
import ToolHeader from '../components/ToolHeader'
import {
  ENCODING_FORMATS,
  decodeValue,
  encodeValue,
  type EncodingFormat,
} from '../lib/encoding'

type Direction = 'encode' | 'decode'

const ENCODE_SAMPLE = 'toolbox · dev utilities — 100% client-side'
const DECODE_SAMPLES: Record<EncodingFormat, string> = {
  base64: 'dG9vbGJveCDCtyBkZXYgdXRpbGl0aWVzIOKAlCAxMDAlIGNsaWVudC1zaWRl',
  base64url:
    'dG9vbGJveCDCtyBkZXYgdXRpbGl0aWVzIOKAlCAxMDAlIGNsaWVudC1zaWRl',
  url: 'toolbox%20%C2%B7%20dev%20utilities%20%E2%80%94%20100%25%20client-side',
}

const sampleFor = (direction: Direction, format: EncodingFormat): string =>
  direction === 'encode' ? ENCODE_SAMPLE : DECODE_SAMPLES[format]

const isSample = (value: string): boolean =>
  value === ENCODE_SAMPLE || Object.values(DECODE_SAMPLES).includes(value)

export default function EncoderTool() {
  const [direction, setDirection] = useState<Direction>('encode')
  const [format, setFormat] = useState<EncodingFormat>('base64')
  const [input, setInput] = useState(ENCODE_SAMPLE)
  const [copied, setCopied] = useState(false)

  const result = useMemo<{ value: string; error: string | null }>(() => {
    if (input === '') return { value: '', error: null }
    try {
      const value =
        direction === 'encode'
          ? encodeValue(format, input)
          : decodeValue(format, input)
      return { value, error: null }
    } catch (error) {
      return {
        value: '',
        error: error instanceof Error ? error.message : 'Could not decode input.',
      }
    }
  }, [input, direction, format])

  const copy = async () => {
    await navigator.clipboard.writeText(result.value)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <div className="flex h-full flex-col gap-4">
      <ToolHeader
        title="Base64 & URL Encoder"
        description="Encode and decode Base64, Base64 URL-safe and URL components."
      >
        {(['encode', 'decode'] as Direction[]).map((value) => (
          <Button
            key={value}
            variant={direction === value ? 'primary' : 'ghost'}
            onClick={() => {
              setDirection(value)
              setInput((current) =>
                isSample(current) ? sampleFor(value, format) : current,
              )
              setCopied(false)
            }}
          >
            {value === 'encode' ? 'Encode' : 'Decode'}
          </Button>
        ))}
        <Button onClick={() => setInput(sampleFor(direction, format))}>
          Sample
        </Button>
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
          <label className="flex items-center gap-2 text-xs text-slate-400">
            Format
            <select
              value={format}
              onChange={(event) => {
                const next = event.target.value as EncodingFormat
                setFormat(next)
                setInput((current) =>
                  isSample(current) ? sampleFor(direction, next) : current,
                )
                setCopied(false)
              }}
              className="px-2 py-1"
            >
              {ENCODING_FORMATS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
        </TitleBar>
      </Panel>

      <SplitPane id="encoder">
        <TextEditor
          label={direction === 'encode' ? 'Plain text' : 'Encoded input'}
          value={input}
          onChange={(value) => {
            setInput(value)
            setCopied(false)
          }}
          placeholder={
            direction === 'encode'
              ? 'Type or paste text to encode...'
              : 'Paste Base64 or URL-encoded text...'
          }
        />
        <Panel className="flex min-h-0 flex-col">
          <TitleBar title={direction === 'encode' ? 'Encoded' : 'Decoded'}>
            {result.value && (
              <Button size="sm" onClick={copy}>
                {copied ? 'Copied' : 'Copy'}
              </Button>
            )}
          </TitleBar>
          <div className="min-h-0 flex-1 overflow-auto">
            {result.error ? (
              <div className="p-3">
                <ErrorNote>{result.error}</ErrorNote>
              </div>
            ) : result.value ? (
              <pre className="whitespace-pre-wrap break-all p-3 text-xs leading-relaxed text-slate-200">
                {result.value}
              </pre>
            ) : (
              <p className="p-3 text-sm text-slate-500">
                {direction === 'encode'
                  ? 'Enter text to encode it.'
                  : 'Enter encoded text to decode it.'}
              </p>
            )}
          </div>
        </Panel>
      </SplitPane>
    </div>
  )
}
