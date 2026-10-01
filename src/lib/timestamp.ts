export type TimestampUnit = 'seconds' | 'milliseconds'

export interface ParsedTimestamp {
  date: Date
  unit: TimestampUnit | null
  inputKind: 'unix' | 'date'
}

/** Values with a magnitude below this are treated as Unix seconds, not ms. */
const UNIX_SECONDS_MAX = 1e12

const UNIX_PATTERN = /^-?\d+(\.\d+)?$/

export const parseTimestamp = (input: string): ParsedTimestamp | null => {
  const value = input.trim()
  if (value === '') return null

  if (UNIX_PATTERN.test(value)) {
    const numeric = Number(value)
    if (!Number.isFinite(numeric)) return null
    const unit: TimestampUnit =
      Math.abs(numeric) < UNIX_SECONDS_MAX ? 'seconds' : 'milliseconds'
    const date = new Date(unit === 'seconds' ? numeric * 1000 : numeric)
    if (Number.isNaN(date.getTime())) return null
    return { date, unit, inputKind: 'unix' }
  }

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return { date, unit: null, inputKind: 'date' }
}

export const toUnixSeconds = (date: Date): number =>
  Math.floor(date.getTime() / 1000)

export const toUnixMilliseconds = (date: Date): number => date.getTime()

export const formatRelative = (
  date: Date,
  now: number = Date.now(),
): string => {
  const diff = date.getTime() - now
  const abs = Math.abs(diff)
  const formatter = new Intl.RelativeTimeFormat(undefined, { numeric: 'auto' })

  const units: Array<[Intl.RelativeTimeFormatUnit, number]> = [
    ['year', 31536000000],
    ['month', 2592000000],
    ['day', 86400000],
    ['hour', 3600000],
    ['minute', 60000],
    ['second', 1000],
  ]

  for (const [unit, size] of units) {
    if (abs >= size || unit === 'second') {
      return formatter.format(Math.round(diff / size), unit)
    }
  }
  return 'now'
}
