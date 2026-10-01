export type HashAlgorithm = 'SHA-1' | 'SHA-256' | 'SHA-384' | 'SHA-512'

export const HASH_ALGORITHMS: HashAlgorithm[] = [
  'SHA-1',
  'SHA-256',
  'SHA-384',
  'SHA-512',
]

export const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

export const hashText = async (
  algorithm: HashAlgorithm,
  text: string,
): Promise<string> => {
  const digest = await crypto.subtle.digest(
    algorithm,
    new TextEncoder().encode(text),
  )
  return toHex(new Uint8Array(digest))
}

export const hashAll = async (
  text: string,
): Promise<Record<HashAlgorithm, string>> => {
  const entries = await Promise.all(
    HASH_ALGORITHMS.map(
      async (algorithm) => [algorithm, await hashText(algorithm, text)] as const,
    ),
  )
  return Object.fromEntries(entries) as Record<HashAlgorithm, string>
}
