import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function AdminBookingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: bookings } = await supabase
    .from('bookings')
    .select('id, property_name, address, preferred_date, property_type, bedrooms, notes, status, created_at, owner_id')
    .order('created_at', { ascending: false })

  const ownerIds = [...new Set((bookings ?? []).map(b => b.owner_id))]
  const { data: profiles } = ownerIds.length > 0
    ? await supabase.from('profiles').select('id, full_name, whatsapp_number').in('id', ownerIds)
    : { data: [] }

  const profileMap = Object.fromEntries((profiles ?? []).map(p => [p.id, p]))

  const statusColor: Record<string, string> = {
    requested: '#D97706',
    scheduled: '#2563EB',
    completed: '#059669',
    cancelled: '#6B7280',
  }
  const statusBg: Record<string, string> = {
    requested: '#FEF3C7',
    scheduled: '#EFF6FF',
    completed: '#ECFDF5',
    cancelled: '#F9FAFB',
  }

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A' }}>All Bookings</h1>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>{bookings?.length ?? 0} total</p>
      </div>

      {!bookings || bookings.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center' }}>
          <p style={{ color: '#9CA3AF', fontSize: '0.875rem' }}>No bookings yet.</p>
        </div>
      ) : (
        <div className="card" style={{ overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #E5E3DF', background: '#F8F7F5' }}>
                {['Property', 'Client', 'Date', 'Type', 'Status'].map(h => (
                  <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {bookings.map((b, i) => {
                const profile = profileMap[b.owner_id]
                const color = statusColor[b.status] ?? '#6B7280'
                const bg = statusBg[b.status] ?? '#F9FAFB'
                return (
                  <tr key={b.id} style={{ borderBottom: i < bookings.length - 1 ? '1px solid #E5E3DF' : 'none' }}>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ fontWeight: 500, color: '#1A1A1A' }}>{b.property_name}</p>
                      <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{b.address}</p>
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <p style={{ color: '#1A1A1A' }}>{profile?.full_name ?? '—'}</p>
                      {profile?.whatsapp_number && (
                        <a href={`https://wa.me/${profile.whatsapp_number.replace(/\D/g, '')}`}
                          target="_blank" rel="noopener noreferrer"
                          style={{ fontSize: '0.75rem', color: '#059669', textDecoration: 'none' }}>
                          WA →
                        </a>
                      )}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#6B7280' }}>
                      {new Date(b.preferred_date).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#6B7280', textTransform: 'capitalize' }}>
                      {b.property_type ?? '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.625rem', borderRadius: '9999px', background: bg, color }}>
                        {b.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
