import { useCallback, useEffect, useState } from 'react'
import { getSettings, setSettings } from '../api/greenApi'
import type { InstanceSettings } from '../api/types'
import type { Credentials } from '../types'

const REQUIRED_SETTINGS: InstanceSettings = {
  webhookUrl: '',
  incomingWebhook: 'yes',
  outgoingMessageWebhook: 'yes',
  outgoingAPIMessageWebhook: 'yes',
}

export type SettingsStatus = 'ok' | 'problem' | 'saving' | 'saved' | 'error'

function findProblems(settings: InstanceSettings): string[] {
  const problems: string[] = []
  if (settings.webhookUrl) problems.push('задан webhookUrl — уведомления уходят на него, а не в HTTP API')
  if (settings.incomingWebhook !== 'yes') problems.push('выключены уведомления о входящих сообщениях')
  if (settings.outgoingAPIMessageWebhook !== 'yes' || settings.outgoingMessageWebhook !== 'yes') {
    problems.push('выключены уведомления об исходящих сообщениях')
  }
  return problems
}

export function useInstanceSettings(credentials: Credentials) {
  const [status, setStatus] = useState<SettingsStatus>('ok')
  const [problems, setProblems] = useState<string[]>([])

  useEffect(() => {
    const controller = new AbortController()
    getSettings(credentials, controller.signal)
      .then((settings) => {
        console.info('[GREEN-API] settings', settings)
        const found = findProblems(settings)
        setProblems(found)
        setStatus(found.length ? 'problem' : 'ok')
      })
      .catch((error) => {
        if (!controller.signal.aborted) console.warn('[GREEN-API] getSettings failed', error)
      })
    return () => controller.abort()
  }, [credentials])

  const fix = useCallback(async () => {
    setStatus('saving')
    try {
      const { saveSettings } = await setSettings(credentials, REQUIRED_SETTINGS)
      setStatus(saveSettings ? 'saved' : 'error')
    } catch (error) {
      console.warn('[GREEN-API] setSettings failed', error)
      setStatus('error')
    }
  }, [credentials])

  return { status, problems, fix }
}
