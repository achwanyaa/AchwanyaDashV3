'use client'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

const navLinks = [
  { href: '/admin', label: 'Tours', icon: '🚀' },
  { href: '/admin/clients', label: 'Clients', icon: '👥' },
  { href: '/admin/bookings', label: 'Bookings', icon: '📅' },
]

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()

  async function handleSignOut() {
    await supabase.auth.signOut()
    router.push('/login')
  }

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <aside style={{ width: '220px', flexShrink: 0, background: '#0A0A0A', display: 'flex', flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0, zIndex: 40 }}
        className="hidden md:flex">
        <div style={{ padding: '1.5rem 1.25rem 1rem' }}>
          <img src="/logo.svg" alt="Achwanya" style={{ height: '36px' }} />
          <span style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.12em', color: '#D97706', textTransform: 'uppercase' }}>
            Admin Panel
          </span>
        </div>

        <nav style={{ padding: '0.5rem 0.75rem', flex: 1 }}>
          {navLinks.map(link => {
            const active = pathname === link.href
            return (
              <Link key={link.href} href={link.href} style={{
                display: 'flex', alignItems: 'center', gap: '0.625rem',
                padding: '0.625rem 0.75rem', borderRadius: '0.5rem', marginBottom: '0.25rem',
                fontSize: '0.875rem', fontWeight: active ? 600 : 400, textDecoration: 'none',
                background: active ? 'rgba(217,119,6,0.15)' : 'transparent',
                color: active ? '#D97706' : '#9CA3AF',
              }}>
                <span>{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>

        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <button onClick={handleSignOut}
            style={{ background: 'none', border: 'none', color: '#6B7280', fontSize: '0.8rem', cursor: 'pointer', padding: 0 }}>
            ← Sign out
          </button>
        </div>
      </aside>

      {/* Main */}
      <main style={{ flex: 1, background: '#F8F7F5', minHeight: '100vh' }} className="md:ml-[220px]">
        {children}
      </main>
    </div>
  )
}
