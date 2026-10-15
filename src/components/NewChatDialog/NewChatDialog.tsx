import { useEffect, useState, type FormEvent } from 'react'
import { useChats } from '../../store/chatContext'
import { normalizePhone } from '../../utils/phone'
import { CloseIcon } from '../icons'
import styles from './NewChatDialog.module.css'

export function NewChatDialog({ onClose }: { onClose: () => void }) {
  const { createChat } = useChats()
  const [value, setValue] = useState('')
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => event.key === 'Escape' && onClose()
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  function handleSubmit(event: FormEvent) {
    event.preventDefault()
    const phone = normalizePhone(value)
    if (!phone) {
      setError('Введите номер в международном формате, например +7 900 123-45-67')
      return
    }
    createChat(phone)
    onClose()
  }

  return (
    <div className={styles.backdrop} onMouseDown={onClose}>
      <form
        className={styles.dialog}
        role="dialog"
        aria-modal="true"
        aria-labelledby="new-chat-title"
        onMouseDown={(e) => e.stopPropagation()}
        onSubmit={handleSubmit}
        noValidate
      >
        <header className={styles.header}>
          <h3 id="new-chat-title" className={styles.title}>
            Новый чат
          </h3>
          <button className={styles.close} type="button" onClick={onClose} aria-label="Закрыть">
            <CloseIcon />
          </button>
        </header>

        <label className={styles.field}>
          <span className={styles.label}>Номер телефона получателя</span>
          <input
            className={styles.input}
            type="tel"
            inputMode="tel"
            placeholder="+7 900 123-45-67"
            value={value}
            onChange={(e) => {
              setValue(e.target.value)
              setError(null)
            }}
            autoFocus
          />
        </label>
        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}
        <p className={styles.hint}>Номер должен быть зарегистрирован в Telegram</p>

        <button className={styles.submit} type="submit" disabled={!value.trim()}>
          Создать чат
        </button>
      </form>
    </div>
  )
}
