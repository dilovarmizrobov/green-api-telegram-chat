import { Fragment, useLayoutEffect, useRef } from 'react'
import type { Message } from '../../types'
import { dayKey, formatDayLabel, formatTime } from '../../utils/format'
import { AlertIcon, CheckIcon, ClockIcon } from '../icons'
import styles from './ChatWindow.module.css'

interface MessageListProps {
  messages: Message[]
  onRetry: (messageId: string) => void
}

function StatusIcon({ message }: { message: Message }) {
  if (message.direction === 'in') return null
  if (message.status === 'sending') return <ClockIcon className={styles.statusIcon} aria-label="Отправляется" />
  if (message.status === 'sent') return <CheckIcon className={styles.statusIcon} aria-label="Отправлено" />
  return null
}

export function MessageList({ messages, onRetry }: MessageListProps) {
  const containerRef = useRef<HTMLDivElement>(null)

  useLayoutEffect(() => {
    const container = containerRef.current
    if (container) container.scrollTop = container.scrollHeight
  }, [messages.length])

  if (messages.length === 0) {
    return (
      <div className={styles.messages}>
        <div className={styles.emptyChat}>
          <p>Сообщений пока нет</p>
          <span>Напишите что-нибудь, чтобы начать переписку</span>
        </div>
      </div>
    )
  }

  return (
    <div className={styles.messages} ref={containerRef}>
      <div className={styles.messagesInner}>
        {messages.map((message, index) => {
          const previous = messages[index - 1]
          const showDay = !previous || dayKey(previous.timestamp) !== dayKey(message.timestamp)
          const isOut = message.direction === 'out'

          return (
            <Fragment key={message.id}>
              {showDay && (
                <div className={styles.day}>
                  <span>{formatDayLabel(message.timestamp)}</span>
                </div>
              )}
              <div className={`${styles.row} ${isOut ? styles.rowOut : ''}`}>
                <div className={`${styles.bubble} ${isOut ? styles.bubbleOut : styles.bubbleIn}`}>
                  <span className={styles.text}>{message.text}</span>
                  <span className={styles.meta}>
                    {formatTime(message.timestamp)}
                    <StatusIcon message={message} />
                  </span>
                </div>
                {message.status === 'error' && (
                  <button
                    className={styles.retry}
                    type="button"
                    onClick={() => onRetry(message.id)}
                    title={`${message.error ?? 'Ошибка отправки'}. Нажмите, чтобы повторить`}
                  >
                    <AlertIcon />
                  </button>
                )}
              </div>
              {message.status === 'error' && (
                <div className={styles.errorText}>
                  {message.error ?? 'Не отправлено'}
                  {' · '}
                  <button className={styles.retryLink} type="button" onClick={() => onRetry(message.id)}>
                    Повторить
                  </button>
                </div>
              )}
            </Fragment>
          )
        })}
      </div>
    </div>
  )
}
