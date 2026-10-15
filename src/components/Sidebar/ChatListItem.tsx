import type { Chat } from '../../types'
import { formatChatTime } from '../../utils/format'
import { Avatar } from '../Avatar/Avatar'
import { AlertIcon } from '../icons'
import styles from './Sidebar.module.css'

interface ChatListItemProps {
  chat: Chat
  active: boolean
  onSelect: () => void
}

export function ChatListItem({ chat, active, onSelect }: ChatListItemProps) {
  const last = chat.messages[chat.messages.length - 1]

  return (
    <li>
      <button
        className={`${styles.item} ${active ? styles.itemActive : ''}`}
        type="button"
        onClick={onSelect}
        aria-current={active ? 'true' : undefined}
      >
        <Avatar name={chat.name} seed={chat.id} />
        <div className={styles.itemBody}>
          <div className={styles.itemRow}>
            <span className={styles.itemName}>{chat.name}</span>
            <span className={styles.itemTime}>{formatChatTime(last?.timestamp ?? chat.updatedAt)}</span>
          </div>
          <div className={styles.itemRow}>
            <span className={styles.itemPreview}>
              {last ? (
                <>
                  {last.direction === 'out' && <span className={styles.itemYou}>Вы: </span>}
                  {last.text}
                </>
              ) : (
                'Нет сообщений'
              )}
            </span>
            {last?.status === 'error' && <AlertIcon className={styles.itemError} />}
            {chat.unread > 0 && <span className={styles.badge}>{chat.unread}</span>}
          </div>
        </div>
      </button>
    </li>
  )
}
