import type { ComponentType } from 'react'
import JsonDiff from './JsonDiff'
import JsonFormatter from './JsonFormatter'
import JwtTool from './JwtTool'
import TextDiff from './TextDiff'

export interface Tool {
  id: string
  name: string
  description: string
  keywords: string[]
  component: ComponentType
}

export const TOOLS: Tool[] = [
  {
    id: 'json-formatter',
    name: 'JSON Formatter',
    description: 'Beautify, minify and validate JSON.',
    keywords: ['json', 'format', 'beautify', 'minify', 'validate', 'pretty'],
    component: JsonFormatter,
  },
  {
    id: 'json-diff',
    name: 'JSON Diff',
    description: 'Compare two JSON documents and highlight every change.',
    keywords: ['json', 'compare', 'diff', 'object', 'array'],
    component: JsonDiff,
  },
  {
    id: 'text-diff',
    name: 'Text Diff',
    description: 'Compare two blocks of text line by line.',
    keywords: ['text', 'compare', 'diff', 'lines', 'string'],
    component: TextDiff,
  },
  {
    id: 'jwt',
    name: 'JWT',
    description: 'Decode, inspect, sign and verify JSON Web Tokens.',
    keywords: ['jwt', 'token', 'encode', 'decode', 'auth', 'jose'],
    component: JwtTool,
  },
].sort((a, b) => a.name.localeCompare(b.name, 'en', { sensitivity: 'base' }))

export const getTool = (id: string | undefined): Tool | undefined =>
  TOOLS.find((tool) => tool.id === id)

export const filterTools = (query: string): Tool[] => {
  const term = query.trim().toLowerCase()
  if (!term) return TOOLS
  return TOOLS.filter((tool) =>
    [tool.name, tool.description, ...tool.keywords]
      .join(' ')
      .toLowerCase()
      .includes(term),
  )
}
