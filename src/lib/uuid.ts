export type UuidVersion = 'v4' | 'v7'

export interface UuidFormatOptions {
  uppercase: boolean
  hyphens: boolean
  braces: boolean
}

const toHex = (bytes: Uint8Array): string =>
  Array.from(bytes, (byte) => byte.toString(16).padStart(2, '0')).join('')

const assemble = (bytes: Uint8Array): string => {
  const value = toHex(bytes)
  return `${value.slice(0, 8)}-${value.slice(8, 12)}-${value.slice(12, 16)}-${value.slice(16, 20)}-${value.slice(20)}`
}

export const uuidV4 = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  bytes[6] = (bytes[6] & 0x0f) | 0x40
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  return assemble(bytes)
}

/** RFC 9562 version 7: a 48-bit Unix millisecond timestamp followed by randomness. */
export const uuidV7 = (): string => {
  const bytes = crypto.getRandomValues(new Uint8Array(16))
  const timestamp = Date.now()
  bytes[0] = Math.floor(timestamp / 2 ** 40) & 0xff
  bytes[1] = Math.floor(timestamp / 2 ** 32) & 0xff
  bytes[2] = Math.floor(timestamp / 2 ** 24) & 0xff
  bytes[3] = Math.floor(timestamp / 2 ** 16) & 0xff
  bytes[4] = Math.floor(timestamp / 2 ** 8) & 0xff
  bytes[5] = timestamp & 0xff
  bytes[6] = (bytes[6] & 0x0f) | 0x70
  bytes[8] = (bytes[8] & 0x3f) | 0x80
  return assemble(bytes)
}

export const createUuid = (version: UuidVersion): string =>
  version === 'v7' ? uuidV7() : uuidV4()

export const generateUuids = (version: UuidVersion, count: number): string[] => {
  const safe = Number.isFinite(count) ? Math.floor(count) : 1
  const length = Math.max(1, Math.min(1000, safe))
  return Array.from({ length }, () => createUuid(version))
}

export const formatUuid = (uuid: string, options: UuidFormatOptions): string => {
  let value = options.hyphens ? uuid : uuid.replace(/-/g, '')
  if (options.uppercase) value = value.toUpperCase()
  if (options.braces) value = `{${value}}`
  return value
}
