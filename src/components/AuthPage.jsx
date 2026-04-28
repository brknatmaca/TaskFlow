import { useState } from 'react'
import { supabase } from '../lib/supabaseClient'

export default function AuthPage() {
  const [mode, setMode]       = useState('login')   // 'login' | 'signup'
  const [email, setEmail]     = useState('')
  const [password, setPassword] = useState('')
  const [error, setError]     = useState(null)
  const [info, setInfo]       = useState(null)
  const [loading, setLoading] = useState(false)

  const isLogin = mode === 'login'

  async function handleSubmit(e) {
    e.preventDefault()
    setError(null)
    setInfo(null)
    setLoading(true)

    try {
      if (isLogin) {
        const { error } = await supabase.auth.signInWithPassword({ email, password })
        if (error) throw error
        // AuthContext listener will update session automatically — no redirect needed
      } else {
        const { error } = await supabase.auth.signUp({ email, password })
        if (error) throw error
        setInfo('Check your email for a confirmation link.')
      }
    } catch (err) {
      setError(err.message)
    } finally {
      setLoading(false)
    }
  }

  function switchMode() {
    setMode(isLogin ? 'signup' : 'login')
    setError(null)
    setInfo(null)
  }

  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center p-4">
      <div className="w-full max-w-sm">

        {/* Logo / wordmark */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 mb-2">
            <div className="w-8 h-8 bg-violet-500 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
            </div>
            <span className="text-white text-xl font-semibold tracking-tight">TaskFlow</span>
          </div>
          <p className="text-gray-400 text-sm">
            {isLogin ? 'Welcome back' : 'Create your account'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-gray-900 border border-gray-800 rounded-2xl p-6 shadow-xl">
          <form onSubmit={handleSubmit} className="space-y-4">

            <div>
              <label className="block text-sm text-gray-300 mb-1.5" htmlFor="email">
                Email
              </label>
              <input
                id="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={e => setEmail(e.target.value)}
                placeholder="you@example.com"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg
                           px-3.5 py-2.5 text-sm placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                           transition"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-300 mb-1.5" htmlFor="password">
                Password
              </label>
              <input
                id="password"
                type="password"
                autoComplete={isLogin ? 'current-password' : 'new-password'}
                required
                minLength={6}
                value={password}
                onChange={e => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full bg-gray-800 border border-gray-700 text-white rounded-lg
                           px-3.5 py-2.5 text-sm placeholder-gray-500
                           focus:outline-none focus:ring-2 focus:ring-violet-500 focus:border-transparent
                           transition"
              />
            </div>

            {/* Feedback banners */}
            {error && (
              <div className="bg-red-950 border border-red-800 text-red-300 rounded-lg px-3.5 py-2.5 text-sm">
                {error}
              </div>
            )}
            {info && (
              <div className="bg-violet-950 border border-violet-800 text-violet-300 rounded-lg px-3.5 py-2.5 text-sm">
                {info}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-violet-600 hover:bg-violet-500 disabled:bg-violet-800
                         disabled:cursor-not-allowed text-white font-medium rounded-lg
                         py-2.5 text-sm transition-colors"
            >
              {loading ? 'Please wait…' : isLogin ? 'Log in' : 'Create account'}
            </button>
          </form>

          <div className="mt-5 text-center text-sm text-gray-500">
            {isLogin ? "Don't have an account?" : 'Already have an account?'}{' '}
            <button
              onClick={switchMode}
              className="text-violet-400 hover:text-violet-300 transition-colors font-medium"
            >
              {isLogin ? 'Sign up' : 'Log in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}