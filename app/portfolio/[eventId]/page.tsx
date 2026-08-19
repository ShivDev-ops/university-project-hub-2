'use client';

import React, { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { ArrowLeft, LayoutDashboard, GitBranch, Layout as Trello, Activity, MessageSquare, Cpu } from 'lucide-react';
import OverviewDashboard from '@/components/portfolio/OverviewDashboard';
import GitTimeline from '@/components/portfolio/GitTimeline';
import ReadOnlyKanban from '@/components/portfolio/ReadOnlyKanban';
import ProjectDNA from '@/components/portfolio/ProjectDNA';
import ActivityTimeline from '@/components/portfolio/ActivityTimeline';
import ChatArchive from '@/components/portfolio/ChatArchive';

export default function PortfolioDetailPage() {
  const params = useParams();
  const eventId = Array.isArray(params.eventId) ? params.eventId[0] : params.eventId;
  
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const supabase = createClient();

  useEffect(() => {
    async function fetchData() {
      if (!eventId) return;

      const { data: event } = await supabase
        .from('imported_events')
        .select('*')
        .eq('id', eventId)
        .single();

      if (!event) {
        setLoading(false);
        return;
      }

      const { data: team } = await supabase
        .from('imported_teams')
        .select('*')
        .eq('imported_event_id', event.id)
        .single();

      let teamId = team?.id;
      
      const [members, tasks, commits, dna, judging, telemetry, chat] = await Promise.all([
        teamId ? supabase.from('imported_members').select('*').eq('imported_team_id', teamId) : { data: [] },
        teamId ? supabase.from('imported_tasks').select('*').eq('imported_team_id', teamId) : { data: [] },
        teamId ? supabase.from('imported_commits').select('*').eq('imported_team_id', teamId).order('created_at', { ascending: false }) : { data: [] },
        teamId ? supabase.from('imported_dna_milestones').select('*').eq('imported_team_id', teamId) : { data: [] },
        teamId ? supabase.from('imported_judging').select('*').eq('imported_team_id', teamId).single() : { data: null },
        teamId ? supabase.from('imported_telemetry').select('*').eq('imported_team_id', teamId).order('created_at', { ascending: false }) : { data: [] },
        teamId ? supabase.from('imported_chat_history').select('*').eq('imported_team_id', teamId).order('created_at', { ascending: true }) : { data: [] },
      ]);

      setData({
        event,
        team,
        members: members.data || [],
        tasks: tasks.data || [],
        commits: commits.data || [],
        dna: dna.data || [],
        judging: judging.data || null,
        telemetry: telemetry.data || [],
        chat: chat.data || [],
      });
      
      setLoading(false);
    }
    fetchData();
  }, [eventId]);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-emerald-500 font-mono animate-pulse tracking-widest uppercase">Decrypting Portfolio Data...</div>
      </div>
    );
  }

  if (!data || !data.event) {
    return (
      <div className="min-h-screen bg-zinc-950 flex flex-col items-center justify-center text-zinc-400">
        <p className="text-xl mb-4">Portfolio not found or access denied.</p>
        <Link href="/portfolio" className="text-emerald-500 hover:underline">Return to Portfolios</Link>
      </div>
    );
  }

  const TABS = [
    { id: 'overview', label: 'Overview', icon: LayoutDashboard },
    { id: 'git', label: 'Git Timeline', icon: GitBranch },
    { id: 'kanban', label: 'Tasks', icon: Trello },
    { id: 'dna', label: 'Project DNA', icon: Cpu },
    { id: 'activity', label: 'Activity', icon: Activity },
    { id: 'chat', label: 'AI Chat', icon: MessageSquare },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 border-b border-emerald-500/10 bg-zinc-950/80 backdrop-blur-md px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Link href="/portfolio" className="p-2 hover:bg-zinc-900 rounded-full text-zinc-400 hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </Link>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">{data.event.event_name}</h1>
            <div className="text-xs font-mono text-emerald-500">TEAM {data.team?.team_name?.toUpperCase()}</div>
          </div>
        </div>
        <div className="flex gap-2 bg-zinc-900/50 p-1 rounded-lg border border-zinc-800">
          {TABS.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id 
                  ? 'bg-emerald-500/20 text-emerald-400' 
                  : 'text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
              }`}
            >
              <tab.icon size={16} />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto p-6 md:p-10">
        <div className="max-w-7xl mx-auto">
          {activeTab === 'overview' && <OverviewDashboard data={data} />}
          {activeTab === 'git' && <GitTimeline data={data} />}
          {activeTab === 'kanban' && <ReadOnlyKanban data={data} />}
          {activeTab === 'dna' && <ProjectDNA data={data} />}
          {activeTab === 'activity' && <ActivityTimeline data={data} />}
          {activeTab === 'chat' && <ChatArchive data={data} />}
        </div>
      </main>
    </div>
  );
}
