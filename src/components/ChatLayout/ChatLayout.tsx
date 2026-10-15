import { useAuth } from '../../store/authContext'
import { useChats } from '../../store/chatContext'
import { ChatWindow } from '../ChatWindow/ChatWindow'
import { ChatsIcon, LogoutIcon } from '../icons'
import { Sidebar } from '../Sidebar/Sidebar'
import styles from './ChatLayout.module.css'

export function ChatLayout() {
  const { logout } = useAuth()
  const { activeChat, chats } = useChats()
  const unreadTotal = chats.reduce((sum, chat) => sum + chat.unread, 0)

  return (
    <div className={`${styles.layout} ${activeChat ? styles.chatOpen : ''}`}>
      <nav className={styles.rail} aria-label="Навигация">
        <button className={`${styles.railButton} ${styles.railButtonActive}`} type="button" title="Чаты">
          <ChatsIcon />
          {unreadTotal > 0 && <span className={styles.railBadge}>{unreadTotal > 99 ? '99+' : unreadTotal}</span>}
        </button>
        <button className={`${styles.railButton} ${styles.logout}`} type="button" title="Выйти" onClick={logout}>
          <LogoutIcon />
        </button>
      </nav>

      <aside className={styles.sidebar}>
        <Sidebar />
      </aside>

      <section className={styles.main}>
        {activeChat ? (
          <ChatWindow key={activeChat.id} chat={activeChat} />
        ) : (
          <div className={styles.placeholder}>
            <span>Выберите чат или создайте новый</span>
          </div>
        )}
      </section>
    </div>
  )
}
