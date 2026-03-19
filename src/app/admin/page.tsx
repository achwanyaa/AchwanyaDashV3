'use client'
import { useState, useEffect, useCallback } from 'react'
import { createClient } from '@/lib/supabase/client'
import { planLimit, buildWhatsAppUrl } from '@/lib/utils'

interface Client { id: string; full_name: string; plan_type: string }
interface Booking { id: string; property_name: string; address: string; preferred_date: string; property_type: string | null; bedrooms: number | null; notes: string | null; status: string; owner_id: string }

export const dynamic = 'force-dynamic'

export default function AdminPage() {
  const supabase = createClient()
  const [clients, setClients] = useState<Client[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [ownerPhones, setOwnerPhones] = useState<Record<string, string>>({})
  const [form, setForm] = useState({ owner_id: '', title: '', address: '', industry: 'real_estate', realsee_url: '', notes: '' })
  const [saving, setSaving] = useState(false)
  const [msg, setMsg] = useState<{ type: 'ok' | 'err'; text: string } | null>(null)

  const set = (k: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(p => ({ ...p, [k]: e.target.value }))

  const loadBookings = useCallback(async () => {
    const { data } = await supabase
      .from('bookings')
      .select('id, property_name, address, preferred_date, property_type, bedrooms, notes, status, owner_id')
      .eq('status', 'requested')
      .order('created_at', { ascending: false })
    setBookings(data ?? [])

    // Load phones for booking owners
    if (data && data.length > 0) {
      const ids = [...new Set(data.map(b => b.owner_id))]
      const { data: profiles } = await supabase.from('profiles').select('id, whatsapp_number').in('id', ids)
      const phoneMap: Record<string, string> = {}
      profiles?.forEach(p => { phoneMap[p.id] = p.whatsapp_number ?? '' })
      setOwnerPhones(phoneMap)
    }
  }, [supabase])

  useEffect(() => {
    supabase.from('profiles').select('id, full_name, plan_type').order('full_name')
      .then(({ data }) => setClients(data ?? []))
    loadBookings()
  }, [supabase, loadBookings])

  async function handleAddTour(e: React.FormEvent) {
    e.preventDefault()
    setSaving(true)
    setMsg(null)

    const { count } = await supabase
      .from('tours')
      .select('*', { count: 'exact', head: true })
      .eq('owner_id', form.owner_id)
      .eq('is_active', true)

    const client = clients.find(c => c.id === form.owner_id)
    const limit = planLimit(client?.plan_type ?? 'basic')

    if ((count ?? 0) >= limit) {
      setMsg({ type: 'err', text: `Client is at their ${client?.plan_type ?? 'basic'} plan limit (${limit} tours). Ask them to upgrade.` })
      setSaving(false)
      return
    }

    const { error } = await supabase.from('tours').insert({
      owner_id: form.owner_id,
      title: form.title,
      address: form.address,
      industry: form.industry,
      realsee_url: form.realsee_url,
      is_active: true,
    })

    setSaving(false)
    if (error) { setMsg({ type: 'err', text: error.message }); return }

    const clientName = clients.find(c => c.id === form.owner_id)?.full_name ?? 'client'
    setMsg({ type: 'ok', text: `✅ Tour live on ${clientName}'s dashboard.` })
    setForm(p => ({ ...p, title: '', address: '', realsee_url: '', notes: '' }))
  }

  async function markScheduled(bookingId: string) {
    await supabase.from('bookings').update({ status: 'scheduled' }).eq('id', bookingId)
    loadBookings()
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A', marginBottom: '1.5rem' }}>Admin</h1>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: '1.5rem', alignItems: 'start' }}
        className="grid-cols-1 md:grid-cols-[1fr_380px]">

        {/* ── Add Tour Form ── */}
        <div>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1A1A1A', marginBottom: '1rem' }}>Assign Tour to Client</h2>
          <div className="card" style={{ padding: '1.5rem' }}>
            <form onSubmit={handleAddTour} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: '#374151' }}>Client *</label>
                <select required className="input" value={form.owner_id} onChange={set('owner_id')} style={{ cursor: 'pointer' }}>
                  <option value="">Select client…</option>
                  {clients.map(c => (
                    <option key={c.id} value={c.id}>{c.full_name} ({c.plan_type})</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.75rem' }}>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: '#374151' }}>Tour title *</label>
                  <input required className="input" placeholder="2BR Westlands" value={form.title} onChange={set('title')} />
                </div>
                <div>
                  <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: '#374151' }}>Industry</label>
                  <select className="input" value={form.industry} onChange={set('industry')} style={{ cursor: 'pointer' }}>
                    <option value="real_estate">Real Estate</option>
                    <option value="restaurant">Restaurant</option>
                    <option value="automotive">Automotive</option>
                    <option value="hotel">Hotel</option>
                  </select>
                </div>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: '#374151' }}>Address *</label>
                <input required className="input" placeholder="Parklands Road, Westlands" value={form.address} onChange={set('address')} />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 500, marginBottom: '0.375rem', color: '#374151' }}>Realsee URL *</label>
                <input required className="input" placeholder="https://realsee.ai/XXXXXXXX" value={form.realsee_url} onChange={set('realsee_url')}
                  style={{ fontFamily: 'monospace', fontSize: '0.8rem' }} />
                <p style={{ fontSize: '0.7rem', color: '#9CA3AF', marginTop: '0.25rem' }}>
                  Realsee console → Share → Embed → copy the src value
                </p>
              </div>

              {msg && (
                <p style={{ fontSize: '0.875rem', fontWeight: 500, color: msg.type === 'ok' ? '#059669' : '#DC2626' }}>
                  {msg.text}
                </p>
              )}

              <button type="submit" disabled={saving} className="btn-primary" style={{ justifyContent: 'center', padding: '0.75rem' }}>
                {saving ? 'Publishing…' : '🚀 Publish Tour to Client'}
              </button>
            </form>
          </div>
        </div>

        {/* ── Booking Queue ── */}
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
            <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1A1A1A' }}>Shoot Requests</h2>
            {bookings.length > 0 && (
              <span style={{ background: '#FEF3C7', color: '#D97706', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
                {bookings.length} pending
              </span>
            )}
          </div>

          {bookings.length === 0 ? (
            <div className="card" style={{ padding: '2rem', textAlign: 'center' }}>
              <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No pending requests</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              {bookings.map(b => (
                <div key={b.id} className="card" style={{ padding: '1rem' }}>
                  <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A', marginBottom: '0.25rem' }}>{b.property_name}</p>
                  <p style={{ fontSize: '0.75rem', color: '#6B7280', marginBottom: '0.5rem' }}>{b.address}</p>
                  <div style={{ fontSize: '0.75rem', color: '#9CA3AF', marginBottom: '0.75rem' }}>
                    📅 {new Date(b.preferred_date).toLocaleDateString('en-KE', { weekday: 'short', day: 'numeric', month: 'short' })}
                    {b.bedrooms && ` · ${b.bedrooms} bed`}
                    {b.property_type && ` · ${b.property_type}`}
                  </div>
                  {b.notes && <p style={{ fontSize: '0.75rem', color: '#9CA3AF', fontStyle: 'italic', marginBottom: '0.75rem' }}>"{b.notes}"</p>}
                  <div style={{ display: 'flex', gap: '0.5rem' }}>
                    <a
                      href={buildWhatsAppUrl(
                        ownerPhones[b.owner_id] ?? '254792452899',
                        `Hi, confirming your 3D shoot at ${b.property_name} on ${new Date(b.preferred_date).toLocaleDateString('en-KE', { weekday: 'long', day: 'numeric', month: 'long' })}. We'll be there!`
                      )}
                      target="_blank" rel="noopener noreferrer"
                      style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: '#25D366', color: 'white', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                      Confirm via WA
                    </a>
                    <button onClick={() => markScheduled(b.id)}
                      style={{ padding: '0.5rem 0.75rem', background: 'white', border: '1px solid #E5E3DF', borderRadius: '0.5rem', fontSize: '0.75rem', cursor: 'pointer', color: '#6B7280' }}>
                      Scheduled
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
