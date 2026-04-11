// File: lib/otp.ts
import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)

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

// export async function sendOTPEmail(email: string, otp: string) {
//   await resend.emails.send({
//     from:    process.env.RESEND_FROM_EMAIL!,
//     to:      email,
//     subject: 'Your University Project Hub Login Code',
//     html:    `<p>Your verification code is: <strong>${otp}</strong></p>
//               <p>This code expires in 10 minutes.</p>`,
//   })
// }

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

export async function sendOTPEmail(email: string, otp: string) {
  console.log('SENDING OTP TO:', email)
  console.log('OTP CODE:', otp)
  
  try {
    const result = await resend.emails.send({
      from:    process.env.RESEND_FROM_EMAIL!,
      to:      email,
      subject: 'Your University Project Hub Login Code',
      html:    `<p>Your verification code is: <strong>${otp}</strong></p>
                <p>This code expires in 10 minutes.</p>`,
    })
    console.log('RESEND RESULT:', result)
  } catch (err) {
    console.log('RESEND ERROR:', err)
  }
}