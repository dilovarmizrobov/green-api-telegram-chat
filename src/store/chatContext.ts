import { createContext, useContext } from 'react'
import type { Chat } from '../types'

export type ConnectionStatus = 'online' | 'offline'

export interface ChatContextValue {
  chats: Chat[]
  activeChat: Chat | null
  connection: ConnectionStatus
  createChat: (phone: string) => void
  selectChat: (chatId: string | null) => void
  sendText: (chatId: string, text: string) => void
  retryMessage: (chatId: string, messageId: string) => void
}

export const ChatContext = createContext<ChatContextValue | null>(null)

export function useChats() {
  const context = useContext(ChatContext)
  if (!context) throw new Error('useChats must be used within ChatProvider')
  return context
}
