// File: app/api/auth/save-credentials/route.ts
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'
import bcrypt from 'bcryptjs'

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

  return NextResponse.json({ success: true })
}