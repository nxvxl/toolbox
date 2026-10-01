export type JwtAlgorithm =
  | 'HS256'
  | 'HS384'
  | 'HS512'
  | 'RS256'
  | 'RS384'
  | 'RS512'
  | 'ES256'
  | 'ES384'
  | 'ES512'

export const JWT_ALGORITHMS: JwtAlgorithm[] = [
  'HS256',
  'HS384',
  'HS512',
  'RS256',
  'RS384',
  'RS512',
  'ES256',
  'ES384',
  'ES512',
]

export const isJwtAlgorithm = (value: unknown): value is JwtAlgorithm =>
  typeof value === 'string' && (JWT_ALGORITHMS as string[]).includes(value)

export const isHmac = (alg: JwtAlgorithm): boolean => alg.startsWith('HS')

const HASHES: Record<string, string> = {
  '256': 'SHA-256',
  '384': 'SHA-384',
  '512': 'SHA-512',
}

const CURVES: Record<string, string> = {
  ES256: 'P-256',
  ES384: 'P-384',
  ES512: 'P-521',
}

const hashFor = (alg: JwtAlgorithm): string => HASHES[alg.slice(-3)]

export function base64UrlEncode(input: Uint8Array | string): string {
  const bytes =
    typeof input === 'string' ? new TextEncoder().encode(input) : input
  let binary = ''
  for (const byte of bytes) binary += String.fromCharCode(byte)
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

export function base64UrlDecode(input: string): Uint8Array<ArrayBuffer> {
  const normalized = input.replace(/-/g, '+').replace(/_/g, '/')
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
  const binary = atob(padded)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes
}

export const base64UrlDecodeToString = (input: string): string =>
  new TextDecoder().decode(base64UrlDecode(input))

export interface DecodedJwt {
  header: Record<string, unknown>
  payload: Record<string, unknown>
  headerRaw: string
  payloadRaw: string
  signature: string
  signingInput: string
}

export const decodeJwt = (token: string): DecodedJwt => {
  const parts = token.trim().split('.')
  if (parts.length !== 3) {
    throw new Error('A JWT must have three parts separated by dots.')
  }

  const [headerB64, payloadB64, signature] = parts
  const headerRaw = base64UrlDecodeToString(headerB64)
  const payloadRaw = base64UrlDecodeToString(payloadB64)

  let header: Record<string, unknown>
  let payload: Record<string, unknown>
  try {
    header = JSON.parse(headerRaw)
  } catch {
    throw new Error('Header is not valid JSON.')
  }
  try {
    payload = JSON.parse(payloadRaw)
  } catch {
    throw new Error('Payload is not valid JSON.')
  }

  return {
    header,
    payload,
    headerRaw,
    payloadRaw,
    signature,
    signingInput: `${headerB64}.${payloadB64}`,
  }
}

const decodeBase64 = (base64: string): ArrayBuffer => {
  const binary = atob(base64)
  const bytes = new Uint8Array(binary.length)
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i)
  return bytes.buffer
}

const pemToBuffer = (pem: string): ArrayBuffer => {
  const base64 = pem
    .replace(/-----BEGIN [^-]+-----/, '')
    .replace(/-----END [^-]+-----/, '')
    .replace(/\s+/g, '')
  return decodeBase64(base64)
}

/** Best-effort decode of a PEM or bare (base64/base64url) key into DER bytes. */
const keyToBuffer = (key: string): ArrayBuffer | null => {
  try {
    if (/-----BEGIN [^-]+-----/.test(key)) return pemToBuffer(key)
    const normalized = key
      .replace(/\s+/g, '')
      .replace(/-/g, '+')
      .replace(/_/g, '/')
    if (normalized === '') return null
    const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, '=')
    return decodeBase64(padded)
  } catch {
    return null
  }
}

const ASYMMETRIC_ALGORITHMS: Array<
  RsaHashedImportParams | EcKeyImportParams | Algorithm
> = [
  { name: 'RSASSA-PKCS1-v1_5', hash: 'SHA-256' },
  { name: 'RSA-PSS', hash: 'SHA-256' },
  { name: 'ECDSA', namedCurve: 'P-256' },
  { name: 'ECDSA', namedCurve: 'P-384' },
  { name: 'ECDSA', namedCurve: 'P-521' },
  { name: 'Ed25519' },
]

/**
 * True when the supplied string is really an asymmetric key (PEM or bare DER),
 * regardless of encoding. Used to stop HMAC/`alg` confusion, where a token
 * header downgrades a public key into an HMAC secret.
 */
const isAsymmetricKey = async (key: string): Promise<boolean> => {
  const cleaned = key.replace(/\s+/g, '')
  if (cleaned.length < 32) return false
  const der = keyToBuffer(key)
  if (!der) return false

  for (const algorithm of ASYMMETRIC_ALGORITHMS) {
    try {
      await crypto.subtle.importKey('spki', der, algorithm, false, ['verify'])
      return true
    } catch {
      // try the next candidate
    }
  }
  return false
}

const importKey = async (
  alg: JwtAlgorithm,
  key: string,
  usage: 'sign' | 'verify',
): Promise<CryptoKey> => {
  const usages: KeyUsage[] = [usage]

  if (isHmac(alg)) {
    if (await isAsymmetricKey(key)) {
      throw new Error(
        'HMAC verification needs a shared secret, not an asymmetric key.',
      )
    }
    return crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(key),
      { name: 'HMAC', hash: hashFor(alg) },
      false,
      usages,
    )
  }

  const format = usage === 'sign' ? 'pkcs8' : 'spki'
  const data = pemToBuffer(key)

  if (alg.startsWith('RS')) {
    return crypto.subtle.importKey(
      format,
      data,
      { name: 'RSASSA-PKCS1-v1_5', hash: hashFor(alg) },
      false,
      usages,
    )
  }

  return crypto.subtle.importKey(
    format,
    data,
    { name: 'ECDSA', namedCurve: CURVES[alg] },
    false,
    usages,
  )
}

const signParams = (alg: JwtAlgorithm): AlgorithmIdentifier | EcdsaParams => {
  if (isHmac(alg)) return { name: 'HMAC' }
  if (alg.startsWith('RS')) return { name: 'RSASSA-PKCS1-v1_5' }
  return { name: 'ECDSA', hash: hashFor(alg) }
}

export async function signJwt(
  header: Record<string, unknown>,
  payload: Record<string, unknown>,
  key: string,
): Promise<string> {
  const alg = header.alg
  if (!isJwtAlgorithm(alg)) {
    throw new Error('Header must contain a supported "alg" value.')
  }

  const signingInput = `${base64UrlEncode(JSON.stringify(header))}.${base64UrlEncode(
    JSON.stringify(payload),
  )}`
  const cryptoKey = await importKey(alg, key, 'sign')
  const signature = await crypto.subtle.sign(
    signParams(alg),
    cryptoKey,
    new TextEncoder().encode(signingInput),
  )

  return `${signingInput}.${base64UrlEncode(new Uint8Array(signature))}`
}

export async function verifyJwt(
  token: string,
  key: string,
  algOverride?: JwtAlgorithm,
): Promise<boolean> {
  const { signature, signingInput, header } = decodeJwt(token)
  if (algOverride && header.alg !== algOverride) {
    throw new Error(
      `Token algorithm "${String(header.alg)}" does not match the selected algorithm "${algOverride}".`,
    )
  }
  const alg = algOverride ?? header.alg
  if (!isJwtAlgorithm(alg)) {
    throw new Error('Unsupported algorithm.')
  }

  const cryptoKey = await importKey(alg, key, 'verify')
  return crypto.subtle.verify(
    signParams(alg),
    cryptoKey,
    base64UrlDecode(signature),
    new TextEncoder().encode(signingInput),
  )
}
