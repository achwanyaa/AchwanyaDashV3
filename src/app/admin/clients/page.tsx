import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { planLabel, planLimit } from '@/lib/utils'
import DeactivateButton from '@/components/dashboard/deactivate-button'

export const dynamic = 'force-dynamic'

export default async function AdminClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profiles } = await supabase
    .from('profiles')
    .select('id, full_name, whatsapp_number, plan_type, plan_expires_at, created_at')
    .order('created_at', { ascending: false })

  // Get active tour counts per client
  const { data: tourCounts } = await supabase
    .from('tours')
    .select('owner_id')
    .eq('is_active', true)

  const countMap: Record<string, number> = {}
  tourCounts?.forEach(t => { countMap[t.owner_id] = (countMap[t.owner_id] ?? 0) + 1 })

  return (
    <div style={{ padding: '1.5rem' }}>
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
        <div>
          <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A' }}>Clients</h1>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>{profiles?.length ?? 0} total</p>
        </div>
      </div>

      <div className="card" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid #E5E3DF', background: '#F8F7F5' }}>
              {['Client', 'Plan', 'Tours', 'Expires', 'Status', 'Actions'].map(h => (
                <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {(profiles ?? []).map((p, i) => {
              const isExpired = p.plan_expires_at ? new Date(p.plan_expires_at) < new Date() : false
              const activeTours = countMap[p.id] ?? 0
              const limit = planLimit(p.plan_type ?? 'basic')
              const expiryStr = p.plan_expires_at
                ? new Date(p.plan_expires_at).toLocaleDateString('en-KE', { day: 'numeric', month: 'short' })
                : '—'

              return (
                <tr key={p.id} style={{ borderBottom: i < (profiles?.length ?? 0) - 1 ? '1px solid #E5E3DF' : 'none' }}>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <p style={{ fontWeight: 500, color: '#1A1A1A' }}>{p.full_name ?? '—'}</p>
                    <p style={{ fontSize: '0.75rem', color: '#9CA3AF' }}>{p.whatsapp_number ?? '—'}</p>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '0.375rem', background: '#FEF3C7', color: '#92400E' }}>
                      {planLabel(p.plan_type ?? 'basic').toUpperCase()}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ fontSize: '0.875rem', fontWeight: 600, color: activeTours >= limit ? '#DC2626' : '#1A1A1A' }}>
                      {activeTours} / {limit}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem', fontSize: '0.875rem', color: isExpired ? '#DC2626' : '#6B7280' }}>
                    {expiryStr}
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <span style={{ fontSize: '0.75rem', fontWeight: 600, padding: '0.2rem 0.5rem', borderRadius: '9999px', background: isExpired ? '#FEF2F2' : '#ECFDF5', color: isExpired ? '#DC2626' : '#059669' }}>
                      {isExpired ? 'Expired' : 'Active'}
                    </span>
                  </td>
                  <td style={{ padding: '0.875rem 1rem' }}>
                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                      <a href={`https://wa.me/${(p.whatsapp_number ?? '').replace(/\D/g, '')}`}
                        target="_blank" rel="noopener noreferrer"
                        style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600, textDecoration: 'none' }}>
                        WA →
                      </a>
                      <DeactivateButton clientId={p.id} />
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
        {(!profiles || profiles.length === 0) && (
          <div style={{ padding: '3rem', textAlign: 'center', color: '#9CA3AF', fontSize: '0.875rem' }}>No clients yet</div>
        )}
      </div>
    </div>
  )
}
