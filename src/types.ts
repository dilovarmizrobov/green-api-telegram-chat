export interface Credentials {
  apiUrl: string
  idInstance: string
  apiTokenInstance: string
}

export type MessageDirection = 'in' | 'out'
export type MessageStatus = 'sending' | 'sent' | 'error'

export interface Message {
  id: string
  idMessage?: string
  text: string
  direction: MessageDirection
  timestamp: number
  status: MessageStatus
  error?: string
}

export interface Chat {
  id: string
  phone?: string
  tgChatId?: string
  name: string
  messages: Message[]
  unread: number
  updatedAt: number
}
