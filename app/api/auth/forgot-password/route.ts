import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import { generateOTP, storeOTP } from '@/lib/otp'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
})

export async function POST(req: NextRequest) {
  const { email } = await req.json()

  const { data: profile } = await supabaseAdmin
    .from('profiles')
    .select('user_id, email')
    .eq('email', email)
    .single()

  if (!profile) {
    return NextResponse.json({ error: 'No account found with this email' }, { status: 404 })
  }

  const otp = generateOTP()
  await storeOTP(profile.user_id, otp)

  try {
    await transporter.sendMail({
      from: `"Project Hub" <${process.env.GMAIL_USER}>`,
      to: email,
      subject: 'Project Hub — Password Reset Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f0f; border-radius: 16px;">
          <h2 style="color: #adc6ff; margin-bottom: 8px;">Password Reset</h2>
          <p style="color: #9ca3af; margin-bottom: 24px;">Your password reset code is:</p>
          <div style="background: #1f1f2f; border-radius: 12px; padding: 24px; text-align: center; margin-bottom: 24px;">
            <h1 style="color: #a855f7; font-size: 48px; letter-spacing: 12px; margin: 0;">${otp}</h1>
          </div>
          <p style="color: #6b7280; font-size: 14px;">This code expires in <strong>10 minutes</strong>.</p>
          <p style="color: #6b7280; font-size: 14px;">If you didn't request this, ignore this email.</p>
        </div>
      `,
    })
  } catch (err) {
    console.log('Reset email error:', err)
    return NextResponse.json({ error: 'Failed to send email' }, { status: 500 })
  }

  return NextResponse.json({ success: true })
}