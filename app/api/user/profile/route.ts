// File: app/api/user/profile/route.ts
import { getToken } from 'next-auth/jwt'
import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function POST(req: NextRequest) {
  const token = await getToken({
    req,
    secret: process.env.NEXTAUTH_SECRET,
    cookieName: req.url.startsWith('https')
      ? '__Secure-next-auth.session-token'
      : 'next-auth.session-token',
  })

  console.log('PROFILE TOKEN:', token?.email)

  if (!token?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }

  const userId = token.dbUserId as string

  if (!userId) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 })
  }

  try {
    const { bio, skills, github_url, full_name, academic_focus, fingerprint } = await req.json()

    const { error } = await supabaseAdmin
      .from('profiles')
      .update({
        bio,
        skills,
        github_url,
        full_name,
        academic_focus,
        fingerprint,
        profile_complete: true,  // ← critical
        updated_at: new Date().toISOString(),
      })
      .eq('user_id', userId)

    if (error) {
      console.log('PROFILE UPDATE ERROR:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (err) {
    console.log('PROFILE ERROR:', err)
    return NextResponse.json({ error: 'Failed to save profile' }, { status: 500 })
  }
}