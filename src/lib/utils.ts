export function relativeTime(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime()
  const mins = Math.floor(diff / 60000)
  const hours = Math.floor(diff / 3600000)
  const days = Math.floor(diff / 86400000)
  if (mins < 2) return 'Just now'
  if (mins < 60) return `${mins}m ago`
  if (hours < 24) return `${hours}h ago`
  if (days === 1) return 'Yesterday'
  return new Date(dateStr).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
}

export function maskPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return digits.slice(0, 4) + '••••'
}

export function cleanPhone(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  if (digits.startsWith('0')) return '254' + digits.slice(1)
  if (digits.startsWith('254')) return digits
  return '254' + digits
}

export function planLimit(planType: string): number {
  const limits: Record<string, number> = { basic: 3, pro: 6, premium: 12 }
  return limits[planType] ?? 3
}

export function planLabel(planType: string): string {
  const labels: Record<string, string> = { basic: 'Basic', pro: 'Pro', premium: 'Premium' }
  return labels[planType] ?? 'Basic'
}

export function industryLabel(industry: string): string {
  const labels: Record<string, string> = {
    real_estate: 'Real Estate',
    restaurant: 'Restaurant',
    automotive: 'Automotive',
    hotel: 'Hotel',
  }
  return labels[industry] ?? 'Real Estate'
}

export function industryColor(industry: string): string {
  const colors: Record<string, string> = {
    real_estate: 'bg-amber-50 text-amber-700',
    restaurant: 'bg-orange-50 text-orange-700',
    automotive: 'bg-blue-50 text-blue-700',
    hotel: 'bg-green-50 text-green-700',
  }
  return colors[industry] ?? 'bg-gray-100 text-gray-600'
}

export function buildWhatsAppUrl(phone: string, message: string): string {
  const clean = cleanPhone(phone)
  return `https://wa.me/${clean}?text=${encodeURIComponent(message)}`
}

export function greeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  return 'Good evening'
}
