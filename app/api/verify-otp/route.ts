// File: app/api/verify-otp/route.ts
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({
      req,
      secret: process.env.NEXTAUTH_SECRET,
      cookieName: req.url.startsWith('https')
        ? '__Secure-next-auth.session-token'
        : 'next-auth.session-token',
    })

    console.log('VERIFY TOKEN EMAIL:', token?.email)

    if (!token?.email) {
      return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
    }

    const { code } = await req.json()

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Invalid OTP format' }, { status: 400 })
    }

    // Always look up fresh from DB using email
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('email', token.email)
      .single()

    console.log('PROFILE FOR VERIFY:', profile)

    if (!profile?.user_id) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 })
    }

    // Check OTP
    const { data: otpData } = await supabaseAdmin
      .from('otp_codes')
      .select('*')
      .eq('user_id', profile.user_id)
      .eq('code', code)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single()

    console.log('OTP DATA:', otpData)

    if (!otpData) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    // Mark OTP used
    await supabaseAdmin
      .from('otp_codes')
      .update({ used: true })
      .eq('user_id', profile.user_id)

    // Mark verified
    await supabaseAdmin
      .from('profiles')
      .update({ verified: true })
      .eq('user_id', profile.user_id)

    console.log('OTP VERIFIED for:', token.email)
    return NextResponse.json({ success: true })

  } catch (err) {
    console.log('VERIFY OTP ERROR:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}