import { useCallback, useEffect, useMemo, useReducer, useRef, useState, type ReactNode } from 'react'
import { GreenApiError, sendMessage } from '../api/greenApi'
import type { NotificationBody } from '../api/types'
import { useNotificationPolling } from '../hooks/useNotificationPolling'
import type { Chat, Credentials, MessageDirection } from '../types'
import { phoneToChatId } from '../utils/phone'
import { loadJson, saveJson } from '../utils/storage'
import { ChatContext, type ConnectionStatus } from './chatContext'
import { chatReducer, hydrateChats, type ChatAction, type IncomingPayload } from './chatReducer'

function extractText(body: NotificationBody): string | null {
  const data = body.messageData
  switch (data?.typeMessage) {
    case 'textMessage':
      return data.textMessageData?.textMessage ?? null
    case 'extendedTextMessage':
    case 'quotedMessage':
      return data.extendedTextMessageData?.text ?? null
    default:
      return null
  }
}

const isGroupChat = (chatId: string) => chatId.startsWith('-') || chatId.endsWith('@g.us')

function toPayload(body: NotificationBody, direction: MessageDirection): IncomingPayload | null {
  const sender = body.senderData
  const text = extractText(body)
  if (!sender || !body.idMessage || text === null || isGroupChat(sender.chatId)) return null

  const isIncoming = direction === 'in'
  return {
    tgChatId: sender.chatId,
    phone: isIncoming && sender.senderPhoneNumber ? String(sender.senderPhoneNumber) : undefined,
    name: isIncoming ? sender.senderContactName || sender.senderName || sender.chatName : sender.chatName,
    direction,
    idMessage: body.idMessage,
    text,
    timestamp: body.timestamp * 1000,
  }
}

function notificationToAction(body: NotificationBody): ChatAction | null {
  switch (body.typeWebhook) {
    case 'incomingMessageReceived': {
      const payload = toPayload(body, 'in')
      return payload && { type: 'receiveMessage', payload }
    }
    case 'outgoingMessageReceived': {
      const payload = toPayload(body, 'out')
      return payload && { type: 'receiveMessage', payload }
    }
    case 'outgoingAPIMessageReceived': {
      const payload = toPayload(body, 'out')
      return payload && { type: 'apiMessageAck', payload }
    }
    default:
      return null
  }
}

function chatTarget(chat: Chat) {
  return chat.tgChatId ?? phoneToChatId(chat.phone!)
}

function errorText(error: unknown) {
  return error instanceof GreenApiError ? error.message : 'Не удалось отправить сообщение'
}

export function ChatProvider({ credentials, children }: { credentials: Credentials; children: ReactNode }) {
  const storageKey = `greenapi:chats:${credentials.idInstance}`

  const [state, dispatch] = useReducer(chatReducer, null, () => ({
    chats: hydrateChats(loadJson<Chat[]>(storageKey)),
    activeChatId: null,
  }))
  const [connection, setConnection] = useState<ConnectionStatus>('online')

  const stateRef = useRef(state)
  useEffect(() => {
    stateRef.current = state
    saveJson(storageKey, state.chats)
  }, [state, storageKey])

  useNotificationPolling(credentials, {
    onNotification: (body) => {
      const action = notificationToAction(body)
      console.info('[GREEN-API] notification', body.typeWebhook, action ? 'handled' : 'skipped', body)
      if (action) dispatch(action)
    },
    onStatusChange: (online) => setConnection(online ? 'online' : 'offline'),
  })

  const deliver = useCallback(
    async (chat: Chat, messageId: string, text: string) => {
      try {
        const { idMessage } = await sendMessage(credentials, chatTarget(chat), text)
        dispatch({ type: 'messageSent', chatId: chat.id, messageId, idMessage })
      } catch (error) {
        dispatch({ type: 'messageFailed', chatId: chat.id, messageId, error: errorText(error) })
      }
    },
    [credentials],
  )

  const sendText = useCallback(
    (chatId: string, text: string) => {
      const chat = stateRef.current.chats.find((c) => c.id === chatId)
      if (!chat) return

      const messageId = `local-${crypto.randomUUID()}`
      dispatch({
        type: 'addOutgoing',
        chatId,
        message: { id: messageId, text, direction: 'out', timestamp: Date.now(), status: 'sending' },
      })
      deliver(chat, messageId, text)
    },
    [deliver],
  )

  const retryMessage = useCallback(
    (chatId: string, messageId: string) => {
      const chat = stateRef.current.chats.find((c) => c.id === chatId)
      const message = chat?.messages.find((m) => m.id === messageId)
      if (!chat || !message) return

      dispatch({ type: 'retryMessage', chatId, messageId })
      deliver(chat, messageId, message.text)
    },
    [deliver],
  )

  const createChat = useCallback((phone: string) => dispatch({ type: 'createChat', phone }), [])
  const selectChat = useCallback((chatId: string | null) => dispatch({ type: 'selectChat', chatId }), [])

  const value = useMemo(() => {
    const chats = [...state.chats].sort((a, b) => b.updatedAt - a.updatedAt)
    return {
      chats,
      activeChat: chats.find((c) => c.id === state.activeChatId) ?? null,
      connection,
      createChat,
      selectChat,
      sendText,
      retryMessage,
    }
  }, [state, connection, createChat, selectChat, sendText, retryMessage])

  return <ChatContext.Provider value={value}>{children}</ChatContext.Provider>
}
