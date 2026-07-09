import type { ReactNode } from 'react'
import { Navigate } from 'react-router-dom'
import { useSession } from '../../lib/useSession'

/** Gates a route behind an active session; sends signed-out users home. */
export function ProtectedRoute({ children }: { children: ReactNode }) {
  const { session, loading } = useSession()

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center text-muted">
        Loading…
      </div>
    )
  }

  if (!session) return <Navigate to="/" replace />

  return <>{children}</>
}
