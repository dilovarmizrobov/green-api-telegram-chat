import type { Credentials } from '../types'
import type {
  DeleteNotificationResponse,
  InstanceSettings,
  Notification,
  SendMessageResponse,
  SetSettingsResponse,
  StateInstanceResponse,
} from './types'

export class GreenApiError extends Error {
  readonly status: number

  constructor(status: number, message: string) {
    super(message)
    this.name = 'GreenApiError'
    this.status = status
  }
}

function describeStatus(status: number): string {
  switch (status) {
    case 400:
      return 'Некорректный запрос'
    case 401:
    case 403:
      return 'Неверный idInstance или apiTokenInstance'
    case 404:
      return 'Инстанс не найден. Проверьте apiUrl и idInstance'
    case 429:
      return 'Слишком много запросов, попробуйте позже'
    case 466:
      return 'Превышен лимит тарифа (на бесплатном тарифе ограничено число чатов)'
    default:
      return status >= 500 ? 'Сервер GREEN-API временно недоступен' : `Ошибка запроса (${status})`
  }
}

function buildUrl({ apiUrl, idInstance, apiTokenInstance }: Credentials, method: string, suffix = '') {
  const base = apiUrl.trim().replace(/\/+$/, '')
  return `${base}/waInstance${idInstance.trim()}/${method}/${apiTokenInstance.trim()}${suffix}`
}

const RATE_LIMIT_RETRIES = 3
const RATE_LIMIT_DELAY_MS = 1100

function delay(ms: number, signal?: AbortSignal | null) {
  return new Promise<void>((resolve, reject) => {
    const timer = setTimeout(resolve, ms)
    signal?.addEventListener('abort', () => {
      clearTimeout(timer)
      reject(new DOMException('Aborted', 'AbortError'))
    })
  })
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  let response: Response
  for (let attempt = 0; ; attempt++) {
    try {
      response = await fetch(url, init)
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') throw error
      throw new GreenApiError(0, 'Нет соединения с GREEN-API. Проверьте интернет и apiUrl')
    }
    if (response.status !== 429 || attempt >= RATE_LIMIT_RETRIES) break
    await delay(RATE_LIMIT_DELAY_MS * (attempt + 1), init?.signal)
  }

  if (!response.ok) {
    throw new GreenApiError(response.status, describeStatus(response.status))
  }

  const text = await response.text()
  return (text ? JSON.parse(text) : null) as T
}

export function getStateInstance(credentials: Credentials, signal?: AbortSignal) {
  return request<StateInstanceResponse>(buildUrl(credentials, 'getStateInstance'), { signal })
}

export function getSettings(credentials: Credentials, signal?: AbortSignal) {
  return request<InstanceSettings>(buildUrl(credentials, 'getSettings'), { signal })
}

export function setSettings(credentials: Credentials, settings: InstanceSettings) {
  return request<SetSettingsResponse>(buildUrl(credentials, 'setSettings'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(settings),
  })
}

export function sendMessage(credentials: Credentials, chatId: string, message: string) {
  return request<SendMessageResponse>(buildUrl(credentials, 'sendMessage'), {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ chatId, message }),
  })
}

export function receiveNotification(credentials: Credentials, receiveTimeout: number, signal?: AbortSignal) {
  return request<Notification | null>(
    buildUrl(credentials, 'receiveNotification', `?receiveTimeout=${receiveTimeout}`),
    { signal },
  )
}

export function deleteNotification(credentials: Credentials, receiptId: number, signal?: AbortSignal) {
  return request<DeleteNotificationResponse>(buildUrl(credentials, 'deleteNotification', `/${receiptId}`), {
    method: 'DELETE',
    signal,
  })
}
