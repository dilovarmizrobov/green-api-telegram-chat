import { ChatLayout } from './components/ChatLayout/ChatLayout'
import { LoginPage } from './components/LoginPage/LoginPage'
import { AuthProvider } from './store/AuthProvider'
import { useAuth } from './store/authContext'
import { ChatProvider } from './store/ChatProvider'

function Root() {
  const { credentials } = useAuth()

  if (!credentials) return <LoginPage />

  return (
    <ChatProvider key={credentials.idInstance} credentials={credentials}>
      <ChatLayout />
    </ChatProvider>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  )
}
