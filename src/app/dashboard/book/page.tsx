'use client'
import { useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

const PROPERTY_TYPES = ['Apartment', 'House', 'Villa', 'Townhouse', 'Office', 'Restaurant', 'Hotel', 'Showroom', 'Other']

export default function BookPage() {
  const supabase = createClient()
  const [form, setForm] = useState({ property_name: '', address: '', preferred_date: '', property_type: 'Apartment', bedrooms: '', notes: '' })
  const [loading, setLoading] = useState(false)
  const [done, setDone] = useState(false)
  const [error, setError] = useState('')

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const today = new Date().toISOString().split('T')[0]

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError('')
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) { setError('Not logged in'); setLoading(false); return }

    const { error: err } = await supabase.from('bookings').insert({
      owner_id: user.id,
      property_name: form.property_name,
      address: form.address,
      preferred_date: form.preferred_date,
      property_type: form.property_type,
      bedrooms: form.bedrooms ? parseInt(form.bedrooms) : null,
      notes: form.notes || null,
      status: 'requested',
    })

    setLoading(false)
    if (err) { setError(err.message); return }
    setDone(true)
  }

  if (done) {
    return (
      <div style={{ padding: '1.5rem', maxWidth: '500px', margin: '3rem auto', textAlign: 'center' }}>
        <div className="card" style={{ padding: '2.5rem' }}>
          <div style={{ fontSize: '3rem', marginBottom: '1rem' }}>✅</div>
          <h2 style={{ fontWeight: 700, fontSize: '1.25rem', color: '#1A1A1A', marginBottom: '0.5rem' }}>
            Request received!
          </h2>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            We&apos;ll confirm your shoot on WhatsApp within 2 hours.
          </p>
          <Link href="/dashboard"
            style={{ display: 'inline-block', padding: '0.625rem 1.25rem', background: '#D97706', color: 'white', borderRadius: '0.5rem', textDecoration: 'none', fontWeight: 600, fontSize: '0.875rem' }}>
            ← Back to Dashboard
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div style={{ padding: '1.5rem', maxWidth: '560px' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A' }}>Book a 3D Shoot</h1>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          We&apos;ll confirm your shoot date on WhatsApp within 2 hours.
        </p>
      </div>

      <div className="card" style={{ padding: '1.5rem' }}>
        <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
              Property name / listing title *
            </label>
            <input required className="input" placeholder="2BR Apartment — Westlands" value={form.property_name} onChange={set('property_name')} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
              Full address *
            </label>
            <input required className="input" placeholder="Parklands Road, Westlands, Nairobi" value={form.address} onChange={set('address')} />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                Property type *
              </label>
              <select required className="input" value={form.property_type} onChange={set('property_type')} style={{ cursor: 'pointer' }}>
                {PROPERTY_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
                Bedrooms
              </label>
              <input type="number" min="0" max="20" className="input" placeholder="3" value={form.bedrooms} onChange={set('bedrooms')} />
            </div>
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
              Preferred shoot date *
            </label>
            <input required type="date" className="input" min={today} value={form.preferred_date} onChange={set('preferred_date')} />
          </div>

          <div>
            <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, color: '#374151', marginBottom: '0.375rem' }}>
              Notes (optional)
            </label>
            <textarea className="input" rows={3} placeholder="Access code, contact on site, parking…" value={form.notes} onChange={set('notes')} style={{ resize: 'vertical' }} />
          </div>

          {error && <p style={{ color: '#EF4444', fontSize: '0.875rem' }}>{error}</p>}

          <button type="submit" disabled={loading} className="btn-primary" style={{ justifyContent: 'center', padding: '0.75rem' }}>
            {loading ? 'Submitting…' : '📅 Request Shoot'}
          </button>
        </form>
      </div>
    </div>
  )
}
