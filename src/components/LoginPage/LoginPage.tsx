import { useState, type FormEvent } from 'react'
import { useAuth } from '../../store/authContext'
import { LogoIcon } from '../icons'
import styles from './LoginPage.module.css'

const API_URL_PLACEHOLDER = 'https://7103.api.green-api.com'

export function LoginPage() {
  const { login } = useAuth()
  const [idInstance, setIdInstance] = useState('')
  const [apiTokenInstance, setApiTokenInstance] = useState('')
  const [apiUrl, setApiUrl] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  const canSubmit = idInstance.trim() && apiTokenInstance.trim() && apiUrl.trim() && !loading

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    if (!canSubmit) return

    setLoading(true)
    setError(null)
    try {
      await login({ idInstance: idInstance.trim(), apiTokenInstance: apiTokenInstance.trim(), apiUrl: apiUrl.trim() })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Не удалось войти')
      setLoading(false)
    }
  }

  return (
    <main className={styles.page}>
      <form className={styles.card} onSubmit={handleSubmit} noValidate>
        <LogoIcon className={styles.logo} />
        <h1 className={styles.title}>Вход в чат</h1>
        <p className={styles.subtitle}>
          Введите данные инстанса из{' '}
          <a href="https://console.green-api.com" target="_blank" rel="noreferrer">
            личного кабинета GREEN-API
          </a>
        </p>

        <label className={styles.field}>
          <span className={styles.label}>idInstance</span>
          <input
            className={styles.input}
            value={idInstance}
            onChange={(e) => setIdInstance(e.target.value.replace(/\D/g, ''))}
            inputMode="numeric"
            autoComplete="username"
            placeholder="1101000001"
            autoFocus
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>apiTokenInstance</span>
          <input
            className={styles.input}
            type="password"
            value={apiTokenInstance}
            onChange={(e) => setApiTokenInstance(e.target.value)}
            autoComplete="current-password"
            placeholder="d75b3a66374942c5b3c019c698abc2067e151558acbd412345"
          />
        </label>

        <label className={styles.field}>
          <span className={styles.label}>apiUrl</span>
          <input
            className={styles.input}
            type="url"
            value={apiUrl}
            onChange={(e) => setApiUrl(e.target.value)}
            placeholder={API_URL_PLACEHOLDER}
          />
          <span className={styles.hint}>Скопируйте из личного кабинета GREEN-API — у каждого инстанса свой хост</span>
        </label>

        {error && (
          <p className={styles.error} role="alert">
            {error}
          </p>
        )}

        <button className={styles.submit} type="submit" disabled={!canSubmit}>
          {loading ? 'Проверяем…' : 'Войти'}
        </button>
      </form>
    </main>
  )
}
