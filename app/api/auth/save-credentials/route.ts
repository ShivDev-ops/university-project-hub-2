import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'
import nodemailer from 'nodemailer'

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.GMAIL_USER!,
    pass: process.env.GMAIL_APP_PASSWORD!,
  },
})

export async function POST(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: req.url.startsWith('https')
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token',
  })

  if (!token?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const { username, password } = await req.json()

  // Check username not taken
  const { data: existing } = await supabaseAdmin
    .from('profiles')
    .select('username')
    .eq('username', username)
    .single()

  if (existing) {
    return NextResponse.json({ error: 'Username taken' }, { status: 400 })
  }

  const password_hash = await bcrypt.hash(password, 12)

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ username, password_hash })
    .eq('email', token.email)

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }

  // Send welcome email with credentials
  try {
    await transporter.sendMail({
      from: `"Project Hub" <${process.env.GMAIL_USER}>`,
      to: token.email,
      subject: 'Welcome to Project Hub — Your Login Details',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 480px; margin: 0 auto; padding: 32px; background: #0f0f0f; border-radius: 16px;">
          <h2 style="color: #adc6ff; margin-bottom: 8px; font-size: 24px;">Welcome to Project Hub!</h2>
          <p style="color: #9ca3af; margin-bottom: 24px;">Your account has been created successfully. Here are your login details:</p>
          <div style="background: #1f1f2f; border-radius: 12px; padding: 20px; margin-bottom: 24px;">
            <p style="color: #6b7280; font-size: 12px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.1em;">Email</p>
            <p style="color: #adc6ff; font-size: 16px; font-weight: bold; margin-bottom: 16px;">${token.email}</p>
            <p style="color: #6b7280; font-size: 12px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.1em;">Username</p>
            <p style="color: #adc6ff; font-size: 16px; font-weight: bold; margin-bottom: 16px;">@${username}</p>
            <p style="color: #6b7280; font-size: 12px; margin-bottom: 8px; text-transform: uppercase; letter-spacing: 0.1em;">Password</p>
            <p style="color: #adc6ff; font-size: 16px; font-weight: bold;">${password}</p>
          </div>
          <p style="color: #6b7280; font-size: 13px; margin-bottom: 8px;">You can sign in at any time using your email and password.</p>
          <p style="color: #6b7280; font-size: 12px;">If you didn't create this account, please ignore this email.</p>
        </div>
      `,
    })
  } catch (err) {
    console.log('Welcome email error:', err)
  }

  return NextResponse.json({ success: true })
}