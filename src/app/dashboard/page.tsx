import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import { greeting, industryLabel, industryColor, planLimit } from '@/lib/utils'
import TourCard from '@/components/dashboard/tour-card'

export const dynamic = 'force-dynamic'

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const [{ data: profile }, { data: tours }, { count: totalViews }, { count: totalLeads }] = await Promise.all([
    supabase.from('profiles').select('full_name, plan_type').eq('id', user.id).single(),
    supabase.from('tours').select('*').eq('owner_id', user.id).eq('is_active', true).order('created_at', { ascending: false }),
    supabase.from('tour_views').select('*', { count: 'exact', head: true }).eq('owner_id', user.id),
    supabase.from('leads').select('*', { count: 'exact', head: true }).eq('owner_id', user.id),
  ])

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const planType = profile?.plan_type ?? 'basic'
  const maxTours = planLimit(planType)
  const activeTours = tours?.length ?? 0

  return (
    <div style={{ padding: '1.5rem' }}>
      {/* Header */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#1A1A1A' }}>
          {greeting()}, {firstName} 👋
        </h1>
        <p style={{ color: '#6B7280', fontSize: '0.875rem', marginTop: '0.25rem' }}>
          Your tours are live.
        </p>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '0.75rem', marginBottom: '1.5rem' }}>
        {[
          { label: 'Active Tours', value: `${activeTours} / ${maxTours}`, sub: 'slots used' },
          { label: 'Total Views', value: String(totalViews ?? 0), sub: 'all time' },
          { label: 'Total Leads', value: String(totalLeads ?? 0), sub: 'all time' },
        ].map(stat => (
          <div key={stat.label} className="card" style={{ padding: '1rem', textAlign: 'center' }}>
            <div style={{ fontSize: '1.5rem', fontWeight: 700, color: '#D97706' }}>{stat.value}</div>
            <div style={{ fontSize: '0.75rem', fontWeight: 600, color: '#1A1A1A', marginTop: '0.25rem' }}>{stat.label}</div>
            <div style={{ fontSize: '0.65rem', color: '#9CA3AF', marginTop: '0.125rem' }}>{stat.sub}</div>
          </div>
        ))}
      </div>

      {/* Tours */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1rem' }}>
        <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1A1A1A' }}>Your Tours</h2>
        <a href="/dashboard/book" style={{ fontSize: '0.8rem', color: '#D97706', textDecoration: 'none', fontWeight: 500 }}>
          + Book Shoot
        </a>
      </div>

      {!tours || tours.length === 0 ? (
        <div className="card" style={{ padding: '3rem', textAlign: 'center', border: '1.5px dashed #E5E3DF' }}>
          <div style={{ fontSize: '2.5rem', marginBottom: '0.75rem' }}>🏠</div>
          <p style={{ fontWeight: 600, color: '#1A1A1A', marginBottom: '0.5rem' }}>No tours assigned yet.</p>
          <p style={{ color: '#6B7280', fontSize: '0.875rem', marginBottom: '1.5rem' }}>
            Edward will add your first tour after your shoot.
          </p>
          <a href="https://wa.me/254792452899?text=Hi+Edward%2C+I%27m+ready+to+book+my+first+shoot." target="_blank" rel="noopener noreferrer"
            className="btn-primary" style={{ textDecoration: 'none' }}>
            Contact Edward →
          </a>
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
          {tours.map(tour => (
            <TourCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </div>
  )
}
