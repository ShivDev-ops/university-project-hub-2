// File: app/api/send-otp/route.ts
import { getServerSession } from 'next-auth'
import { NextResponse } from 'next/server'
import { generateOTP, storeOTP, sendOTPEmail } from '@/lib/otp'  // from Phase 2
export async function POST() {
  // Get the current logged-in user's session
  const session = await getServerSession()
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  // Generate a new OTP, store it in DB, send it via email
  const otp = generateOTP()
  await storeOTP(session.user.id, otp)
  await sendOTPEmail(session.user.email, otp)
  return NextResponse.json({ success: true })
}