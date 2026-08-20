'use client';

import React, { useEffect, useState } from 'react';
import { createClient } from '@/lib/supabase/client';
import Link from 'next/link';
import { Briefcase, Calendar, ChevronRight } from 'lucide-react';

export default function PortfolioPage() {
  const [portfolios, setPortfolios] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const supabase = createClient();

  useEffect(() => {
    async function fetchPortfolios() {
      const { data: userRes } = await supabase.auth.getUser();
      if (!userRes.user) return;

      // Fetch events and their associated teams
      const { data: events, error } = await supabase
        .from('imported_events')
        .select(`
          *,
          imported_teams (*)
        `)
        .eq('user_id', userRes.user.id)
        .order('imported_at', { ascending: false });

      if (!error && events) {
        setPortfolios(events);
      }
      setLoading(false);
    }
    fetchPortfolios();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center">
        <div className="text-emerald-500 font-mono animate-pulse tracking-widest uppercase">Loading Portfolios...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 pt-24 pb-12 px-6">
      <div className="max-w-6xl mx-auto text-zinc-100">
        <h1 className="text-4xl font-black mb-10 flex items-center gap-4 tracking-tighter">
          <Briefcase className="text-emerald-500 w-10 h-10" />
          HACKATHON PORTFOLIOS
        </h1>

        {portfolios.length === 0 ? (
          <div className="bg-zinc-900/30 border border-zinc-800/50 p-12 rounded-md text-center text-zinc-400 glass-panel">
            <p className="text-lg">No portfolios imported yet.</p>
            <p className="text-sm mt-3 text-zinc-500">Export your work from Hack-Flow to see it here.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {portfolios.map((event) => {
              const team = event.imported_teams?.[0];
              return (
                <Link href={`/portfolio/${event.id}`} key={event.id}>
                  <div className="group bg-zinc-900/40 border border-zinc-800 hover:border-emerald-500/50 p-6 rounded-md transition-all cursor-pointer h-full flex flex-col relative overflow-hidden glass-panel rim-light">
                    <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-500/0 via-emerald-500 to-emerald-500/0 opacity-0 group-hover:opacity-100 transition-opacity" />
                    
                    <h2 className="text-xl font-bold text-white mb-2">{event.event_name}</h2>
                    <div className="text-xs font-mono font-bold text-emerald-400 mb-4 bg-emerald-500/10 w-fit px-2 py-1 rounded">
                      TEAM {team?.team_name?.toUpperCase() || 'UNKNOWN'}
                    </div>
                    
                    <p className="text-zinc-400 text-sm line-clamp-3 mb-6 flex-1">
                      {event.problem_statement || 'No problem statement available.'}
                    </p>
                    
                    <div className="flex items-center justify-between text-xs text-zinc-500 border-t border-zinc-800/50 pt-4">
                      <div className="flex items-center gap-2">
                        <Calendar size={14} />
                        {new Date(event.imported_at).toLocaleDateString()}
                      </div>
                      <div className="flex items-center gap-1 text-emerald-500 group-hover:translate-x-1 transition-transform font-mono uppercase tracking-widest">
                        View Details <ChevronRight size={14} />
                      </div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
