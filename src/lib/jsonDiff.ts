export type ChangeType = 'added' | 'removed' | 'changed' | 'moved'

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
 * Longest common subsequence over deep equality. Returns the index pairs that
 * are kept in order, used to distinguish insertions/removals from reordering.
 */
function lcsMatches(a: unknown[], b: unknown[]): Array<[number, number]> {
  const n = a.length
  const m = b.length
  const dp: number[][] = Array.from({ length: n + 1 }, () =>
    new Array<number>(m + 1).fill(0),
  )

  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      dp[i][j] = deepEqual(a[i], b[j])
        ? dp[i + 1][j + 1] + 1
        : Math.max(dp[i + 1][j], dp[i][j + 1])
    }
  }

  const matches: Array<[number, number]> = []
  let i = 0
  let j = 0
  while (i < n && j < m) {
    if (deepEqual(a[i], b[j])) {
      matches.push([i, j])
      i++
      j++
    } else if (dp[i + 1][j] >= dp[i][j + 1]) {
      i++
    } else {
      j++
    }
  }

  return matches
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
 * Fallback for arrays without a usable identity key: keep the longest common
 * subsequence stable, then pair up the rest so pure reorders surface as moves
 * rather than a wall of add/remove noise.
 */
function diffArrayByLcs(
  oldArr: unknown[],
  newArr: unknown[],
  basePath: string,
): DiffEntry[] {
  const entries: DiffEntry[] = []
  const matchedOld = new Set<number>()
  const matchedNew = new Set<number>()

  for (const [i, j] of lcsMatches(oldArr, newArr)) {
    matchedOld.add(i)
    matchedNew.add(j)
  }

  const oldRemaining = oldArr
    .map((_, index) => index)
    .filter((index) => !matchedOld.has(index))
  const newRemaining = newArr
    .map((_, index) => index)
    .filter((index) => !matchedNew.has(index))

  const movedNew = new Set<number>()
  for (const oldIndex of oldRemaining) {
    const newIndex = newRemaining.find(
      (index) => !movedNew.has(index) && deepEqual(oldArr[oldIndex], newArr[index]),
    )
    if (newIndex === undefined) continue
    movedNew.add(newIndex)
    matchedOld.add(oldIndex)
    entries.push({
      path: keyFor(basePath, oldIndex),
      type: 'moved',
      oldValue: oldArr[oldIndex],
      newValue: newArr[newIndex],
      fromIndex: oldIndex,
      toIndex: newIndex,
    })
  }

  for (const index of oldRemaining) {
    if (matchedOld.has(index)) continue
    entries.push({
      path: keyFor(basePath, index),
      type: 'removed',
      oldValue: oldArr[index],
    })
  }

  for (const index of newRemaining) {
    if (movedNew.has(index)) continue
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
