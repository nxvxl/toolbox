export type ChangeType = 'added' | 'removed' | 'changed' | 'moved'

export const CHANGE_TYPES: ChangeType[] = [
  'added',
  'removed',
  'changed',
  'moved',
]

export interface DiffEntry {
  path: string
  type: ChangeType
  oldValue?: unknown
  newValue?: unknown
  fromIndex?: number
  toIndex?: number
}

const IDENTITY_KEYS = ['id', '_id', 'key', 'uuid', 'name', 'slug']

const isObject = (value: unknown): value is Record<string, unknown> =>
  typeof value === 'object' && value !== null && !Array.isArray(value)

const keyFor = (base: string, key: string | number): string => {
  if (typeof key === 'number') return `${base}[${key}]`
  if (base === '') return key
  return /^[A-Za-z_$][\w$]*$/.test(key) ? `${base}.${key}` : `${base}["${key}"]`
}

const elementPath = (base: string, key: string, value: unknown): string =>
  `${base}[${key}=${JSON.stringify(value)}]`

export function deepEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) return true

  if (Array.isArray(a) && Array.isArray(b)) {
    return a.length === b.length && a.every((item, i) => deepEqual(item, b[i]))
  }

  if (isObject(a) && isObject(b)) {
    const keys = Object.keys(a)
    if (keys.length !== Object.keys(b).length) return false
    return keys.every(
      (key) => Object.prototype.hasOwnProperty.call(b, key) && deepEqual(a[key], b[key]),
    )
  }

  return false
}

/**
 * Finds a property shared by every element of both arrays whose values are
 * unique within each array. This lets us match objects by identity instead of
 * by position, which is what you want when elements are reordered.
 */
function findIdentityKey(
  oldArr: unknown[],
  newArr: unknown[],
): string | null {
  if (oldArr.length === 0 || newArr.length === 0) return null
  if (!oldArr.every(isObject) || !newArr.every(isObject)) return null

  const candidates = Object.keys(oldArr[0] as Record<string, unknown>).filter(
    (key) => newArr.every((item) => Object.prototype.hasOwnProperty.call(item, key)),
  )

  const ordered = [
    ...IDENTITY_KEYS.filter((key) => candidates.includes(key)),
    ...candidates.filter((key) => !IDENTITY_KEYS.includes(key)),
  ]

  for (const key of ordered) {
    const oldValues = oldArr.map((item) => (item as Record<string, unknown>)[key])
    const newValues = newArr.map((item) => (item as Record<string, unknown>)[key])
    if (oldValues.some((value) => !isPrimitive(value))) continue
    const unique = (values: unknown[]) =>
      new Set(values.map((value) => JSON.stringify(value))).size === values.length
    if (unique(oldValues) && unique(newValues)) return key
  }

  return null
}

const isPrimitive = (value: unknown): boolean =>
  value === null || (typeof value !== 'object' && typeof value !== 'function')

/**
 * Order-independent string form of a value, used to pair equal elements in
 * near-linear time. Object keys are sorted so it agrees with `deepEqual`.
 */
function canonical(value: unknown): string {
  if (Array.isArray(value)) return `[${value.map(canonical).join(',')}]`
  if (value !== null && typeof value === 'object') {
    const entries = Object.keys(value as Record<string, unknown>)
      .sort()
      .map((key) => `${JSON.stringify(key)}:${canonical((value as Record<string, unknown>)[key])}`)
    return `{${entries.join(',')}}`
  }
  return JSON.stringify(value) ?? 'null'
}

/**
 * Indices of one longest strictly increasing subsequence of `sequence`
 * (patience sorting, O(n log n)).
 */
function lisIndices(sequence: number[]): number[] {
  const tails: number[] = []
  const tailIndex: number[] = []
  const previous = new Array<number>(sequence.length).fill(-1)

  for (let i = 0; i < sequence.length; i++) {
    const value = sequence[i]
    let lo = 0
    let hi = tails.length
    while (lo < hi) {
      const mid = (lo + hi) >> 1
      if (tails[mid] < value) lo = mid + 1
      else hi = mid
    }
    if (lo > 0) previous[i] = tailIndex[lo - 1]
    tails[lo] = value
    tailIndex[lo] = i
  }

  const result: number[] = []
  let cursor = tailIndex[tails.length - 1] ?? -1
  while (cursor !== -1) {
    result.push(cursor)
    cursor = previous[cursor]
  }
  return result.reverse()
}

/**
 * Positions (into `matched`) of elements that can stay put. Elements already at
 * the same index are always kept; the remaining ones are grouped between those
 * anchors and reduced by longest increasing subsequence. Anything not kept is a
 * move, which keeps moves minimal and avoids no-op moves.
 */
function keptPositions(
  matched: Array<{ oldIndex: number; newIndex: number }>,
): Set<number> {
  const kept = new Set<number>()
  let segmentStart = 0
  let lowerNew = -1

  const flush = (endExclusive: number, upperNew: number) => {
    const positions: number[] = []
    for (let position = segmentStart; position < endExclusive; position++) {
      const newIndex = matched[position].newIndex
      if (newIndex > lowerNew && newIndex < upperNew) positions.push(position)
    }
    const lis = lisIndices(positions.map((position) => matched[position].newIndex))
    for (const index of lis) kept.add(positions[index])
  }

  for (let position = 0; position < matched.length; position++) {
    const { oldIndex, newIndex } = matched[position]
    if (oldIndex === newIndex) {
      flush(position, newIndex)
      kept.add(position)
      lowerNew = newIndex
      segmentStart = position + 1
    }
  }
  flush(matched.length, Infinity)

  return kept
}

function diffObject(
  oldValue: Record<string, unknown>,
  newValue: Record<string, unknown>,
  basePath: string,
): DiffEntry[] {
  const entries: DiffEntry[] = []
  const keys = new Set([...Object.keys(oldValue), ...Object.keys(newValue)])

  for (const key of keys) {
    const hadKey = Object.prototype.hasOwnProperty.call(oldValue, key)
    const hasKey = Object.prototype.hasOwnProperty.call(newValue, key)
    const path = keyFor(basePath, key)

    if (hadKey && !hasKey) {
      entries.push({ path, type: 'removed', oldValue: oldValue[key] })
    } else if (!hadKey && hasKey) {
      entries.push({ path, type: 'added', newValue: newValue[key] })
    } else {
      entries.push(...diffJson(oldValue[key], newValue[key], path))
    }
  }

  return entries
}

/**
 * Matches objects by a shared identity key, so moved/updated elements are
 * reported precisely instead of every index lighting up as changed.
 */
function diffArrayByKey(
  oldArr: unknown[],
  newArr: unknown[],
  basePath: string,
  key: string,
): DiffEntry[] {
  const entries: DiffEntry[] = []
  const oldByKey = new Map<string, { index: number; value: unknown }>()
  const newByKey = new Map<string, { index: number; value: unknown }>()

  oldArr.forEach((value, index) =>
    oldByKey.set(
      JSON.stringify((value as Record<string, unknown>)[key]),
      { index, value },
    ),
  )
  newArr.forEach((value, index) =>
    newByKey.set(
      JSON.stringify((value as Record<string, unknown>)[key]),
      { index, value },
    ),
  )

  for (const [id, oldEntry] of oldByKey) {
    const path = elementPath(basePath, key, (oldEntry.value as Record<string, unknown>)[key])
    const newEntry = newByKey.get(id)

    if (!newEntry) {
      entries.push({ path, type: 'removed', oldValue: oldEntry.value })
      continue
    }

    if (oldEntry.index !== newEntry.index) {
      entries.push({
        path,
        type: 'moved',
        oldValue: oldEntry.value,
        newValue: newEntry.value,
        fromIndex: oldEntry.index,
        toIndex: newEntry.index,
      })
    }

    entries.push(...diffJson(oldEntry.value, newEntry.value, path))
  }

  for (const [id, newEntry] of newByKey) {
    if (oldByKey.has(id)) continue
    const path = elementPath(
      basePath,
      key,
      (newEntry.value as Record<string, unknown>)[key],
    )
    entries.push({ path, type: 'added', newValue: newEntry.value })
  }

  return entries
}

/**
 * Fallback for arrays without a usable identity key. Equal elements are paired
 * across the two arrays, then the longest in-order run of pairs is treated as
 * unmoved. Everything else that exists on both sides is a move, and the
 * leftovers are additions/removals.
 */
function diffArrayByLcs(
  oldArr: unknown[],
  newArr: unknown[],
  basePath: string,
): DiffEntry[] {
  const entries: DiffEntry[] = []

  const queues = new Map<string, number[]>()
  for (let j = 0; j < newArr.length; j++) {
    const key = canonical(newArr[j])
    const queue = queues.get(key)
    if (queue) queue.push(j)
    else queues.set(key, [j])
  }

  const cursors = new Map<string, number>()
  const matched: Array<{ oldIndex: number; newIndex: number; value: unknown }> = []

  for (let i = 0; i < oldArr.length; i++) {
    const key = canonical(oldArr[i])
    const queue = queues.get(key)
    if (!queue) continue
    const cursor = cursors.get(key) ?? 0
    if (cursor >= queue.length) continue
    cursors.set(key, cursor + 1)
    matched.push({ oldIndex: i, newIndex: queue[cursor], value: oldArr[i] })
  }

  const kept = keptPositions(matched)
  const matchedOld = new Set<number>()
  const matchedNew = new Set<number>()

  for (let position = 0; position < matched.length; position++) {
    const item = matched[position]
    matchedOld.add(item.oldIndex)
    matchedNew.add(item.newIndex)

    if (kept.has(position) || item.oldIndex === item.newIndex) continue
    entries.push({
      path: keyFor(basePath, item.oldIndex),
      type: 'moved',
      oldValue: item.value,
      newValue: item.value,
      fromIndex: item.oldIndex,
      toIndex: item.newIndex,
    })
  }

  for (let index = 0; index < oldArr.length; index++) {
    if (matchedOld.has(index)) continue
    entries.push({
      path: keyFor(basePath, index),
      type: 'removed',
      oldValue: oldArr[index],
    })
  }

  for (let index = 0; index < newArr.length; index++) {
    if (matchedNew.has(index)) continue
    entries.push({
      path: keyFor(basePath, index),
      type: 'added',
      newValue: newArr[index],
    })
  }

  return entries
}

function diffArray(
  oldArr: unknown[],
  newArr: unknown[],
  basePath: string,
): DiffEntry[] {
  const key = findIdentityKey(oldArr, newArr)
  return key
    ? diffArrayByKey(oldArr, newArr, basePath, key)
    : diffArrayByLcs(oldArr, newArr, basePath)
}

/**
 * Recursively compares two parsed JSON values and returns a flat list of
 * changes. Objects are compared by key; arrays by identity key when available,
 * otherwise by longest common subsequence so reorders are detected.
 */
export function diffJson(
  oldValue: unknown,
  newValue: unknown,
  basePath = '',
): DiffEntry[] {
  if (deepEqual(oldValue, newValue)) return []

  if (Array.isArray(oldValue) && Array.isArray(newValue)) {
    return diffArray(oldValue, newValue, basePath)
  }

  if (isObject(oldValue) && isObject(newValue)) {
    return diffObject(oldValue, newValue, basePath)
  }

  return [{ path: basePath || '$', type: 'changed', oldValue, newValue }]
}
