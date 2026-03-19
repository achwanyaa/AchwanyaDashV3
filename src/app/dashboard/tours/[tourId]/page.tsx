import { createClient } from '@/lib/supabase/server'
import { notFound, redirect } from 'next/navigation'
import ViewTracker from '@/components/dashboard/view-tracker'
import LeadCapture from '@/components/dashboard/lead-capture'
import Link from 'next/link'

export const dynamic = 'force-dynamic'

interface Props {
  params: Promise<{ tourId: string }>
}

export default async function TourViewerPage({ params }: Props) {
  const { tourId } = await params
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: tour } = await supabase
    .from('tours')
    .select('id, title, address, realsee_url, owner_id')
    .eq('id', tourId)
    .eq('owner_id', user.id)
    .single()

  if (!tour) notFound()

  const { data: profile } = await supabase
    .from('profiles')
    .select('whatsapp_number')
    .eq('id', user.id)
    .single()

  const ownerPhone = profile?.whatsapp_number ?? '254792452899'

  return (
    <div style={{ position: 'fixed', inset: 0, display: 'flex', flexDirection: 'column', background: '#000' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0.625rem 1rem', background: 'white', borderBottom: '1px solid #E5E3DF', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', minWidth: 0 }}>
          <Link href="/dashboard" style={{ color: '#6B7280', textDecoration: 'none', fontSize: '0.875rem', flexShrink: 0 }}>
            ← Back
          </Link>
          <div style={{ minWidth: 0 }}>
            <p style={{ fontWeight: 600, fontSize: '0.875rem', color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tour.title}
            </p>
            <p style={{ fontSize: '0.7rem', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tour.address}
            </p>
          </div>
        </div>
        <button
          onClick={() => navigator.clipboard.writeText(tour.realsee_url)}
          style={{ padding: '0.375rem 0.75rem', background: '#D97706', color: 'white', border: 'none', borderRadius: '0.5rem', fontSize: '0.75rem', fontWeight: 600, cursor: 'pointer', flexShrink: 0 }}>
          Copy Link
        </button>
      </div>

      {/* Iframe */}
      <iframe
        src={tour.realsee_url}
        allow="xr-spatial-tracking; fullscreen; gyroscope; accelerometer; magnetometer"
        allowFullScreen
        style={{ flex: 1, width: '100%', border: 'none' }}
        title={tour.title}
      />

      {/* Lead capture overlay */}
      <LeadCapture tourId={tour.id} ownerId={user.id} ownerPhone={ownerPhone} tourTitle={tour.title} />

      {/* View tracker */}
      <ViewTracker tourId={tour.id} ownerId={user.id} />
    </div>
  )
}
