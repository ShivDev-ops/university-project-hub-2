import React from 'react';
import { Layout as Trello, GitBranch } from 'lucide-react';

export default function ReadOnlyKanban({ data }: { data: any }) {
  const { tasks } = data;
  const COLUMNS = ['Todo', 'Progress', 'Review', 'Verified', 'Bugs'];

  if (!tasks || tasks.length === 0) {
    return (
      <div className="bg-zinc-900/30 border border-zinc-800/50 p-12 rounded-2xl text-center text-zinc-400 glass-panel">
        <Trello className="mx-auto w-12 h-12 text-zinc-700 mb-4" />
        <p className="text-lg">No tasks found.</p>
        <p className="text-sm mt-2 text-zinc-500">Kanban data was not captured for this project.</p>
      </div>
    );
  }

  return (
    <div className="h-[70vh] flex flex-col">
      <div className="mb-6 flex items-center justify-between shrink-0">
        <h2 className="text-2xl font-bold text-white flex items-center gap-3">
          <Trello className="text-emerald-500" /> Task Board
        </h2>
        <div className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest bg-zinc-900/50 px-3 py-1.5 rounded-lg border border-zinc-800">
          {tasks.length} Total Objectives
        </div>
      </div>

      <div className="flex-1 grid grid-cols-5 gap-4 overflow-x-auto pb-4">
        {COLUMNS.map(column => {
          const colTasks = tasks.filter((t: any) => t.status === column);
          return (
            <div key={column} className="flex flex-col bg-zinc-900/40 border border-zinc-800/80 rounded-xl overflow-hidden glass-panel">
              <div className="p-3 border-b border-zinc-800/80 bg-zinc-950/50 flex justify-between items-center">
                <span className="text-xs font-bold text-zinc-400 uppercase tracking-widest">{column}</span>
                <span className="text-xs font-mono text-zinc-600 bg-zinc-900 px-2 py-0.5 rounded">{colTasks.length}</span>
              </div>
              
              <div className="flex-1 p-3 space-y-3 overflow-y-auto">
                {colTasks.map((task: any) => {
                  // Check if it has a phase tag [PHASE X]
                  const phaseMatch = task.title.match(/\[PHASE (\d+)\]/i);
                  const phase = phaseMatch ? phaseMatch[1] : null;
                  const displayTitle = task.title.replace(/\[PHASE \d+\]/i, '').trim();

                  return (
                    <div key={task.id} className="bg-zinc-950/80 p-4 rounded-lg border border-zinc-800 hover:border-emerald-500/30 transition-colors">
                      {phase && (
                        <div className="mb-2 text-[10px] font-bold font-mono text-emerald-500 bg-emerald-500/10 px-1.5 py-0.5 rounded w-fit uppercase">
                          Phase {phase}
                        </div>
                      )}
                      
                      <h3 className="text-sm font-bold text-zinc-200 mb-2 leading-tight">
                        {displayTitle}
                      </h3>
                      
                      {task.description && (
                        <p className="text-xs text-zinc-500 line-clamp-3 mb-3">
                          {task.description}
                        </p>
                      )}
                      
                      {task.commit_sha && (
                        <div className="flex items-center gap-1.5 pt-2 border-t border-zinc-800/50">
                          <GitBranch size={12} className="text-emerald-500" />
                          <span className="text-[10px] font-mono text-emerald-400 border border-emerald-500/20 bg-emerald-500/10 px-1 rounded">
                            {task.commit_sha.substring(0, 7)}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
