import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div>
        <p className="text-5xl font-bold text-slate-700">404</p>
        <p className="mt-2 text-slate-400">
          That tool doesn't exist (or hasn't been built yet).
        </p>
      </div>
      <Link
        to="/"
        className="rounded-md bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500"
      >
        Back to all tools
      </Link>
    </div>
  )
}
