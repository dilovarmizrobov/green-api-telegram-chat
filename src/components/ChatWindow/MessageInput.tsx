import { useLayoutEffect, useRef, useState, type FormEvent, type KeyboardEvent } from 'react'
import { SendIcon } from '../icons'
import styles from './ChatWindow.module.css'

const MAX_LENGTH = 4096

export function MessageInput({ onSend }: { onSend: (text: string) => void }) {
  const [text, setText] = useState('')
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const trimmed = text.trim()

  useLayoutEffect(() => {
    const textarea = textareaRef.current
    if (!textarea) return
    textarea.style.height = 'auto'
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`
  }, [text])

  function submit(event?: FormEvent) {
    event?.preventDefault()
    if (!trimmed) return
    onSend(trimmed)
    setText('')
    textareaRef.current?.focus()
  }

  function handleKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      submit(event)
    }
  }

  return (
    <form className={styles.composer} onSubmit={submit}>
      <textarea
        ref={textareaRef}
        className={styles.textarea}
        rows={1}
        placeholder="Сообщение"
        value={text}
        maxLength={MAX_LENGTH}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={handleKeyDown}
        autoFocus
      />
      <button className={styles.send} type="submit" disabled={!trimmed} aria-label="Отправить">
        <SendIcon />
      </button>
    </form>
  )
}
