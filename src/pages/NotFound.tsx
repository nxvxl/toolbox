import { useNavigate } from 'react-router-dom'
import Button from '../components/Button'
import PageTransition from '../components/PageTransition'

export default function NotFound() {
  const navigate = useNavigate()

  return (
    <PageTransition className="flex h-full flex-col items-center justify-center gap-4 text-center">
      <div>
        <p className="text-5xl font-bold text-slate-300">404</p>
        <p className="mt-2 text-slate-400">
          That tool doesn't exist (or hasn't been built yet).
        </p>
      </div>
      <Button variant="primary" onClick={() => navigate('/')}>
        Back to all tools
      </Button>
    </PageTransition>
  )
}
