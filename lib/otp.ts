// File: lib/otp.ts
import { createClient } from '@supabase/supabase-js'
import nodemailer from 'nodemailer'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
})

export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

export async function storeOTP(userId: string, otp: string) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
  await supabase.from('otp_codes').upsert({
    user_id:    userId,
    code:       otp,
    expires_at: expiresAt.toISOString(),
    used:       false,
  }, { onConflict: 'user_id' })
}

export async function sendOTPEmail(email: string, otp: string) {
  console.log('SENDING OTP TO:', email, '| CODE:', otp)

  try {
    const result = await transporter.sendMail({
      from:    `"University Project Hub" <${process.env.GMAIL_USER}>`,
      to:      email,
      subject: 'Your University Project Hub Login Code',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; 
                    padding: 32px; background: #0f0f0f; border-radius: 16px;">
          <h2 style="color: #7c3aed; margin-bottom: 8px;">University Project Hub</h2>
          <p style="color: #9ca3af; margin-bottom: 24px;">Your verification code is:</p>
          <div style="background: #1f1f1f; border-radius: 12px; padding: 24px; 
                      text-align: center; margin-bottom: 24px;">
            <h1 style="color: #a855f7; font-size: 48px; letter-spacing: 12px; margin: 0;">
              ${otp}
            </h1>
          </div>
          <p style="color: #6b7280; font-size: 14px;">
            This code expires in <strong>10 minutes</strong>.
          </p>
          <p style="color: #6b7280; font-size: 14px;">
            If you did not request this, ignore this email.
          </p>
        </div>
      `,
    })
    console.log('EMAIL SENT:', result.messageId)
    return { success: true }
  } catch (err) {
    console.log('EMAIL ERROR:', err)
    return { success: false }
  }
}

export async function verifyOTP(userId: string, inputCode: string): Promise<boolean> {
  const { data } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('user_id', userId)
    .eq('code', inputCode)
    .eq('used', false)
    .gt('expires_at', new Date().toISOString())
    .single()

  if (!data) return false

  await supabase.from('otp_codes')
    .update({ used: true })
    .eq('user_id', userId)

  await supabase.from('profiles')
    .update({ verified: true })
    .eq('user_id', userId)

  return true
}

