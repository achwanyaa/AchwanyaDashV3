'use client'
import { useState } from 'react'
import Link from 'next/link'
import { industryLabel, industryColor } from '@/lib/utils'

interface Tour {
  id: string
  title: string
  address: string
  industry: string
  realsee_url: string
  created_at: string
}

export default function TourCard({ tour }: { tour: Tour }) {
  const [copied, setCopied] = useState(false)
  const [showQR, setShowQR] = useState(false)

  function copyLink() {
    navigator.clipboard.writeText(tour.realsee_url)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  return (
    <>
      <div className="card" style={{ padding: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '0.5rem' }}>
          <div style={{ flex: 1, minWidth: 0 }}>
            <span className={`inline-flex items-center text-xs font-semibold px-2 py-0.5 rounded-full ${industryColor(tour.industry)}`}
              style={{ fontSize: '0.7rem', fontWeight: 700, padding: '0.15rem 0.5rem', borderRadius: '9999px', marginBottom: '0.375rem', display: 'inline-block' }}>
              {industryLabel(tour.industry)}
            </span>
            <h3 style={{ fontWeight: 600, fontSize: '0.9rem', color: '#1A1A1A', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tour.title}
            </h3>
            <p style={{ fontSize: '0.75rem', color: '#6B7280', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {tour.address}
            </p>
          </div>
          <span style={{ fontSize: '0.65rem', fontWeight: 700, color: '#10B981', background: '#ECFDF5', padding: '0.2rem 0.5rem', borderRadius: '9999px', flexShrink: 0 }}>
            LIVE
          </span>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '0.5rem' }}>
          <Link href={`/dashboard/tours/${tour.id}`}
            style={{ flex: 1, textAlign: 'center', padding: '0.5rem', background: '#D97706', color: 'white', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, textDecoration: 'none' }}>
            View Tour
          </Link>
          <button onClick={copyLink}
            style={{ flex: 1, padding: '0.5rem', background: copied ? '#ECFDF5' : 'white', color: copied ? '#10B981' : '#1A1A1A', border: '1px solid', borderColor: copied ? '#10B981' : '#E5E3DF', borderRadius: '0.5rem', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all 0.2s' }}>
            {copied ? '✓ Copied!' : 'Copy Link'}
          </button>
          <button onClick={() => setShowQR(true)}
            style={{ padding: '0.5rem 0.75rem', background: 'white', border: '1px solid #E5E3DF', borderRadius: '0.5rem', fontSize: '0.875rem', cursor: 'pointer' }}>
            QR
          </button>
        </div>
      </div>

      {/* QR Modal */}
      {showQR && (
        <div onClick={() => setShowQR(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 50, padding: '1rem' }}>
          <div onClick={e => e.stopPropagation()} className="card"
            style={{ padding: '1.5rem', maxWidth: '280px', width: '100%', textAlign: 'center' }}>
            <h3 style={{ fontWeight: 600, marginBottom: '0.25rem', fontSize: '0.9rem' }}>{tour.title}</h3>
            <p style={{ color: '#6B7280', fontSize: '0.75rem', marginBottom: '1rem' }}>Scan to view tour</p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(tour.realsee_url)}`}
              alt="QR Code"
              style={{ width: '200px', height: '200px', margin: '0 auto 1rem', borderRadius: '0.5rem' }}
            />
            <a href={`https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(tour.realsee_url)}`}
              download={`${tour.title}-qr.png`} target="_blank" rel="noopener noreferrer"
              style={{ display: 'block', padding: '0.5rem', background: '#F8F7F5', border: '1px solid #E5E3DF', borderRadius: '0.5rem', fontSize: '0.8rem', color: '#1A1A1A', textDecoration: 'none', marginBottom: '0.5rem' }}>
              Download QR Code
            </a>
            <button onClick={() => setShowQR(false)}
              style={{ width: '100%', padding: '0.5rem', background: 'none', border: 'none', color: '#6B7280', fontSize: '0.8rem', cursor: 'pointer' }}>
              Close
            </button>
          </div>
        </div>
      )}
    </>
  )
}
