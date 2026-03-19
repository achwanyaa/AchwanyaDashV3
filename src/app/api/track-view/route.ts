import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'

export async function POST(req: Request) {
  try {
    const { tourId, ownerId, sessionId } = await req.json()
    if (!tourId || !ownerId || !sessionId) {
      return NextResponse.json({ error: 'Missing fields' }, { status: 400 })
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

    // Deduplicate by session_id
    const { data: existing } = await supabase
      .from('tour_views')
      .select('id')
      .eq('tour_id', tourId)
      .eq('session_id', sessionId)
      .single()

    if (!existing) {
      await supabase.from('tour_views').insert({
        tour_id: tourId,
        owner_id: ownerId,
        session_id: sessionId,
        viewed_at: new Date().toISOString(),
      })
    }

    return NextResponse.json({ ok: true })
  } catch {
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
