import { createClient } from '@supabase/supabase-js'
import { Resend } from 'resend'
 
const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
const resend = new Resend(process.env.RESEND_API_KEY)
 
// Generate a random 6-digit number
export function generateOTP(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}
 
// Store OTP in database with 10-minute expiry
export async function storeOTP(userId: string, otp: string) {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000) // 10 mins
  await supabase.from('otp_codes').upsert({
    user_id: userId,
    code: otp,
    expires_at: expiresAt.toISOString(),
    used: false,
 }, { onConflict: 'user_id' })
}
 
// Send OTP email via Resend
export async function sendOTPEmail(email: string, otp: string) {
  await resend.emails.send({
    from: process.env.RESEND_FROM_EMAIL!,
    to: email,
    subject: 'Your University Project Hub Login Code',
    html: `<p>Your verification code is: <strong>${otp}</strong></p>
           <p>This code expires in 10 minutes.</p>`,
  })
}
 
// Verify the OTP entered by the user
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
 
  // Mark as used so it can't be reused
  await supabase.from('otp_codes')
    .update({ used: true })
    .eq('user_id', userId)
 
  // Mark user as verified in profiles table
  await supabase.from('profiles')
    .update({ verified: true })
    .eq('user_id', userId)
 
  return true
}
