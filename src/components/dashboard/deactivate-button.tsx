'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useRouter } from 'next/navigation'

export default function DeactivateButton({ clientId }: { clientId: string }) {
  const supabase = createClient()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  async function handleDeactivate() {
    if (!confirm('Deactivate all tours for this client?')) return
    setLoading(true)
    await supabase.from('tours').update({ is_active: false }).eq('owner_id', clientId)
    setLoading(false)
    router.refresh()
  }

  return (
    <button onClick={handleDeactivate} disabled={loading}
      style={{ fontSize: '0.75rem', color: '#DC2626', background: 'none', border: 'none', cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.5 : 1, fontWeight: 500 }}>
      {loading ? '…' : 'Deactivate'}
    </button>
  )
}
