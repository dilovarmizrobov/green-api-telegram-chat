import { useState } from 'react'
import { useAuth } from '../../store/authContext'
import { useChats, type ConnectionStatus } from '../../store/chatContext'
import { ComposeIcon, LogoutIcon, SearchIcon } from '../icons'
import { NewChatDialog } from '../NewChatDialog/NewChatDialog'
import { ChatListItem } from './ChatListItem'
import { SettingsBanner } from './SettingsBanner'
import styles from './Sidebar.module.css'

const connectionLabels: Record<ConnectionStatus, string | null> = {
  online: null,
  offline: 'Нет связи с GREEN-API, переподключение…',
}

export function Sidebar() {
  const { credentials, logout } = useAuth()
  const { chats, activeChat, connection, selectChat } = useChats()
  const [query, setQuery] = useState('')
  const [dialogOpen, setDialogOpen] = useState(false)

  const normalizedQuery = query.trim().toLowerCase()
  const queryDigits = normalizedQuery.replace(/\D/g, '')
  const visibleChats = normalizedQuery
    ? chats.filter(
        (chat) =>
          chat.name.toLowerCase().includes(normalizedQuery) ||
          Boolean(queryDigits && chat.phone?.includes(queryDigits)),
      )
    : chats

  const statusLabel = connectionLabels[connection]

  return (
    <div className={styles.sidebar}>
      <header className={styles.header}>
        <div className={styles.titleBlock}>
          <h2 className={styles.title}>Чаты</h2>
          {statusLabel && (
            <span className={`${styles.status} ${connection === 'offline' ? styles.statusError : ''}`}>
              {statusLabel}
            </span>
          )}
        </div>
        <button className={styles.iconButton} type="button" title="Новый чат" onClick={() => setDialogOpen(true)}>
          <ComposeIcon />
        </button>
        <button
          className={`${styles.iconButton} ${styles.mobileOnly}`}
          type="button"
          title="Выйти"
          onClick={logout}
        >
          <LogoutIcon />
        </button>
      </header>

      {credentials && <SettingsBanner credentials={credentials} />}

      <label className={styles.search}>
        <SearchIcon className={styles.searchIcon} />
        <input
          className={styles.searchInput}
          type="search"
          placeholder="Поиск"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />
      </label>

      <ul className={styles.list}>
        {visibleChats.map((chat) => (
          <ChatListItem
            key={chat.id}
            chat={chat}
            active={chat.id === activeChat?.id}
            onSelect={() => selectChat(chat.id)}
          />
        ))}
      </ul>

      {chats.length === 0 && (
        <div className={styles.empty}>
          <p>Пока нет чатов</p>
          <button className={styles.emptyButton} type="button" onClick={() => setDialogOpen(true)}>
            Начать чат
          </button>
        </div>
      )}
      {chats.length > 0 && visibleChats.length === 0 && <p className={styles.nothing}>Ничего не найдено</p>}

      {dialogOpen && <NewChatDialog onClose={() => setDialogOpen(false)} />}
    </div>
  )
}
