import React from 'react';
import { GitCommit, Clock, GitBranch as Github, ExternalLink, Calendar } from 'lucide-react';

export default function GitTimeline({ data }: { data: any }) {
  const { commits, tasks } = data;

  if (!commits || commits.length === 0) {
    return (
      <div className="bg-zinc-900/30 border border-zinc-800/50 p-12 rounded-2xl text-center text-zinc-400 glass-panel">
        <GitCommit className="mx-auto w-12 h-12 text-zinc-700 mb-4" />
        <p className="text-lg">No commit history available.</p>
        <p className="text-sm mt-2 text-zinc-500">Version control telemetry was not captured for this project.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-8 flex items-center justify-between">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Github className="text-emerald-500" /> Version Registry
        </h2>
        <div className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800">
          {commits.length} Commits Logged
        </div>
      </div>

      <div className="relative border-l border-emerald-500/20 ml-4 space-y-8 pb-8">
        {commits.map((commit: any) => {
          // Find if this commit is linked to any task
          const linkedTasks = tasks.filter((t: any) => t.commit_sha === commit.commit_sha);

          return (
            <div key={commit.id} className="relative pl-8">
              {/* Timeline Dot */}
              <div className="absolute -left-[5px] top-1.5 w-2.5 h-2.5 rounded-full bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]" />
              
              <div className="bg-zinc-900/40 border border-zinc-800 hover:border-emerald-500/30 transition-colors p-5 rounded-xl glass-panel">
                <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-3">
                  <div>
                    <h3 className="text-base font-bold text-zinc-200 leading-tight">
                      {commit.message}
                    </h3>
                    <div className="flex items-center gap-3 mt-2 text-xs font-mono text-zinc-500">
                      <span className="text-emerald-400">@{commit.author_handle}</span>
                      <span className="flex items-center gap-1">
                        <Calendar size={12} />
                        {new Date(commit.created_at).toLocaleString()}
                      </span>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="px-2 py-1 bg-zinc-950 rounded text-xs font-mono text-zinc-400 border border-zinc-800">
                      {commit.commit_sha.substring(0, 7)}
                    </div>
                    {commit.commit_url && (
                      <a 
                        href={commit.commit_url} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="p-1.5 bg-zinc-950 hover:bg-emerald-500/10 text-zinc-400 hover:text-emerald-400 rounded border border-zinc-800 hover:border-emerald-500/30 transition-all"
                      >
                        <ExternalLink size={14} />
                      </a>
                    )}
                  </div>
                </div>

                {/* Linked Tasks */}
                {linkedTasks.length > 0 && (
                  <div className="mt-4 pt-4 border-t border-zinc-800/50 space-y-2">
                    {linkedTasks.map((task: any) => (
                      <div key={task.id} className="flex items-center gap-2 text-xs">
                        <div className="px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono text-[10px] uppercase">
                          Neural Link
                        </div>
                        <span className="text-zinc-400 truncate">{task.title}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
