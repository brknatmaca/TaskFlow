import { useAuth } from './context/AuthContext'
import AuthPage from './components/AuthPage'
import AppShell from './components/AppShell'
import BoardView from './components/BoardView'

function LoadingScreen() {
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="w-6 h-6 border-2 border-violet-500 border-t-transparent
                      rounded-full animate-spin" />
    </div>
  )
}

export default function App() {
  const { session, isLoading } = useAuth()

  if (isLoading) return <LoadingScreen />
  if (!session)  return <AuthPage />

  return (
    <AppShell>
      <BoardView />
    </AppShell>
  )
}