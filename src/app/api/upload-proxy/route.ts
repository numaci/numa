import { NextResponse } from 'next/server';

// Deprecated: we now use Supabase via /api/upload.
export const runtime = 'nodejs'

export async function POST() {
  return NextResponse.json(
    {
      error: 'This endpoint is deprecated. Use /api/upload (Supabase) instead.',
      status: 410,
    },
    { status: 410 }
  )
}
