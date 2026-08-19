import { NextResponse } from 'next/server';
import jwt from 'jsonwebtoken';
import { supabaseAdmin } from '@/lib/supabase/admin';

export async function POST(request: Request) {
  try {
    const { token, manifest } = await request.json();

    if (!token || !manifest) {
      return NextResponse.json({ error: 'Missing token or manifest' }, { status: 400 });
    }

    const secret = process.env.EXPORT_JWT_SECRET;
    if (!secret) {
      return NextResponse.json({ error: 'Server misconfiguration: missing JWT secret' }, { status: 500 });
    }

    let decoded: any;
    try {
      decoded = jwt.verify(token, secret);
    } catch (err) {
      return NextResponse.json({ error: 'Invalid or expired token' }, { status: 401 });
    }

    const { teamId, participantEmail, exportedAt } = decoded;

    if (!participantEmail) {
      return NextResponse.json({ error: 'Token missing participant email' }, { status: 400 });
    }

    // Find the User ID in UPH by matching participantEmail
    const { data: profile, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('user_id')
      .eq('email', participantEmail)
      .single();

    if (profileError || !profile) {
      console.error('Profile query error:', profileError);
      return NextResponse.json({ error: 'User profile not found in UPH' }, { status: 404 });
    }

    const userId = profile.user_id;

    // For better error tracking we can collect errors
    const errors: string[] = [];

    // 1. imported_events
    if (manifest.event) {
      const { error } = await supabaseAdmin.from('imported_events').insert(manifest.event);
      if (error) {
        console.error('Error inserting event:', error);
        errors.push(`events: ${error.message}`);
      }
    }

    // 2. imported_teams
    if (manifest.team) {
      const { error } = await supabaseAdmin.from('imported_teams').insert(manifest.team);
      if (error) {
        console.error('Error inserting team:', error);
        errors.push(`teams: ${error.message}`);
      }
    }

    // 3. imported_members
    if (manifest.members && manifest.members.length > 0) {
      const { error } = await supabaseAdmin.from('imported_members').insert(manifest.members);
      if (error) {
        console.error('Error inserting members:', error);
        errors.push(`members: ${error.message}`);
      }
    }

    // 4. imported_tasks
    if (manifest.tasks && manifest.tasks.length > 0) {
      const { error } = await supabaseAdmin.from('imported_tasks').insert(manifest.tasks);
      if (error) {
        console.error('Error inserting tasks:', error);
        errors.push(`tasks: ${error.message}`);
      }
    }

    // 5. imported_commits
    if (manifest.commits && manifest.commits.length > 0) {
      const { error } = await supabaseAdmin.from('imported_commits').insert(manifest.commits);
      if (error) {
        console.error('Error inserting commits:', error);
        errors.push(`commits: ${error.message}`);
      }
    }

    // 6. imported_dna_milestones (from manifest.project_dna)
    if (manifest.project_dna && manifest.project_dna.length > 0) {
      const { error } = await supabaseAdmin.from('imported_dna_milestones').insert(manifest.project_dna);
      if (error) {
        console.error('Error inserting project dna:', error);
        errors.push(`project_dna: ${error.message}`);
      }
    }

    // 7. imported_judging
    if (manifest.judging && manifest.judging.length > 0) {
      const { error } = await supabaseAdmin.from('imported_judging').insert(manifest.judging);
      if (error) {
        console.error('Error inserting judging:', error);
        errors.push(`judging: ${error.message}`);
      }
    }

    // 8. imported_telemetry
    if (manifest.telemetry_logs && manifest.telemetry_logs.length > 0) {
      const { error } = await supabaseAdmin.from('imported_telemetry').insert(manifest.telemetry_logs);
      if (error) {
        console.error('Error inserting telemetry:', error);
        errors.push(`telemetry: ${error.message}`);
      }
    }

    // 9. imported_chat_history
    if (manifest.chat_history && manifest.chat_history.length > 0) {
      const { error } = await supabaseAdmin.from('imported_chat_history').insert(manifest.chat_history);
      if (error) {
        console.error('Error inserting chat history:', error);
        errors.push(`chat_history: ${error.message}`);
      }
    }

    if (errors.length > 0) {
      return NextResponse.json({ success: true, message: 'Import partially successful', errors, userId }, { status: 207 });
    }

    return NextResponse.json({ success: true, message: 'Import successful', userId });

  } catch (err: any) {
    console.error('Import error:', err);
    return NextResponse.json({ error: 'Internal server error', details: err.message }, { status: 500 });
  }
}
