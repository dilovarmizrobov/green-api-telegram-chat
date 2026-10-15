function safely(action: () => void) {
  try {
    action()
  } catch (error) {
    console.warn('localStorage недоступен', error)
  }
}

export function loadJson<T>(key: string): T | null {
  try {
    const raw = localStorage.getItem(key)
    return raw ? (JSON.parse(raw) as T) : null
  } catch {
    return null
  }
}

export function saveJson(key: string, value: unknown) {
  safely(() => localStorage.setItem(key, JSON.stringify(value)))
}

export function removeItem(key: string) {
  safely(() => localStorage.removeItem(key))
}
