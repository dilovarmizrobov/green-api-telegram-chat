import { useChats } from '../../store/chatContext'
import type { Chat } from '../../types'
import { formatPhone } from '../../utils/phone'
import { Avatar } from '../Avatar/Avatar'
import { BackIcon } from '../icons'
import styles from './ChatWindow.module.css'
import { MessageInput } from './MessageInput'
import { MessageList } from './MessageList'

export function ChatWindow({ chat }: { chat: Chat }) {
  const { selectChat, sendText, retryMessage } = useChats()
  const subtitle = chat.phone && chat.name !== formatPhone(chat.phone) ? formatPhone(chat.phone) : 'Telegram'

  return (
    <div className={styles.window}>
      <header className={styles.header}>
        <button className={styles.back} type="button" onClick={() => selectChat(null)} aria-label="Назад к чатам">
          <BackIcon />
        </button>
        <Avatar name={chat.name} seed={chat.id} size={40} />
        <div className={styles.headerText}>
          <h2 className={styles.name}>{chat.name}</h2>
          <span className={styles.subtitle}>{subtitle}</span>
        </div>
      </header>

      <MessageList messages={chat.messages} onRetry={(messageId) => retryMessage(chat.id, messageId)} />

      <MessageInput onSend={(text) => sendText(chat.id, text)} />
    </div>
  )
}
