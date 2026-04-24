// app/api/skills/route.ts
import { NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase/admin'

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const q = searchParams.get('q')?.trim() ?? ''

  if (!q) {
    return NextResponse.json({ skills: [] })
  }

  const { data, error } = await supabaseAdmin
    .from('skill_weights')
    .select('skill')
    .ilike('skill', `%${q}%`)   // case-insensitive search
    .order('weight', { ascending: false })
    .limit(8)

  if (error) {
    console.error('Skills fetch error:', error)
    return NextResponse.json({ skills: [] })
  }

  return NextResponse.json({
    skills: data.map((row) => row.skill),
  })
}