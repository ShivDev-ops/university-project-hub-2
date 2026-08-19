import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(req: Request) {
  const projectId = req.headers.get('x-project-id');
  if (!projectId) {
    return NextResponse.json({ error: 'Missing x-project-id header' }, { status: 400 });
  }

  const payload = await req.json();
  const event = req.headers.get('x-github-event');

  if (event === 'push' && payload.commits) {
    const commits = payload.commits.map((c: any) => ({
      project_id: projectId,
      commit_sha: c.id,
      message: c.message,
      author_handle: c.author?.username || c.author?.name || 'unknown',
      commit_url: c.url,
      created_at: c.timestamp,
    }));

    const { error } = await supabaseAdmin.from('lab_commits').insert(commits);
    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    // Also log to telemetry
    await supabaseAdmin.from('lab_telemetry_logs').insert({
      project_id: projectId,
      action_type: 'PUSH',
      table_name: 'lab_commits',
      details: `${commits.length} commit(s) received from GitHub`,
    });
  }

  return NextResponse.json({ received: true });
}
