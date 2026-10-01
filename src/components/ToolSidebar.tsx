import { useMemo, useState } from 'react'
import { NavLink } from 'react-router-dom'
import { filterTools } from '../tools/registry'

const initials = (name: string): string =>
  name
    .split(/\s+/)
    .slice(0, 2)
    .map((word) => word[0]?.toUpperCase() ?? '')
    .join('')

export default function ToolSidebar() {
  const [collapsed, setCollapsed] = useState(false)
  const [query, setQuery] = useState('')

  const tools = useMemo(() => filterTools(query), [query])

  return (
    <aside
      className={`flex shrink-0 flex-col border-r border-slate-800 bg-slate-900/40 transition-[width] duration-200 ${
        collapsed ? 'w-12' : 'w-56'
      }`}
    >
      <div
        className={`flex min-h-12 items-center border-b border-slate-800 px-2 ${
          collapsed ? 'justify-center' : 'justify-between'
        }`}
      >
        {!collapsed && (
          <span className="text-xs font-semibold uppercase tracking-wide text-slate-500">
            Tools
          </span>
        )}
        <button
          type="button"
          onClick={() => setCollapsed((value) => !value)}
          aria-label={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          title={collapsed ? 'Expand sidebar' : 'Collapse sidebar'}
          className="flex h-7 w-7 items-center justify-center font-bold"
        >
          {collapsed ? '»' : '«'}
        </button>
      </div>

      {!collapsed && (
        <div className="border-b border-slate-800 p-2">
          <input
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search tools..."
            aria-label="Search tools"
            className="w-full px-2 py-1 text-xs outline-none"
          />
        </div>
      )}

      <nav className="flex min-h-0 flex-1 flex-col gap-1 overflow-y-auto p-2">
        {tools.length === 0 && (
          <p className="px-2 py-2 text-xs text-slate-500">No tools found</p>
        )}
        {tools.map((tool) => (
          <NavLink
            key={tool.id}
            to={`/tools/${tool.id}`}
            title={tool.name}
            className={({ isActive }) =>
              `nav-item px-2 py-2 text-sm ${
                isActive ? 'nav-item-active font-bold' : 'text-slate-300'
              }`
            }
          >
            {({ isActive }) =>
              collapsed ? (
                <span className="flex h-5 items-center justify-center font-semibold">
                  {initials(tool.name)}
                </span>
              ) : (
                <>
                  <span
                    className={`block ${isActive ? 'font-bold' : 'font-medium'}`}
                  >
                    {tool.name}
                  </span>
                  <span
                    className={`block truncate text-xs ${
                      isActive ? 'nav-desc' : 'text-slate-500'
                    }`}
                  >
                    {tool.description}
                  </span>
                </>
              )
            }
          </NavLink>
        ))}
      </nav>
    </aside>
  )
}
