import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const { email, otp } = await req.json()

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('user_id')
    .eq('email', email)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  const { data: otpData } = await supabaseAdmin
    .from('otp_codes')
    .select('*')
    .eq('user_id', profile.user_id)
    .eq('code', otp)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!otpData) {
    return NextResponse.json({ error: 'Invalid or expired code' }, { status: 400 })
  }

  return NextResponse.json({ success: true })
}