import { useEffect, useRef } from 'react'
import { deleteNotification, receiveNotification } from '../api/greenApi'
import type { NotificationBody } from '../api/types'
import type { Credentials } from '../types'

const RECEIVE_TIMEOUT_SEC = 20
const RETRY_DELAY_MS = 5000

function wait(ms: number, signal: AbortSignal) {
  return new Promise<void>((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => {
      clearTimeout(timer)
      resolve()
    })
  })
}

interface PollingHandlers {
  onNotification: (body: NotificationBody) => void
  onStatusChange: (online: boolean) => void
}

export function useNotificationPolling(credentials: Credentials, handlers: PollingHandlers) {
  const handlersRef = useRef(handlers)
  useEffect(() => {
    handlersRef.current = handlers
  })

  useEffect(() => {
    const controller = new AbortController()
    const { signal } = controller

    async function poll() {
      while (!signal.aborted) {
        try {
          const notification = await receiveNotification(credentials, RECEIVE_TIMEOUT_SEC, signal)
          handlersRef.current.onStatusChange(true)
          if (!notification) continue

          try {
            handlersRef.current.onNotification(notification.body)
          } finally {
            await deleteNotification(credentials, notification.receiptId, signal)
          }
        } catch (error) {
          if (signal.aborted) return
          console.error('GREEN-API polling error', error)
          handlersRef.current.onStatusChange(false)
          await wait(RETRY_DELAY_MS, signal)
        }
      }
    }

    poll()
    return () => controller.abort()
  }, [credentials])
}
