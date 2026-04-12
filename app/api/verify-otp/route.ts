// File: app/api/verify-otp/route.ts
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { verifyOTP } from '@/lib/otp'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  console.log('VERIFY SESSION:', session)

  // If no session, try to get user from email in request
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const { code } = await req.json()

    if (!code || code.length !== 6) {
      return NextResponse.json({ error: 'Invalid OTP format' }, { status: 400 })
    }

    const isValid = await verifyOTP(session.user.id, code)

    if (!isValid) {
      return NextResponse.json({ error: 'Invalid or expired OTP' }, { status: 400 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.log('VERIFY OTP ERROR:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}