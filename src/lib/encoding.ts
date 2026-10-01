export type EncodingFormat = 'base64' | 'base64url' | 'url'

export const ENCODING_FORMATS: { value: EncodingFormat; label: string }[] = [
  { value: 'base64', label: 'Base64' },
  { value: 'base64url', label: 'Base64 (URL-safe)' },
  { value: 'url', label: 'URL component' },
]

const BASE64_PATTERN = /^[A-Za-z0-9+/]*={0,2}$/
const BASE64URL_PATTERN = /^[A-Za-z0-9\-_]*={0,2}$/

const bytesToBinary = (bytes: Uint8Array<ArrayBuffer>): string => {
  let binary = ''
  const chunkSize = 0x8000
  for (let i = 0; i < bytes.length; i += chunkSize) {
    binary += String.fromCharCode(...bytes.subarray(i, i + chunkSize))
  }
  return binary
}

const toBase64Url = (base64: string): string =>
  base64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')

const fromBase64Url = (value: string): string =>
  value.replace(/-/g, '+').replace(/_/g, '/')

export const encodeBase64 = (text: string, urlSafe: boolean): string => {
  const base64 = btoa(bytesToBinary(new TextEncoder().encode(text)))
  return urlSafe ? toBase64Url(base64) : base64
}

export const decodeBase64 = (text: string, urlSafe: boolean): string => {
  const compact = text.replace(/\s+/g, '')
  const pattern = urlSafe ? BASE64URL_PATTERN : BASE64_PATTERN
  if (!pattern.test(compact)) {
    throw new Error('Input contains characters that are not valid Base64.')
  }

  const standard = urlSafe ? fromBase64Url(compact) : compact
  const padded = standard.padEnd(Math.ceil(standard.length / 4) * 4, '=')

  let binary: string
  try {
    binary = atob(padded)
  } catch {
    throw new Error('Input is not valid Base64.')
  }

  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  try {
    return new TextDecoder('utf-8', { fatal: true }).decode(bytes)
  } catch {
    throw new Error('Decoded bytes are not valid UTF-8 text.')
  }
}

export const encodeUrl = (text: string): string => encodeURIComponent(text)

export const decodeUrl = (text: string): string => {
  try {
    return decodeURIComponent(text)
  } catch {
    throw new Error('Input is not valid URL-encoded text.')
  }
}

export const encodeValue = (format: EncodingFormat, text: string): string => {
  if (format === 'url') return encodeUrl(text)
  return encodeBase64(text, format === 'base64url')
}

export const decodeValue = (format: EncodingFormat, text: string): string => {
  if (format === 'url') return decodeUrl(text)
  return decodeBase64(text, format === 'base64url')
}
