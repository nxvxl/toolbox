import type { ComponentType } from 'react'
import EncoderTool from './EncoderTool'
import HashTool from './HashTool'
import JsonDiff from './JsonDiff'
import JsonFormatter from './JsonFormatter'
import JwtTool from './JwtTool'
import LoremTool from './LoremTool'
import TextDiff from './TextDiff'
import TimestampTool from './TimestampTool'
import UrlTool from './UrlTool'
import UuidTool from './UuidTool'

export interface Tool {
  id: string
  name: string
  description: string
  category: string
  keywords: string[]
  component: ComponentType
}

export const TOOLS: Tool[] = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Beautify, minify and validate JSON.',
    category: 'JSON',
    keywords: ['json', 'format', 'beautify', 'minify', 'validate', 'pretty'],
    component: JsonFormatter,
  },
  {
    id: 'json-diff',
    name: 'JSON Diff',
    description: 'Compare two JSON documents and highlight every change.',
    category: 'JSON',
    keywords: ['json', 'compare', 'diff', 'object', 'array'],
    component: JsonDiff,
  },
  {
    id: 'text-diff',
    name: 'Text Diff',
    description: 'Compare two blocks of text line by line.',
    category: 'Text',
    keywords: ['text', 'compare', 'diff', 'lines', 'string'],
    component: TextDiff,
  },
  {
    id: 'jwt',
    name: 'JWT',
    description: 'Decode, inspect, sign and verify JSON Web Tokens.',
    category: 'Security',
    keywords: ['jwt', 'token', 'encode', 'decode', 'auth', 'jose'],
    component: JwtTool,
  },
  {
    id: 'encoder',
    name: 'Base64 & URL Encoder',
    description: 'Encode and decode Base64, Base64 URL-safe and URL components.',
    category: 'Encoding',
    keywords: ['base64', 'url', 'encode', 'decode', 'uri', 'atob', 'btoa'],
    component: EncoderTool,
  },
  {
    id: 'hash',
    name: 'Hash Generator',
    description: 'Compute SHA-1, SHA-256, SHA-384 and SHA-512 digests.',
    category: 'Security',
    keywords: ['hash', 'sha', 'sha256', 'sha512', 'digest', 'checksum'],
    component: HashTool,
  },
  {
    id: 'timestamp',
    name: 'Unix Timestamp Converter',
    description: 'Convert between Unix epoch, ISO 8601 and local time.',
    category: 'Time',
    keywords: ['unix', 'timestamp', 'epoch', 'date', 'time', 'iso', 'convert'],
    component: TimestampTool,
  },
  {
    id: 'uuid',
    name: 'UUID Generator',
    description: 'Generate random (v4) and time-ordered (v7) UUIDs in bulk.',
    category: 'Generators',
    keywords: ['uuid', 'guid', 'v4', 'v7', 'random', 'id', 'generate'],
    component: UuidTool,
  },
  {
    id: 'url-parser',
    name: 'URL Parser',
    description: 'Break a URL into its parts and edit the query string.',
    category: 'Encoding',
    keywords: ['url', 'uri', 'parse', 'query', 'params', 'search', 'link'],
    component: UrlTool,
  },
  {
    id: 'lorem',
    name: 'Lorem Ipsum Generator',
    description: 'Generate placeholder text by paragraphs, sentences or words.',
    category: 'Generators',
    keywords: ['lorem', 'ipsum', 'placeholder', 'dummy', 'text', 'filler'],
    component: LoremTool,
  },
].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))

export const CATEGORIES: string[] = [
  ...new Set(TOOLS.map((tool) => tool.category)),
].sort((a, b) => a.localeCompare(b, 'en', { sensitivity: 'base' }))

export const getTool = (id: string | undefined): Tool | undefined =>
  TOOLS.find((tool) => tool.id === id)

export const filterTools = (
  query: string,
  category: string | null = null,
): Tool[] => {
  const term = query.trim().toLowerCase()
  return TOOLS.filter((tool) => {
    if (category && tool.category !== category) return false
    if (!term) return true
    return [tool.name, tool.description, tool.category, ...tool.keywords]
      .join(' ')
      .toLowerCase()
      .includes(term)
  })
}
