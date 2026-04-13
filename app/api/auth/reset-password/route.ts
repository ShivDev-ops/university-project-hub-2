import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'

export async function POST(req: NextRequest) {
  const { email, otp, newPassword } = await req.json()

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('user_id')
    .eq('email', email)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  // Verify OTP one more time
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

  // Hash new password
  const password_hash = await bcrypt.hash(newPassword, 12)

  // Update password + mark OTP used
  await supabaseAdmin
    .from('profiles')
    .update({ password_hash })
    .eq('user_id', profile.user_id)

  await supabaseAdmin
    .from('otp_codes')
    .update({ used: true })
    .eq('user_id', profile.user_id)

  return NextResponse.json({ success: true })
}