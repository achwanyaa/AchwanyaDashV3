import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import DashboardShell from '@/components/dashboard/sidebar'

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect('/login')

  const { data: profile } = await supabase
    .from('profiles')
    .select('full_name, plan_type, plan_expires_at')
    .eq('id', user.id)
    .single()

  const firstName = profile?.full_name?.split(' ')[0] ?? 'there'
  const planType = profile?.plan_type ?? 'basic'
  const planExpiry = profile?.plan_expires_at ?? null
  const isExpired = planExpiry ? new Date(planExpiry) < new Date() : false
  const expiresFormatted = planExpiry
    ? new Date(planExpiry).toLocaleDateString('en-KE', { day: 'numeric', month: 'short', year: 'numeric' })
    : null

  return (
    <DashboardShell
      firstName={firstName}
      planType={planType}
      expiresFormatted={expiresFormatted}
      isExpired={isExpired}
    >
      {children}
    </DashboardShell>
  )
}
