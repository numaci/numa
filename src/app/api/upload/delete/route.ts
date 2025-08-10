import { NextRequest, NextResponse } from 'next/server'
import { getSupabaseServer } from '@/lib/supabaseServer'

// Expected JSON body: { url: string }
export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json()
    if (!url) {
      return NextResponse.json({ error: 'URL manquante' }, { status: 400 })
    }

    // Convert public URL to storage path: bucket "images"
    // Public URL format: `${supabaseUrl}/storage/v1/object/public/images/<path>`
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
    const prefix = `${supabaseUrl}/storage/v1/object/public/images/`

    if (!url.startsWith(prefix)) {
      return NextResponse.json({ error: 'URL invalide pour le bucket images' }, { status: 400 })
    }

    const path = url.replace(prefix, '')

    const { error } = await getSupabaseServer().storage.from('images').remove([path])
    if (error) {
      console.error('[DELETE] Supabase remove error:', error.message)
      return NextResponse.json({ error: "Erreur lors de la suppression" }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (e) {
    console.error('[DELETE] Erreur:', e)
    return NextResponse.json({ error: 'Erreur serveur' }, { status: 500 })
  }
}
