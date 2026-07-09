import { Route, Routes } from 'react-router-dom'
import { AuthModalProvider } from './components/auth/AuthModal'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { LandingPage } from './pages/LandingPage'
import { AuthCallback } from './pages/AuthCallback'
import { Profile } from './pages/Profile'
import { Privacy } from './pages/Privacy'
import { Terms } from './pages/Terms'
import { Checkout } from './pages/Checkout'

export default function App() {
  return (
    <AuthModalProvider>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/auth/callback" element={<AuthCallback />} />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="/checkout" element={<Checkout />} />
        <Route path="/privacy" element={<Privacy />} />
        <Route path="/terms" element={<Terms />} />
        {/* Unknown routes fall back to the landing page. */}
        <Route path="*" element={<LandingPage />} />
      </Routes>
    </AuthModalProvider>
  )
}
