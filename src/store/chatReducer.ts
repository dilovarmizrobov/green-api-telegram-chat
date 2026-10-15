import type { Chat, Message, MessageDirection } from '../types'
import { formatPhone } from '../utils/phone'

export interface ChatState {
  chats: Chat[]
  activeChatId: string | null
}

export interface IncomingPayload {
  tgChatId: string
  phone?: string
  name?: string
  direction: MessageDirection
  idMessage: string
  text: string
  timestamp: number
}

export type ChatAction =
  | { type: 'createChat'; phone: string }
  | { type: 'selectChat'; chatId: string | null }
  | { type: 'addOutgoing'; chatId: string; message: Message }
  | { type: 'retryMessage'; chatId: string; messageId: string }
  | { type: 'messageSent'; chatId: string; messageId: string; idMessage: string }
  | { type: 'messageFailed'; chatId: string; messageId: string; error: string }
  | { type: 'receiveMessage'; payload: IncomingPayload }
  | { type: 'apiMessageAck'; payload: IncomingPayload }

export const phoneChatKey = (phone: string) => `phone:${phone}`
const tgChatKey = (tgChatId: string) => `tg:${tgChatId}`

function findChat(chats: Chat[], { phone, tgChatId }: { phone?: string; tgChatId?: string }) {
  return chats.find(
    (chat) => (tgChatId && chat.tgChatId === tgChatId) || (phone && chat.phone === phone),
  )
}

function updateChat(state: ChatState, chatId: string, update: (chat: Chat) => Chat): ChatState {
  return { ...state, chats: state.chats.map((chat) => (chat.id === chatId ? update(chat) : chat)) }
}

function updateMessage(chat: Chat, messageId: string, update: (message: Message) => Message): Chat {
  return { ...chat, messages: chat.messages.map((m) => (m.id === messageId ? update(m) : m)) }
}

function applyIncoming(state: ChatState, payload: IncomingPayload): ChatState {
  const { tgChatId, phone, name, direction, idMessage, text, timestamp } = payload
  const existing = findChat(state.chats, { phone, tgChatId })

  if (existing?.messages.some((m) => m.idMessage === idMessage)) {
    return state
  }

  const message: Message = { id: idMessage, idMessage, text, direction, timestamp, status: 'sent' }

  if (!existing) {
    const chat: Chat = {
      id: phone ? phoneChatKey(phone) : tgChatKey(tgChatId),
      phone,
      tgChatId,
      name: name || (phone ? formatPhone(phone) : `Чат ${tgChatId}`),
      messages: [message],
      unread: direction === 'in' ? 1 : 0,
      updatedAt: timestamp,
    }
    return { ...state, chats: [chat, ...state.chats] }
  }

  const isActive = state.activeChatId === existing.id
  const hasDefaultName = existing.phone ? existing.name === formatPhone(existing.phone) : false

  return updateChat(state, existing.id, (chat) => ({
    ...chat,
    phone: chat.phone ?? phone,
    tgChatId: chat.tgChatId ?? tgChatId,
    name: hasDefaultName && name ? name : chat.name,
    messages: [...chat.messages, message].sort((a, b) => a.timestamp - b.timestamp),
    unread: direction === 'in' && !isActive ? chat.unread + 1 : chat.unread,
    updatedAt: Math.max(chat.updatedAt, timestamp),
  }))
}

export function chatReducer(state: ChatState, action: ChatAction): ChatState {
  switch (action.type) {
    case 'createChat': {
      const existing = findChat(state.chats, { phone: action.phone })
      if (existing) return { ...state, activeChatId: existing.id }

      const chat: Chat = {
        id: phoneChatKey(action.phone),
        phone: action.phone,
        name: formatPhone(action.phone),
        messages: [],
        unread: 0,
        updatedAt: Date.now(),
      }
      return { chats: [chat, ...state.chats], activeChatId: chat.id }
    }

    case 'selectChat': {
      const next = { ...state, activeChatId: action.chatId }
      return action.chatId ? updateChat(next, action.chatId, (chat) => ({ ...chat, unread: 0 })) : next
    }

    case 'addOutgoing':
      return updateChat(state, action.chatId, (chat) => ({
        ...chat,
        messages: [...chat.messages, action.message],
        updatedAt: action.message.timestamp,
      }))

    case 'retryMessage':
      return updateChat(state, action.chatId, (chat) =>
        updateMessage(chat, action.messageId, (m) => ({ ...m, status: 'sending', error: undefined })),
      )

    case 'messageSent':
      return updateChat(state, action.chatId, (chat) =>
        updateMessage(chat, action.messageId, (m) => ({ ...m, status: 'sent', idMessage: action.idMessage })),
      )

    case 'messageFailed':
      return updateChat(state, action.chatId, (chat) =>
        updateMessage(chat, action.messageId, (m) => ({ ...m, status: 'error', error: action.error })),
      )

    case 'receiveMessage':
      return applyIncoming(state, action.payload)

    case 'apiMessageAck': {
      const { idMessage, tgChatId, text } = action.payload
      const owner =
        state.chats.find((chat) => chat.messages.some((m) => m.idMessage === idMessage)) ??
        state.chats.find((chat) => chat.messages.some((m) => m.status === 'sending' && m.text === text))

      if (!owner) return applyIncoming(state, action.payload)

      return updateChat(state, owner.id, (chat) => ({ ...chat, tgChatId: chat.tgChatId ?? tgChatId }))
    }
  }
}

export function hydrateChats(chats: Chat[] | null): Chat[] {
  return (chats ?? []).map((chat) => ({
    ...chat,
    messages: chat.messages.map((m) =>
      m.status === 'sending' ? { ...m, status: 'error', error: 'Не отправлено' } : m,
    ),
  }))
}
