import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import Button from '../components/Button'
import TitleBar from '../components/TitleBar'
import { filterTools } from '../tools/registry'

export default function Home() {
  const [query, setQuery] = useState('')

  const results = useMemo(() => filterTools(query), [query])

  return (
    <div className="h-full overflow-auto">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">
            Toolbox
          </h1>
          <p className="text-slate-400">
            A collection of small utilities for everyday development tasks.
          </p>
        </div>

        <div className="relative">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools..."
            autoFocus
            className="w-full py-3 pl-4 pr-12 text-sm text-slate-100 outline-none"
          />
          <Button
            size="sm"
            className="absolute right-2 top-1/2 -translate-y-1/2"
            onClick={() => setQuery('')}
            aria-label="Clear search"
            disabled={query === ''}
          >
            ×
          </Button>
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
                  <TitleBar title={tool.name} />
                  <div className="flex flex-1 flex-col gap-2 p-4">
                    <span className="text-sm text-slate-400">
                      {tool.description}
                    </span>
                    <span className="mt-auto flex flex-wrap gap-1 pt-3">
                      {tool.keywords.slice(0, 3).map((keyword) => (
                        <span
                          key={keyword}
                          className="rounded-md border border-slate-800 px-1.5 py-0.5 text-xs text-slate-500"
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
