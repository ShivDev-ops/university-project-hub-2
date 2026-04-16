// File: app/api/auth/check-username/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { username } = await req.json()

  const { data } = await supabaseAdmin
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single()

  return NextResponse.json({ taken: !!data })
}