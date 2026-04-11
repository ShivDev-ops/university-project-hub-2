// File: app/api/profile/setup/route.ts
import { getServerSession } from 'next-auth'
import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)
export async function POST(req: NextRequest) {
  const session = await getServerSession()
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 })
  }
  const { bio, skills, github_url, fingerprint } = await req.json()
  // Update the user's profile in the profiles table
  const { error } = await supabaseAdmin
    .from('profiles')
    .update({
      bio,
      skills,
      github_url,
      fingerprint,
      updated_at: new Date().toISOString(),
    })
    .eq('user_id', session.user.id)
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ success: true })
}