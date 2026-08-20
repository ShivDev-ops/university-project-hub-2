import React from 'react';
import { Users, GitBranch as Github, Globe, BrainCircuit, Target, Trophy, Quote } from 'lucide-react';

export default function OverviewDashboard({ data }: { data: any }) {
  const { event, team, members, judging } = data;

  return (
    <div className="space-y-8">
      {/* Top Section: Event & Team Info */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 bg-zinc-900/40 border border-zinc-800 rounded-md p-6 glass-panel">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-2">Problem Statement</h2>
          <div className="prose prose-invert max-w-none text-zinc-300">
            {event.problem_statement || 'No problem statement provided for this event.'}
          </div>
        </div>

        <div className="bg-zinc-900/40 border border-zinc-800 rounded-md p-6 glass-panel flex flex-col">
          <h2 className="text-sm font-bold text-zinc-500 uppercase tracking-widest mb-4">Team Overview</h2>
          <div className="text-2xl font-black text-white mb-6">{team?.team_name || 'Unknown'}</div>
          
          <div className="space-y-3 mb-8 flex-1">
            {members.map((m: any) => (
              <div key={m.id} className="flex items-center gap-3 bg-zinc-950/50 p-3 rounded-sm border border-zinc-800/50">
                <div className="w-8 h-8 rounded bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-500 font-bold text-xs">
                  {m.role === 'LEAD' ? 'LD' : 'MB'}
                </div>
                <div>
                  <div className="text-sm font-bold text-zinc-200">{m.name || 'Anonymous'}</div>
                  <div className="text-xs font-mono text-zinc-500">{m.registration_no || m.email || 'No Details'}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="space-y-2">
            {team?.repo_url && (
              <a href={team.repo_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors p-2 bg-zinc-950/50 rounded border border-zinc-800/50">
                <Github size={16} /> Repository
              </a>
            )}
            {team?.deployment_url && (
              <a href={team.deployment_url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-sm text-zinc-400 hover:text-emerald-400 transition-colors p-2 bg-zinc-950/50 rounded border border-zinc-800/50">
                <Globe size={16} /> Live Deployment
              </a>
            )}
          </div>
        </div>
      </div>

      {/* AI Evaluation Section */}
      {judging && (
        <div className="bg-zinc-900/40 border border-zinc-800 rounded-md p-6 glass-panel">
          <div className="flex items-center gap-3 mb-6">
            <BrainCircuit className="text-emerald-500" />
            <h2 className="text-lg font-bold text-white uppercase tracking-widest">AI Audit & Evaluation</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div>
              <div className="flex items-end gap-4 mb-8">
                <div className="text-6xl font-black font-mono text-emerald-400">{judging.total_score || 0}</div>
                <div className="text-sm font-bold text-zinc-500 uppercase tracking-widest pb-2">/ 100 Overall Score</div>
              </div>
              
              <div className="space-y-4">
                {[
                  { label: 'Alignment', score: judging.alignment_score },
                  { label: 'Execution', score: judging.execution_score },
                  { label: 'Innovation', score: judging.innovation_score },
                  { label: 'Technical', score: judging.technical_score }
                ].map(metric => (
                  <div key={metric.label}>
                    <div className="flex justify-between text-xs font-bold text-zinc-400 uppercase tracking-wider mb-1">
                      <span>{metric.label}</span>
                      <span className="text-white">{metric.score || 0}%</span>
                    </div>
                    <div className="h-2 w-full bg-zinc-800 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-emerald-500/50 rounded-full" 
                        style={{ width: `${metric.score || 0}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-950/50 border border-zinc-800/50 p-6 rounded-md relative">
              <Quote className="absolute top-4 right-4 text-zinc-800 w-12 h-12" />
              <h3 className="text-xs font-bold text-emerald-500/70 uppercase tracking-widest mb-4">Neural Link Justification</h3>
              <p className="text-zinc-300 text-sm leading-relaxed relative z-10 italic">
                "{judging.ai_justification || 'No justification provided.'}"
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
