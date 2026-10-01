const WORDS = [
  'lorem', 'ipsum', 'dolor', 'sit', 'amet', 'consectetur', 'adipiscing',
  'elit', 'sed', 'do', 'eiusmod', 'tempor', 'incididunt', 'ut', 'labore',
  'et', 'dolore', 'magna', 'aliqua', 'enim', 'ad', 'minim', 'veniam',
  'quis', 'nostrud', 'exercitation', 'ullamco', 'laboris', 'nisi', 'aliquip',
  'ex', 'ea', 'commodo', 'consequat', 'duis', 'aute', 'irure', 'in',
  'reprehenderit', 'voluptate', 'velit', 'esse', 'cillum', 'eu', 'fugiat',
  'nulla', 'pariatur', 'excepteur', 'sint', 'occaecat', 'cupidatat', 'non',
  'proident', 'sunt', 'culpa', 'qui', 'officia', 'deserunt', 'mollit',
  'anim', 'id', 'est', 'laborum', 'at', 'vero', 'eos', 'accusamus',
  'iusto', 'odio', 'dignissimos', 'ducimus', 'blanditiis', 'praesentium',
  'voluptatum', 'deleniti', 'atque', 'corrupti', 'quos', 'quas', 'molestias',
  'excepturi', 'obcaecati', 'cupiditate', 'provident', 'similique', 'mollitia',
  'animi', 'laboriosam', 'nihil', 'molestiae', 'illum', 'fugit', 'quo',
  'voluptas', 'aspernatur', 'odit', 'fugiat', 'architecto', 'beatae',
]

export type LoremUnit = 'paragraphs' | 'sentences' | 'words'

export interface LoremOptions {
  unit: LoremUnit
  count: number
  startWithLorem: boolean
}

const randomInt = (max: number): number => Math.floor(Math.random() * max)

const pick = <T,>(items: T[]): T => items[randomInt(items.length)]

const capitalize = (text: string): string =>
  text.charAt(0).toUpperCase() + text.slice(1)

const randomWords = (count: number): string[] =>
  Array.from({ length: count }, () => pick(WORDS))

const sentence = (wordCount?: number): string => {
  const count = wordCount ?? randomInt(9) + 8
  return `${capitalize(randomWords(count).join(' '))}.`
}

const paragraph = (): string => {
  const count = randomInt(4) + 4
  return Array.from({ length: count }, () => sentence()).join(' ')
}

const LOREM_START = 'Lorem ipsum dolor sit amet, consectetur adipiscing elit'

export const generateLorem = (options: LoremOptions): string => {
  const safe = Number.isFinite(options.count) ? Math.floor(options.count) : 1
  const count = Math.max(1, Math.min(100, safe))

  if (options.unit === 'words') {
    const words = randomWords(count)
    if (options.startWithLorem) {
      return LOREM_START.split(' ').concat(words).join(' ')
    }
    return words.join(' ')
  }

  const make = options.unit === 'sentences' ? sentence : paragraph
  const blocks = Array.from({ length: count }, () => make())

  if (options.startWithLorem && blocks.length > 0) {
    const rest = blocks[0].replace(/^[^.]+\.\s*/, '')
    blocks[0] = rest ? `${LOREM_START}. ${rest}` : `${LOREM_START}.`
  }

  return blocks.join(options.unit === 'paragraphs' ? '\n\n' : ' ')
}
