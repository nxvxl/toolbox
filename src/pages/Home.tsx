import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import PageTransition from '../components/PageTransition'
import SearchInput from '../components/SearchInput'
import TitleBar from '../components/TitleBar'
import { filterTools } from '../tools/registry'

export default function Home() {
  const [query, setQuery] = useState('')

  const results = useMemo(() => filterTools(query), [query])

  return (
    <PageTransition className="h-full overflow-auto">
      <div className="mx-auto flex max-w-4xl flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-slate-100">
            Toolbox
          </h1>
          <p className="text-slate-400">
            A collection of small utilities for everyday development tasks.
          </p>
        </div>

        <SearchInput
          value={query}
          onChange={setQuery}
          placeholder="Search tools..."
          ariaLabel="Search tools"
          autoFocus
          className="py-3 pl-4 pr-12 text-sm text-slate-100"
        />

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
                  className="window card flex h-full flex-col"
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
    </PageTransition>
  )
}
