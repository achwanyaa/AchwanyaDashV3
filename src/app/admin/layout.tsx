import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'
import AdminShell from '@/components/admin/sidebar'

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) redirect('/login')

  const adminId = process.env.NEXT_PUBLIC_ADMIN_USER_ID
  if (!adminId || user.id !== adminId) redirect('/dashboard')

  return <AdminShell>{children}</AdminShell>
}
