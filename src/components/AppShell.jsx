import { useAuth } from '../context/AuthContext'

export default function AppShell({ children }) {
  const { user, signOut } = useAuth()

  return (
    <div className="min-h-screen bg-gray-950 flex flex-col">

      {/* Header */}
      <header className="h-14 bg-gray-900 border-b border-gray-800 flex items-center
                         justify-between px-4 shrink-0 sticky top-0 z-40">
        {/* Logo */}
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 bg-violet-500 rounded-md flex items-center justify-center">
            <svg className="w-4 h-4 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
            </svg>
          </div>
          <span className="text-white font-semibold text-sm tracking-tight">TaskFlow</span>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <span className="text-gray-400 text-xs hidden sm:block truncate max-w-[180px]">
            {user?.email}
          </span>
          <button
            onClick={signOut}
            className="text-gray-400 hover:text-white text-xs border border-gray-700
                       hover:border-gray-500 rounded-lg px-3 py-1.5 transition-colors"
          >
            Sign out
          </button>
        </div>
      </header>

      {/* Main canvas — horizontal scroll for columns in Phase 3+ */}
      <main className="flex-1 overflow-x-auto overflow-y-hidden p-4">
        {children}
      </main>
    </div>
  )
}