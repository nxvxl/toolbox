import { Link, Outlet } from 'react-router-dom'
import { TOOLS } from '../tools/registry'
import InstallButton from './InstallButton'

export default function Layout() {
  return (
    <div className="flex h-full flex-col text-slate-100">
      <header className="menu-bar flex shrink-0 items-center gap-4 px-5 py-2">
        <Link to="/" className="flex items-baseline gap-2">
          <span className="text-lg font-bold tracking-tight text-slate-100">
            Toolbox
          </span>
          <span className="text-xs text-slate-500">developer utilities</span>
        </Link>
        <nav className="ml-auto flex items-center gap-3 text-sm">
          <InstallButton />
          <Link
            to="/"
            className="px-2 py-1 text-slate-400 transition"
          >
            All tools
          </Link>
          <span className="border border-slate-800 px-2 py-0.5 text-xs text-slate-500">
            {TOOLS.length} tools
          </span>
        </nav>
      </header>
      <main className="min-h-0 flex-1 overflow-hidden">
        <Outlet />
      </main>
    </div>
  )
}
