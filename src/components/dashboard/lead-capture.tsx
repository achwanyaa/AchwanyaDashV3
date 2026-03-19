'use client'
import { useState } from 'react'
import { buildWhatsAppUrl } from '@/lib/utils'

interface Props {
  tourId: string
  ownerId: string
  ownerPhone: string
  tourTitle: string
}

export default function LeadCapture({ tourId, ownerId, ownerPhone, tourTitle }: Props) {
  const [open, setOpen] = useState(false)
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')

    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId, ownerId, name, phone }),
      })
      if (!res.ok) throw new Error('Failed')
      setDone(true)
      setTimeout(() => {
        const msg = `Hi, I viewed the 3D tour for ${tourTitle} and I'm interested. My name is ${name}, number: ${phone}.`
        window.open(buildWhatsAppUrl(ownerPhone, msg), '_blank', 'noopener,noreferrer')
      }, 1200)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <>
      {/* Persistent tab */}
      {!open && (
        <button
          onClick={() => setOpen(true)}
          style={{
            position: 'absolute', bottom: '1.25rem', left: '50%', transform: 'translateX(-50%)',
            background: 'white', border: '1px solid #E5E3DF', borderRadius: '9999px',
            padding: '0.625rem 1.25rem', fontSize: '0.8rem', fontWeight: 600, color: '#1A1A1A',
            cursor: 'pointer', boxShadow: '0 4px 20px rgba(0,0,0,0.15)', whiteSpace: 'nowrap',
            display: 'flex', alignItems: 'center', gap: '0.5rem',
          }}>
          💬 Interested in this property?
        </button>
      )}

      {/* Bottom sheet */}
      {open && (
        <div style={{
          position: 'absolute', bottom: 0, left: 0, right: 0,
          background: 'white', borderRadius: '1rem 1rem 0 0',
          padding: '1.25rem', boxShadow: '0 -4px 30px rgba(0,0,0,0.15)',
        }}>
          {done ? (
            <div style={{ textAlign: 'center', padding: '1rem 0' }}>
              <div style={{ fontSize: '2rem', marginBottom: '0.5rem' }}>✅</div>
              <p style={{ fontWeight: 600, color: '#1A1A1A' }}>Request sent!</p>
              <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
                Opening WhatsApp now…
              </p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
                <div>
                  <p style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1A1A1A' }}>Interested in this property?</p>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280' }}>Leave your details — the agent will contact you</p>
                </div>
                <button onClick={() => setOpen(false)}
                  style={{ background: 'none', border: 'none', fontSize: '1.25rem', color: '#9CA3AF', cursor: 'pointer', lineHeight: 1 }}>
                  ×
                </button>
              </div>

              <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
                <input required className="input" placeholder="Your full name" value={name} onChange={e => setName(e.target.value)} />
                <input required className="input" type="tel" placeholder="WhatsApp number (e.g. 0712 345 678)" value={phone} onChange={e => setPhone(e.target.value)} />
                {error && <p style={{ color: '#EF4444', fontSize: '0.8rem' }}>{error}</p>}
                <button type="submit" disabled={loading}
                  style={{
                    width: '100%', padding: '0.75rem', background: '#25D366', color: 'white',
                    border: 'none', borderRadius: '0.75rem', fontSize: '0.875rem', fontWeight: 700,
                    cursor: loading ? 'not-allowed' : 'pointer', opacity: loading ? 0.6 : 1,
                    display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '0.5rem',
                  }}>
                  <WhatsAppIcon />
                  {loading ? 'Sending…' : 'Send via WhatsApp'}
                </button>
                <p style={{ textAlign: 'center', fontSize: '0.7rem', color: '#9CA3AF' }}>
                  Your number is shared only with this agent
                </p>
              </form>
            </>
          )}
        </div>
      )}
    </>
  )
}

function WhatsAppIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
    </svg>
  )
}
