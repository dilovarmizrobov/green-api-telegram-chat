import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { getStateInstance } from '../api/greenApi'
import type { Credentials } from '../types'
import { loadJson, removeItem, saveJson } from '../utils/storage'
import { AuthContext } from './authContext'

const STORAGE_KEY = 'greenapi:credentials'

const stateMessages: Record<string, string> = {
  notAuthorized: 'Инстанс не авторизован. Привяжите аккаунт Telegram в личном кабинете GREEN-API',
  blocked: 'Инстанс заблокирован',
  starting: 'Инстанс запускается, попробуйте через минуту',
  yellowCard: 'Отправка сообщений временно ограничена',
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [credentials, setCredentials] = useState<Credentials | null>(() => loadJson<Credentials>(STORAGE_KEY))

  const login = useCallback(async (next: Credentials) => {
    const { stateInstance } = await getStateInstance(next)
    if (stateInstance !== 'authorized') {
      throw new Error(stateMessages[stateInstance] ?? `Инстанс в состоянии «${stateInstance}»`)
    }
    saveJson(STORAGE_KEY, next)
    setCredentials(next)
  }, [])

  const logout = useCallback(() => {
    removeItem(STORAGE_KEY)
    setCredentials(null)
  }, [])

  const value = useMemo(() => ({ credentials, login, logout }), [credentials, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
