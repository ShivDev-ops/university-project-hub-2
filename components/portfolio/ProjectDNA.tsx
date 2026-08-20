import React from 'react';
import { Cpu, CheckCircle2, Clock, Loader2 } from 'lucide-react';

export default function ProjectDNA({ data }: { data: any }) {
  const { dna } = data;

  if (!dna || dna.length === 0) {
    return (
      <div className="bg-zinc-900/30 border border-zinc-800/50 p-12 rounded-md text-center text-zinc-400 glass-panel">
        <Cpu className="mx-auto w-12 h-12 text-zinc-700 mb-4" />
        <p className="text-lg">No Project DNA found.</p>
        <p className="text-sm mt-2 text-zinc-500">AI milestone synthesis was not generated for this project.</p>
      </div>
    );
  }

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'complete': return { icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/10', border: 'border-emerald-500/30' };
      case 'in_progress': return { icon: Loader2, color: 'text-amber-500', bg: 'bg-amber-500/10', border: 'border-amber-500/30', animate: 'animate-spin' };
      case 'pending':
      default: return { icon: Clock, color: 'text-zinc-500', bg: 'bg-zinc-800', border: 'border-zinc-700' };
    }
  };

  return (
    <div className="max-w-5xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Cpu className="text-emerald-500" /> Synthesized Milestones
        </h2>
        <div className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900/50 px-3 py-1.5 rounded-sm border border-zinc-800">
          {dna.length} Core Nodes
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {dna.map((milestone: any) => {
          const statusConfig = getStatusConfig(milestone.status);
          const StatusIcon = statusConfig.icon;

          return (
            <div key={milestone.id} className="bg-zinc-900/40 border border-zinc-800 rounded-md p-6 glass-panel relative overflow-hidden flex flex-col">
              {/* Weight indicator background bar */}
              <div 
                className="absolute top-0 left-0 h-1 bg-emerald-500/30"
                style={{ width: `${milestone.weight || 0}%` }}
              />
              
              <div className="flex justify-between items-start mb-4">
                <div className={`p-2 rounded-sm border ${statusConfig.bg} ${statusConfig.border} shrink-0`}>
                  <StatusIcon size={20} className={`${statusConfig.color} ${statusConfig.animate || ''}`} />
                </div>
                <div className="text-right">
                  <div className="text-2xl font-black font-mono text-emerald-400 leading-none mb-1">
                    {milestone.weight || 0}%
                  </div>
                  <div className="text-[10px] font-bold text-zinc-500 uppercase tracking-widest">Weight</div>
                </div>
              </div>

              <h3 className="text-lg font-bold text-white mb-2">{milestone.milestone_title}</h3>
              <p className="text-sm text-zinc-400 mb-6 flex-1">{milestone.milestone_description}</p>
              
              <div className="mt-auto">
                <div className="text-xs font-bold text-zinc-500 uppercase tracking-widest mb-2">Verification Criteria</div>
                <div className="bg-zinc-950/50 p-4 rounded-md border border-zinc-800/50 text-xs text-zinc-300 font-mono leading-relaxed">
                  {milestone.verification_criteria}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
