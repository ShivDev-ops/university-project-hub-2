// lib/otp.ts
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

export async function storeOTP(userId: string, otp: string): Promise<void> {
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString()

  const { error } = await supabase
    .from('otp_codes')
    .upsert(
      { user_id: userId, code: otp, expires_at: expiresAt, used: false },
      { onConflict: 'user_id' }
    )

  if (error) throw new Error('Could not store OTP')
}

export async function sendOTPEmail(email: string, otp: string): Promise<void> {
  const { error } = await resend.emails.send({
    from:    process.env.RESEND_FROM_EMAIL!,
    to:      email,
    subject: 'Your University Project Hub verification code',
    html: `
      <div style="font-family:sans-serif;background:#080C14;color:#F0F4FF;
                  padding:40px;text-align:center;">
        <div style="max-width:400px;margin:0 auto;background:#0F1623;
                    border-radius:16px;padding:40px;border:1px solid #2A3F5F;">
          <h2 style="color:#F0F4FF;margin-bottom:8px;">Verify your email</h2>
          <p style="color:#8B9CC8;margin-bottom:32px;">
            Enter this code in University Project Hub
          </p>
          <div style="background:#161E2E;border-radius:12px;padding:24px;
                      border:1px solid #3B82F6;letter-spacing:16px;
                      font-size:36px;font-family:monospace;
                      color:#3B82F6;font-weight:700;">
            ${otp}
          </div>
          <p style="color:#4A5A7A;font-size:13px;margin-top:24px;">
            Expires in <strong style="color:#8B9CC8;">10 minutes</strong>.
          </p>
        </div>
      </div>
    `,
  })

  if (error) throw new Error('Could not send OTP email')
}

export async function verifyOTP(
  userId: string,
  inputCode: string
): Promise<{ success: boolean; error?: string }> {

  const { data: token, error: fetchError } = await supabase
    .from('otp_codes')
    .select('*')
    .eq('user_id', userId)
    .eq('used', false)
    .single()

  if (fetchError || !token) {
    return { success: false, error: 'No code found. Request a new one.' }
  }

  if (new Date(token.expires_at) < new Date()) {
    return { success: false, error: 'Code expired. Request a new one.' }
  }

  if (token.code !== inputCode.trim()) {
    return { success: false, error: 'Incorrect code. Try again.' }
  }

  // Mark code as used
  await supabase
    .from('otp_codes')
    .update({ used: true })
    .eq('user_id', userId)

  // Mark user as verified
  const { error: profileError } = await supabase
    .from('profiles')
    .update({ verified: true })
    .eq('user_id', userId)

  if (profileError) {
    return { success: false, error: 'Verification failed. Try again.' }
  }

  return { success: true }
}

export async function deleteOTP(userId: string): Promise<void> {
  await supabase
    .from('otp_codes')
    .delete()
    .eq('user_id', userId)
}