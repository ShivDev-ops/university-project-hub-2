import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { authOptions } from '@/lib/auth'
import { generateOTP, storeOTP, sendOTPEmail } from '@/lib/otp'

export async function POST() {
  const session = await getServerSession(authOptions)

  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  try {
    const otp = generateOTP()
    await storeOTP(session.user.id, otp)
    await sendOTPEmail(session.user.email, otp)
    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json({ error: 'Failed to send OTP' }, { status: 500 })
  }
}