import { NextResponse } from 'next/server'

export const runtime = 'nodejs'

export async function GET() {
  const hasUrl = !!process.env.NEXT_PUBLIC_SUPABASE_URL
  const hasAnon = !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const hasService = !!process.env.SUPABASE_SERVICE_ROLE_KEY
  const hasDb = !!process.env.DATABASE_DB

  return NextResponse.json({
    ok: hasUrl && hasAnon && hasService && hasDb,
    missing: {
      NEXT_PUBLIC_SUPABASE_URL: hasUrl ? 'present' : 'missing',
      NEXT_PUBLIC_SUPABASE_ANON_KEY: hasAnon ? 'present' : 'missing',
      SUPABASE_SERVICE_ROLE_KEY: hasService ? 'present' : 'missing',
      DATABASE_DB: hasDb ? 'present' : 'missing',
    },
  })
}
