export function normalizePhone(input: string): string | null {
  let digits = input.replace(/\D/g, '')

  if (digits.length === 11 && digits.startsWith('8')) digits = `7${digits.slice(1)}`
  if (digits.length === 10 && digits.startsWith('9')) digits = `7${digits}`

  return digits.length >= 10 && digits.length <= 15 ? digits : null
}

export function phoneToChatId(phone: string) {
  return `${phone}@c.us`
}

export function formatPhone(phone: string): string {
  const match = phone.match(/^7(\d{3})(\d{3})(\d{2})(\d{2})$/)
  return match ? `+7 ${match[1]} ${match[2]}-${match[3]}-${match[4]}` : `+${phone}`
}
