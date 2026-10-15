import { useInstanceSettings } from '../../hooks/useInstanceSettings'
import type { Credentials } from '../../types'
import styles from './Sidebar.module.css'

export function SettingsBanner({ credentials }: { credentials: Credentials }) {
  const { status, problems, fix } = useInstanceSettings(credentials)

  if (status === 'ok') return null

  if (status === 'saved') {
    return (
      <div className={styles.banner}>
        Настройки сохранены. Инстанс перезапускается — входящие начнут приходить в течение ~5 минут.
      </div>
    )
  }

  return (
    <div className={`${styles.banner} ${styles.bannerWarning}`} role="alert">
      <p>Входящие сообщения не будут приходить: {problems.join('; ')}.</p>
      {status === 'error' && <p>Не удалось изменить настройки. Исправьте их в личном кабинете GREEN-API.</p>}
      <button className={styles.bannerButton} type="button" onClick={fix} disabled={status === 'saving'}>
        {status === 'saving' ? 'Сохраняем…' : 'Включить получение'}
      </button>
    </div>
  )
}
