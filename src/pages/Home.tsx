import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { TOOLS } from '../tools/registry'

export default function Home() {
  const [query, setQuery] = useState('')

  const results = useMemo(() => {
    const term = query.trim().toLowerCase()
    if (!term) return TOOLS
    return TOOLS.filter((tool) =>
      [tool.name, tool.description, ...tool.keywords]
        .join(' ')
        .toLowerCase()
        .includes(term),
    )
  }, [query])

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">
            toolbox
            <span className="cursor-blink ml-1 text-emerald-400">_</span>
          </h1>
          <p className="text-slate-400">
            <span className="text-emerald-400">$</span> a collection of small
            utilities for everyday development tasks.
          </p>
        </div>

        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="grep tools..."
            autoFocus
            className="w-full rounded-lg border border-slate-800 bg-slate-900/60 py-3 pl-4 pr-10 text-sm text-slate-100 outline-none transition placeholder:text-slate-600 focus:border-indigo-500"
          />
          <button
            type="button"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            aria-disabled={query === ''}
            className={`plain absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-base leading-none text-slate-500 ${
              query === '' ? 'opacity-40' : ''
            }`}
          >
            ×
          </button>
        </div>

        {results.length === 0 ? (
          <p className="text-sm text-slate-500">
            No tools match "<span className="text-slate-300">{query}</span>".
          </p>
        ) : (
          <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            {results.map((tool) => (
              <li key={tool.id}>
                <Link
                  to={`/tools/${tool.id}`}
                  className="window flex h-full flex-col transition hover:-translate-y-0.5"
                >
                  <div className="title-bar">
                    <span className="text-xs font-semibold">{tool.name}</span>
                  </div>
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <span className="text-sm text-slate-400">
                      {tool.description}
                    </span>
                    <span className="mt-auto flex flex-wrap gap-1 pt-3">
                      {tool.keywords.slice(0, 3).map((keyword) => (
                        <span
                          key={keyword}
                          className="border border-slate-800 px-1.5 py-0.5 text-xs text-slate-500"
                        >
                          {keyword}
                        </span>
                      ))}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  )
}
