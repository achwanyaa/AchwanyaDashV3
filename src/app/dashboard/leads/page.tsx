import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { maskPhone, cleanPhone, relativeTime } from '@/lib/utils'

export const dynamic = 'force-dynamic'

export default async function LeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: leads } = await supabase
    .from('leads')
    .select('id, full_name, phone, created_at, tour_id')
    .eq('owner_id', user.id)
    .order('created_at', { ascending: false })

  // Get tour titles separately to avoid join type issues
  const tourIds = [...new Set((leads ?? []).map(l => l.tour_id).filter(Boolean))]
  const { data: tours } = tourIds.length > 0
    ? await supabase.from('tours').select('id, title').in('id', tourIds)
    : { data: [] }

  const tourMap = Object.fromEntries((tours ?? []).map(t => [t.id, t.title]))

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A' }}>Leads</h1>
        {leads && leads.length > 0 && (
          <span style={{ background: '#D97706', color: 'white', fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px' }}>
            {leads.length}
          </span>
        )}
      </div>

      {!leads || leads.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', border: '1.5px dashed #E5E3DF' }}>
          <div style={{ fontSize: '2rem', marginBottom: '0.75rem' }}>📋</div>
          <p style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '0.5rem' }}>No leads yet.</p>
          <p style={{ color: '#6B7280', fontSize: '0.875rem' }}>
            Share your tour link to start capturing interest.
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="card" style={{ overflow: 'hidden' }} >
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
              <thead>
                <tr style={{ borderBottom: '1px solid #E5E3DF', background: '#F8F7F5' }}>
                  {['Name', 'Phone', 'Property', 'When', 'Contact'].map(h => (
                    <th key={h} style={{ textAlign: 'left', padding: '0.75rem 1rem', fontSize: '0.7rem', fontWeight: 700, color: '#6B7280', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {leads.map((lead, i) => (
                  <tr key={lead.id} style={{ borderBottom: i < leads.length - 1 ? '1px solid #E5E3DF' : 'none' }}>
                    <td style={{ padding: '0.875rem 1rem', fontWeight: 500, color: '#1A1A1A' }}>
                      {lead.full_name}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#6B7280', fontFamily: 'monospace', fontSize: '0.8rem' }}>
                      {maskPhone(lead.phone ?? '')}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#6B7280', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {tourMap[lead.tour_id] ?? '—'}
                    </td>
                    <td style={{ padding: '0.875rem 1rem', color: '#9CA3AF', fontSize: '0.8rem' }}>
                      {relativeTime(lead.created_at)}
                    </td>
                    <td style={{ padding: '0.875rem 1rem' }}>
                      <a
                        href={`https://wa.me/${cleanPhone(lead.phone ?? '')}?text=Hi+${encodeURIComponent(lead.full_name ?? '')}%2C+this+is+regarding+your+enquiry+on+the+Achwanya+3D+tour.`}
                        target="_blank"
                        rel="noopener noreferrer"
                        style={{ display: 'inline-flex', alignItems: 'center', gap: '0.25rem', padding: '0.3rem 0.625rem', background: '#ECFDF5', color: '#059669', borderRadius: '0.375rem', fontSize: '0.75rem', fontWeight: 600, textDecoration: 'none' }}>
                        WA →
                      </a>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      )}
    </div>
  )
}
