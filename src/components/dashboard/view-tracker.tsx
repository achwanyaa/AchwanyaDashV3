'use client'
import { useEffect } from 'react'

export default function ViewTracker({ tourId, ownerId }: { tourId: string; ownerId: string }) {
  useEffect(() => {
    const sessionId = crypto.randomUUID()
    fetch('/api/track-view', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tourId, ownerId, sessionId }),
    }).catch(() => {})
  }, [tourId, ownerId])

  return null
}
