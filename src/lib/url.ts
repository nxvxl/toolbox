export interface UrlParam {
  key: string
  value: string
}

export interface UrlParts {
  href: string
  origin: string
  protocol: string
  username: string
  password: string
  hostname: string
  port: string
  pathname: string
  hash: string
  params: UrlParam[]
}

export const parseUrl = (input: string): UrlParts => {
  const trimmed = input.trim()
  if (trimmed === '') throw new Error('Enter a URL to parse.')
  if (!/^[a-zA-Z][a-zA-Z\d+\-.]*:/.test(trimmed)) {
    throw new Error(
      'Enter an absolute URL including the protocol (for example https://example.com).',
    )
  }

  let url: URL
  try {
    url = new URL(trimmed)
  } catch {
    throw new Error('That does not look like a valid URL.')
  }

  return {
    href: url.href,
    origin: url.origin,
    protocol: url.protocol,
    username: url.username,
    password: url.password,
    hostname: url.hostname,
    port: url.port,
    pathname: url.pathname,
    hash: url.hash,
    params: Array.from(url.searchParams.entries()).map(([key, value]) => ({
      key,
      value,
    })),
  }
}

export const buildUrl = (parts: UrlParts, params: UrlParam[]): string => {
  const url = new URL(parts.href)
  const search = new URLSearchParams()
  for (const { key, value } of params) {
    if (key === '' && value === '') continue
    search.append(key, value)
  }
  url.search = search.toString()
  return url.href
}

export const sortParams = (params: UrlParam[]): UrlParam[] =>
  [...params].sort((a, b) => a.key.localeCompare(b.key))
