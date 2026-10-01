export type LineChangeType = 'equal' | 'added' | 'removed'

export interface DiffLine {
  type: LineChangeType
  value: string
  oldLine?: number
  newLine?: number
}

export interface TextDiffResult {
  lines: DiffLine[]
  added: number
  removed: number
}

type Operation = 'equal' | 'insert' | 'delete'

interface Op {
  type: Operation
  value: string
}

const splitLines = (text: string): string[] => (text === '' ? [] : text.split('\n'))

/**
 * Myers O(ND) diff over lines: computes the shortest edit script between two
 * sequences. Efficient when the inputs are mostly similar.
 */
function shortestEdit(a: string[], b: string[]): Op[] {
  const n = a.length
  const m = b.length
  const max = n + m
  const v = new Array<number>(2 * max + 1).fill(0)
  const trace: number[][] = []

  for (let d = 0; d <= max; d++) {
    trace.push(v.slice())
    for (let k = -d; k <= d; k += 2) {
      let x: number
      if (k === -d || (k !== d && v[max + k - 1] < v[max + k + 1])) {
        x = v[max + k + 1]
      } else {
        x = v[max + k - 1] + 1
      }
      let y = x - k
      while (x < n && y < m && a[x] === b[y]) {
        x++
        y++
      }
      v[max + k] = x
      if (x >= n && y >= m) {
        return backtrack(trace, a, b, max)
      }
    }
  }

  return backtrack(trace, a, b, max)
}

function backtrack(
  trace: number[][],
  a: string[],
  b: string[],
  max: number,
): Op[] {
  let x = a.length
  let y = b.length
  const ops: Op[] = []

  for (let d = trace.length - 1; d >= 0; d--) {
    const v = trace[d]
    const k = x - y
    let prevK: number
    if (k === -d || (k !== d && v[max + k - 1] < v[max + k + 1])) {
      prevK = k + 1
    } else {
      prevK = k - 1
    }

    const prevX = v[max + prevK]
    const prevY = prevX - prevK

    while (x > prevX && y > prevY) {
      ops.push({ type: 'equal', value: a[x - 1] })
      x--
      y--
    }

    if (d > 0) {
      if (x === prevX) {
        ops.push({ type: 'insert', value: b[y - 1] })
        y--
      } else {
        ops.push({ type: 'delete', value: a[x - 1] })
        x--
      }
    }

    x = prevX
    y = prevY
  }

  ops.reverse()
  return ops
}

export function diffText(oldText: string, newText: string): TextDiffResult {
  const ops = shortestEdit(splitLines(oldText), splitLines(newText))
  const lines: DiffLine[] = []
  let added = 0
  let removed = 0
  let oldLine = 1
  let newLine = 1

  for (const op of ops) {
    if (op.type === 'equal') {
      lines.push({ type: 'equal', value: op.value, oldLine: oldLine++, newLine: newLine++ })
    } else if (op.type === 'delete') {
      lines.push({ type: 'removed', value: op.value, oldLine: oldLine++ })
      removed++
    } else {
      lines.push({ type: 'added', value: op.value, newLine: newLine++ })
      added++
    }
  }

  return { lines, added, removed }
}
