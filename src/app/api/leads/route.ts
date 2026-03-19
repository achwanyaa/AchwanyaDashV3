import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { tourId, ownerId, name, phone } = await req.json()

    if (!tourId || !ownerId || !name || !phone) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 })
    }

    const cleanPhone = phone.replace(/\s/g, '')
    if (cleanPhone.replace(/\D/g, '').length < 9) {
      return NextResponse.json({ error: 'Invalid phone number' }, { status: 400 })
    }

    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return cookieStore.getAll() },
          setAll(c: any) { c.forEach(({ name, value, options }: any) => cookieStore.set(name, value, options)) },
        },
      }
    )

    const { error } = await supabase.from('leads').insert({
      tour_id: tourId,
      owner_id: ownerId,
      full_name: name.trim(),
      phone: cleanPhone,
    })

    if (error) return NextResponse.json({ error: error.message }, { status: 500 })

    // Non-blocking webhook
    const webhookUrl = process.env.LEAD_WEBHOOK_URL
    if (webhookUrl) {
      fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ tourId, ownerId, name, phone }),
      }).catch(() => {})
    } else if (process.env.NODE_ENV === 'development') {
      console.warn('[leads] LEAD_WEBHOOK_URL not set — lead saved but not forwarded')
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
