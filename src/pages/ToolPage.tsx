import { Link, useParams } from 'react-router-dom'
import ToolSidebar from '../components/ToolSidebar'
import { getTool } from '../tools/registry'
import NotFound from './NotFound'

export default function ToolPage() {
  const { toolId } = useParams()
  const tool = getTool(toolId)

  if (!tool) return <NotFound />

  const Tool = tool.component

  return (
    <div className="flex h-full">
      <ToolSidebar />
      <div className="flex min-w-0 flex-1 flex-col">
        <div className="menu-bar flex shrink-0 items-center gap-2 px-5 py-2">
          <Link
            to="/"
            className="text-sm text-slate-400 transition hover:text-emerald-400"
          >
            ← All tools
          </Link>
          <span className="text-slate-600">/</span>
          <span className="text-sm text-slate-300">{tool.name}</span>
        </div>
        <div className="min-h-0 flex-1 p-5">
          <Tool />
        </div>
      </div>
    </div>
  )
}
