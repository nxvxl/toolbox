import { useMemo, useState } from 'react'
import Badge from '../components/Badge'
import Button from '../components/Button'
import ErrorNote from '../components/ErrorNote'
import Panel from '../components/Panel'
import SplitPane from '../components/SplitPane'
import TextEditor from '../components/TextEditor'
import TitleBar from '../components/TitleBar'
import ToolHeader from '../components/ToolHeader'
import {
  JWT_ALGORITHMS,
  decodeJwt,
  signJwt,
  verifyJwt,
  type DecodedJwt,
  type JwtAlgorithm,
} from '../lib/jwt'

const SAMPLE_TOKEN = [
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9',
  'eyJzdWIiOiIxMjM0NTY3ODkwIiwibmFtZSI6IkpvaG4gRG9lIiwiaWF0IjoxNTE2MjM5MDIyfQ',
  'SflKxwRJSMeKKF2QT4fwpMeJf36POk6yJV_adQssw5c',
].join('.')

const SAMPLE_SECRET = 'your-256-bit-secret'

const SAMPLE_PAYLOAD = `{
  "sub": "1234567890",
  "name": "John Doe",
  "iat": 1516239022
}`

type Mode = 'decode' | 'encode'
type VerifyStatus = { ok: boolean; message: string } | null

const CLAIM_LABELS: Record<string, string> = {
  iat: 'Issued at',
  nbf: 'Not before',
  exp: 'Expires',
}

export default function JwtTool() {
  const [mode, setMode] = useState<Mode>('decode')

  return (
    <div className="flex h-full flex-col gap-4">
      <ToolHeader
        title="JWT"
        description="Decode, inspect, sign and verify JSON Web Tokens."
      >
        {(['decode', 'encode'] as Mode[]).map((value) => (
          <Button
            key={value}
            variant={mode === value ? 'primary' : 'ghost'}
            onClick={() => setMode(value)}
          >
            {value === 'decode' ? 'Decode' : 'Encode'}
          </Button>
        ))}
      </ToolHeader>

      {mode === 'decode' ? (
        <DecodeView onLoadEncode={() => setMode('encode')} />
      ) : (
        <EncodeView />
      )}
    </div>
  )
}

function DecodeView({ onLoadEncode }: { onLoadEncode: () => void }) {
  const [token, setToken] = useState(SAMPLE_TOKEN)
  const [secret, setSecret] = useState(SAMPLE_SECRET)
  const [alg, setAlg] = useState<JwtAlgorithm | 'auto'>('auto')
  const [status, setStatus] = useState<VerifyStatus>(null)

  const decoded = useMemo<{
    value: DecodedJwt | null
    error: string | null
  }>(() => {
    if (!token.trim()) return { value: null, error: null }
    try {
      return { value: decodeJwt(token), error: null }
    } catch (error) {
      return {
        value: null,
        error: error instanceof Error ? error.message : 'Invalid token.',
      }
    }
  }, [token])

  const update = (setter: () => void) => {
    setter()
    setStatus(null)
  }

  const verify = async () => {
    try {
      const ok = await verifyJwt(token, secret, alg === 'auto' ? undefined : alg)
      setStatus({
        ok,
        message: ok ? 'Signature verified' : 'Invalid signature',
      })
    } catch (error) {
      setStatus({
        ok: false,
        message: error instanceof Error ? error.message : 'Verification failed',
      })
    }
  }

  return (
    <SplitPane id="jwt-decode">
      <div className="flex min-h-0 flex-col gap-4">
        <TextEditor
          label="Encoded token"
          value={token}
          onChange={(value) => update(() => setToken(value))}
          placeholder="Paste a JWT..."
        />
        <Panel className="shrink-0">
          <TitleBar title="Verify signature">
            <select
              value={alg}
              onChange={(event) =>
                update(() => setAlg(event.target.value as JwtAlgorithm | 'auto'))
              }
              className="px-2 py-1 text-xs"
            >
              <option value="auto">
                auto ({String(decoded.value?.header.alg ?? 'unknown')})
              </option>
              {JWT_ALGORITHMS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </TitleBar>
          <div className="p-3">
            <textarea
              value={secret}
              onChange={(event) => update(() => setSecret(event.target.value))}
              spellCheck={false}
              placeholder="HMAC secret or PEM public key"
              className="h-20 w-full resize-none p-2 text-xs"
            />
            <div className="mt-2 flex items-center gap-3">
              <Button onClick={verify} variant="primary">
                Verify
              </Button>
              {status && (
                <span
                  className={`text-xs font-medium ${
                    status.ok ? 'text-emerald-700' : 'text-rose-700'
                  }`}
                >
                  {status.message}
                </span>
              )}
            </div>
          </div>
        </Panel>
      </div>

      <div className="flex min-h-0 flex-col gap-4 overflow-y-auto">
        {decoded.error && <ErrorNote>{decoded.error}</ErrorNote>}
        {decoded.value && (
          <>
            <JsonBlock label="Header">
              {JSON.stringify(decoded.value.header, null, 2)}
            </JsonBlock>
            <JsonBlock label="Payload">
              {JSON.stringify(decoded.value.payload, null, 2)}
            </JsonBlock>
            <Claims payload={decoded.value.payload} />
            <JsonBlock label="Signature">
              {decoded.value.signature}
            </JsonBlock>
          </>
        )}
        {!decoded.error && !decoded.value && (
          <p className="text-sm text-slate-500">
            Paste a token, or{' '}
            <button
              type="button"
              onClick={() => update(() => setToken(SAMPLE_TOKEN))}
              className="plain text-indigo-600 underline underline-offset-2"
            >
              load the sample
            </button>{' '}
            or{' '}
            <button
              type="button"
              onClick={onLoadEncode}
              className="plain text-indigo-600 underline underline-offset-2"
            >
              create your own
            </button>
            .
          </p>
        )}
      </div>
    </SplitPane>
  )
}

function Claims({ payload }: { payload: Record<string, unknown> }) {
  const claims = Object.keys(CLAIM_LABELS).filter(
    (name) => typeof payload[name] === 'number',
  )
  const [now] = useState(() => Date.now() / 1000)

  if (claims.length === 0) return null

  const exp = typeof payload.exp === 'number' ? payload.exp : null

  return (
    <Panel>
      <TitleBar title="Claims">
        {exp !== null && (
          <Badge tone={exp < now ? 'danger' : 'success'}>
            {exp < now ? 'expired' : 'valid'}
          </Badge>
        )}
      </TitleBar>
      <dl className="flex flex-col gap-1 p-3 text-xs">
        {claims.map((name) => (
          <div key={name} className="flex justify-between gap-4">
            <dt className="text-slate-500">
              {CLAIM_LABELS[name]} ({name})
            </dt>
            <dd className="text-slate-300">
              {new Date((payload[name] as number) * 1000).toLocaleString()}
            </dd>
          </div>
        ))}
      </dl>
    </Panel>
  )
}

function EncodeView() {
  const [header, setHeader] = useState('{\n  "alg": "HS256",\n  "typ": "JWT"\n}')
  const [payload, setPayload] = useState(SAMPLE_PAYLOAD)
  const [secret, setSecret] = useState(SAMPLE_SECRET)
  const [output, setOutput] = useState('')
  const [error, setError] = useState<string | null>(null)

  const reset = () => {
    setOutput('')
    setError(null)
  }

  const changeAlg = (alg: JwtAlgorithm) => {
    reset()
    try {
      const parsed = JSON.parse(header) as Record<string, unknown>
      parsed.alg = alg
      setHeader(JSON.stringify(parsed, null, 2))
    } catch {
      setHeader(JSON.stringify({ alg, typ: 'JWT' }, null, 2))
    }
  }

  const encode = async () => {
    reset()
    let parsedHeader: Record<string, unknown>
    let parsedPayload: Record<string, unknown>
    try {
      parsedHeader = JSON.parse(header)
    } catch {
      setError('Header is not valid JSON.')
      return
    }
    try {
      parsedPayload = JSON.parse(payload)
    } catch {
      setError('Payload is not valid JSON.')
      return
    }
    try {
      setOutput(await signJwt(parsedHeader, parsedPayload, secret))
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Could not sign the token.')
    }
  }

  return (
    <SplitPane id="jwt-encode">
      <div className="flex min-h-0 flex-col gap-4">
        <TextEditor
          label="Header"
          value={header}
          onChange={(value) => {
            reset()
            setHeader(value)
          }}
          placeholder="{ ... }"
        />
        <TextEditor
          label="Payload"
          value={payload}
          onChange={(value) => {
            reset()
            setPayload(value)
          }}
          placeholder="{ ... }"
        />
      </div>

      <div className="flex min-h-0 flex-col gap-4">
        <Panel className="shrink-0">
          <TitleBar title="Algorithm">
            <select
              defaultValue="HS256"
              onChange={(event) => changeAlg(event.target.value as JwtAlgorithm)}
              className="px-2 py-1 text-xs"
            >
              {JWT_ALGORITHMS.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </select>
          </TitleBar>
          <div className="p-3">
            <textarea
              value={secret}
              onChange={(event) => {
                reset()
                setSecret(event.target.value)
              }}
              spellCheck={false}
              placeholder="HMAC secret or PEM private key"
              className="h-20 w-full resize-none p-2 text-xs"
            />
            <div className="mt-2">
              <Button onClick={encode} variant="primary">
                Encode
              </Button>
            </div>
          </div>
        </Panel>

        {error && <ErrorNote>{error}</ErrorNote>}

        {output && <OutputPanel token={output} />}
      </div>
    </SplitPane>
  )
}

function OutputPanel({ token }: { token: string }) {
  const [copied, setCopied] = useState(false)

  const copy = async () => {
    await navigator.clipboard.writeText(token)
    setCopied(true)
    window.setTimeout(() => setCopied(false), 1500)
  }

  return (
    <Panel className="flex min-h-0 flex-col">
      <TitleBar title="Encoded token">
        <Button size="sm" onClick={copy}>
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </TitleBar>
      <pre className="flex-1 overflow-auto whitespace-pre-wrap break-all p-3 text-xs text-slate-200">
        {token}
      </pre>
    </Panel>
  )
}

function JsonBlock({ label, children }: { label: string; children: string }) {
  return (
    <Panel className="shrink-0">
      <TitleBar title={label} />
      <pre className="overflow-x-auto p-3 text-xs leading-relaxed text-slate-200">
        {children}
      </pre>
    </Panel>
  )
}
