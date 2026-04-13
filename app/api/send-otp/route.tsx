// File: app/api/send-otp/route.ts
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { generateOTP, storeOTP, sendOTPEmail } from '@/lib/otp'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: req.url.startsWith('https')
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token',
  })

  console.log('SEND OTP TOKEN EMAIL:', token?.email)

  if (!token?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  // Always look up user_id fresh from DB using email
  // This avoids stale token issues
  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('user_id')
    .eq('email', token.email)
    .single()

  console.log('PROFILE FOR OTP:', profile)

  if (!profile?.user_id) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  try {
    const otp = generateOTP()
    console.log('STORING OTP FOR USER:', profile.user_id, '| CODE:', otp)
    await storeOTP(profile.user_id, otp)
    await sendOTPEmail(token.email, otp)

    const isDev = process.env.NODE_ENV === 'development'
    return NextResponse.json({
      success: true,
      devOtp: isDev ? otp : undefined,
    })
  } catch (err) {
    console.log('SEND OTP ERROR:', err)
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}