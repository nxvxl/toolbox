export type IndentOption = '2' | '4' | 'tab'

export interface ParseResult {
  value: unknown
  error: string | null
}

export const indentValue = (option: IndentOption): string | number =>
  option === 'tab' ? '\t' : Number(option)

export const sortValue = (value: unknown): unknown => {
  if (Array.isArray(value)) return value.map(sortValue)
  if (value !== null && typeof value === 'object') {
    const source = value as Record<string, unknown>
    const sorted: Record<string, unknown> = Object.create(null)
    for (const key of Object.keys(source).sort()) {
      sorted[key] = sortValue(source[key])
    }
    return sorted
  }
  return value
}

const locateError = (text: string, message: string): string => {
  const lineColumn = message.match(/\(line (\d+) column (\d+)\)/)
  if (lineColumn) {
    const clean = message.replace(/\s*\(line \d+ column \d+\)$/, '')
    return `Line ${lineColumn[1]}, column ${lineColumn[2]}: ${clean}`
  }

  const position = message.match(/position (\d+)/)
  if (position) {
    const offset = Number(position[1])
    const before = text.slice(0, offset)
    const line = before.split('\n').length
    const column = offset - before.lastIndexOf('\n')
    const clean = message.replace(/\s*at position \d+.*$/, '')
    return `Line ${line}, column ${column}: ${clean}`
  }

  return message
}

export const parseJson = (text: string): ParseResult => {
  if (text.trim() === '') return { value: undefined, error: null }
  try {
    return { value: JSON.parse(text) as unknown, error: null }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Invalid JSON'
    return { value: undefined, error: locateError(text, message) }
  }
}

export const formatJson = (
  value: unknown,
  indent: string | number,
  sortKeys: boolean,
): string => JSON.stringify(sortKeys ? sortValue(value) : value, null, indent)

export const minifyJson = (value: unknown): string => JSON.stringify(value)

export const byteLength = (text: string): number =>
  new TextEncoder().encode(text).length
