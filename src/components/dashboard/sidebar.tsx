'use client'
import { useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { planLabel } from '@/lib/utils'

interface Props {
  firstName: string
  planType: string
  expiresFormatted: string | null
  isExpired: boolean
  children: React.ReactNode
}

const navLinks = [
  { href: '/dashboard', label: 'Overview', icon: '📊' },
  { href: '/dashboard/leads', label: 'Leads', icon: '📋' },
  { href: '/dashboard/book', label: 'Book a Shoot', icon: '📅' },
]

export default function DashboardShell({ firstName, planType, expiresFormatted, isExpired, children }: Props) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [signingOut, setSigningOut] = useState(false)

  const isExpiringSoon = expiresFormatted
    ? (new Date(expiresFormatted).getTime() - Date.now()) < 14 * 86400000
    : false

  async function handleSignOut() {
    setSigningOut(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  const WA_RENEW = 'https://wa.me/254792452899?text=Hi+Edward%2C+I%27d+like+to+renew+my+Achwanya+3D+Tours+plan.'

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* ── Sidebar (desktop) ── */}
      <aside style={{
        width: '220px', flexShrink: 0, background: '#111111', display: 'flex',
        flexDirection: 'column', position: 'fixed', top: 0, left: 0, bottom: 0,
        zIndex: 40, overflowY: 'auto'
      }} className="hidden md:flex">
        {/* Logo */}
        <div style={{ padding: '1.5rem 1.25rem 1rem' }}>
          <img src="/logo.svg" alt="Achwanya" style={{ height: '36px', width: 'auto' }} />
        </div>

        {/* Nav */}
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
                transition: 'all 0.15s',
              }}>
                <span style={{ fontSize: '1rem' }}>{link.icon}</span>
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* Plan + sign out */}
        <div style={{ padding: '1rem 1.25rem', borderTop: '1px solid rgba(255,255,255,0.08)' }}>
          <div style={{
            background: isExpired || isExpiringSoon ? 'rgba(239,68,68,0.1)' : 'rgba(217,119,6,0.1)',
            borderRadius: '0.5rem', padding: '0.75rem', marginBottom: '0.75rem'
          }}>
            <p style={{ fontSize: '0.625rem', fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: '#D97706', marginBottom: '0.25rem' }}>
              {planLabel(planType)} Plan
            </p>
            {expiresFormatted && (
              <p style={{ fontSize: '0.7rem', color: isExpired || isExpiringSoon ? '#FCA5A5' : '#9CA3AF' }}>
                {isExpired ? 'Expired' : 'Expires'} {expiresFormatted}
              </p>
            )}
            {(isExpired || isExpiringSoon) && (
              <a href={WA_RENEW} target="_blank" rel="noopener noreferrer"
                style={{ display: 'block', marginTop: '0.5rem', fontSize: '0.7rem', color: '#D97706', textDecoration: 'underline' }}>
                Renew on WhatsApp →
              </a>
            )}
          </div>
          <button onClick={handleSignOut} disabled={signingOut}
            style={{ width: '100%', background: 'transparent', border: 'none', color: '#6B7280', fontSize: '0.8rem', cursor: 'pointer', padding: '0.375rem', textAlign: 'left' }}>
            {signingOut ? 'Signing out…' : '← Sign out'}
          </button>
        </div>
      </aside>

      {/* ── Main content ── */}
      <main style={{ flex: 1, marginLeft: '0', paddingBottom: '4rem' }} className="md:ml-[220px]">
        {/* Expiry banner */}
        {isExpired && (
          <div style={{ background: '#FEF2F2', borderBottom: '1px solid #FECACA', padding: '0.625rem 1.25rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <span style={{ fontSize: '0.875rem', color: '#DC2626' }}>
              Your plan expired on {expiresFormatted}.
            </span>
            <a href={WA_RENEW} target="_blank" rel="noopener noreferrer"
              style={{ fontSize: '0.875rem', color: '#DC2626', fontWeight: 600, textDecoration: 'underline' }}>
              Contact Edward to renew →
            </a>
          </div>
        )}

        {children}
      </main>

      {/* ── Bottom nav (mobile) ── */}
      <nav style={{
        position: 'fixed', bottom: 0, left: 0, right: 0, background: '#111111',
        display: 'flex', justifyContent: 'space-around', alignItems: 'center',
        padding: '0.625rem 0', zIndex: 40, borderTop: '1px solid rgba(255,255,255,0.08)'
      }} className="md:hidden">
        {navLinks.map(link => {
          const active = pathname === link.href
          return (
            <Link key={link.href} href={link.href} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
              textDecoration: 'none', padding: '0.25rem 1rem',
              color: active ? '#D97706' : '#6B7280',
            }}>
              <span style={{ fontSize: '1.25rem' }}>{link.icon}</span>
              <span style={{ fontSize: '0.6rem', fontWeight: active ? 600 : 400 }}>{link.label}</span>
            </Link>
          )
        })}
        <button onClick={handleSignOut} style={{
          display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '0.2rem',
          background: 'none', border: 'none', color: '#6B7280', cursor: 'pointer', padding: '0.25rem 1rem',
        }}>
          <span style={{ fontSize: '1.25rem' }}>🚪</span>
          <span style={{ fontSize: '0.6rem' }}>Out</span>
        </button>
      </nav>
    </div>
  )
}
