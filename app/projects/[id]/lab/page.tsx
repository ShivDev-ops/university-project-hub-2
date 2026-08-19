'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { 
  LabHeader, 
  GitFeed, 
  AuditPulse, 
  LabTask, 
  LabCommit, 
  LabLog 
} from '@/components/lab/LabComponents';
import KanbanBoard from '@/components/lab/KanbanBoard';
import NeuralLinkOverlay from '@/components/lab/NeuralLinkOverlay';
import { motion, AnimatePresence } from 'framer-motion';

export default function LabPage() {
  const params = useParams();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
  const supabase = createClient();
  
  const [tasks, setTasks] = useState<LabTask[]>([]);
  const [commits, setCommits] = useState<LabCommit[]>([]);
  const [logs, setLogs] = useState<LabLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Wiring State
  const [nodes, setNodes] = useState<Record<string, { id: string; x: number; y: number }>>({});
  const [activeDrag, setActiveDrag] = useState<{ fromId: string; currentPos: { x: number; y: number } } | null>(null);
  const [hoveredNodeId, setHoveredNodeId] = useState<string | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);

  // Fetch Initial Data
  useEffect(() => {
    if (!projectId) return;

    const fetchData = async () => {
      try {
        const [tasksRes, commitsRes, logsRes] = await Promise.all([
          supabase.from('lab_tasks').select('*').eq('project_id', projectId),
          supabase.from('lab_commits').select('*').eq('project_id', projectId),
          supabase.from('lab_telemetry_logs').select('*').eq('project_id', projectId).order('created_at', { ascending: false }).limit(20)
        ]);

        setTasks(Array.isArray(tasksRes.data) ? tasksRes.data : []);
        setCommits(Array.isArray(commitsRes.data) ? commitsRes.data : []);
        setLogs(Array.isArray(logsRes.data) ? logsRes.data : []);
      } catch (err) {
        console.error('Error fetching lab data:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();

    // Realtime Subscriptions
    const tasksChannel = supabase.channel(`lab_tasks_${projectId}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'lab_tasks', filter: `project_id=eq.${projectId}` }, (payload) => {
        if (payload.eventType === 'INSERT') setTasks(prev => [...prev, payload.new as LabTask]);
        if (payload.eventType === 'UPDATE') setTasks(prev => prev.map(t => t.id === payload.new.id ? payload.new as LabTask : t));
        if (payload.eventType === 'DELETE') setTasks(prev => prev.filter(t => t.id === payload.old.id));
      })
      .subscribe();

    const logsChannel = supabase.channel(`lab_logs_${projectId}`)
      .on('postgres_changes', { event: 'INSERT', schema: 'public', table: 'lab_telemetry_logs', filter: `project_id=eq.${projectId}` }, (payload) => {
        setLogs(prev => [payload.new as LabLog, ...prev.slice(0, 19)]);
      })
      .subscribe();

    return () => {
      supabase.removeChannel(tasksChannel);
      supabase.removeChannel(logsChannel);
    };
  }, [projectId, supabase]);

  // Port Positioning
  const updateNodePos = useCallback((id: string, el: HTMLElement) => {
    if (!containerRef.current) return;
    const containerRect = containerRef.current.getBoundingClientRect();
    const rect = el.getBoundingClientRect();
    const pos = {
      id,
      x: rect.left - containerRect.left + rect.width / 2,
      y: rect.top - containerRect.top + rect.height / 2
    };
    setNodes(prev => ({ ...prev, [id]: pos }));
  }, []);

  const handlePortClick = (id: string, el: HTMLElement) => {
    updateNodePos(id, el);
    if (!activeDrag) {
      setActiveDrag({ fromId: id, currentPos: nodes[id] || { x: 0, y: 0 } });
    } else {
      // Logic for linking (if it's a commit to a task)
      const fromCommit = commits.find(c => c.id === activeDrag.fromId);
      const toTask = tasks.find(t => t.id === id);
      
      if (fromCommit && toTask) {
        linkCommitToTask(fromCommit.commit_sha, toTask.id);
      }
      setActiveDrag(null);
    }
  };

  const linkCommitToTask = async (sha: string, taskId: string) => {
    await supabase.from('lab_tasks').update({ commit_sha: sha }).eq('id', taskId);
    await supabase.from('lab_telemetry_logs').insert({
      project_id: projectId,
      action_type: 'link',
      details: `Linked commit ${sha.slice(0, 7)} to task ${taskId.slice(0, 4)}`
    });
  };

  const handleTaskMove = async (taskId: string, newStatus: LabTask['status']) => {
    await supabase.from('lab_tasks').update({ status: newStatus }).eq('id', taskId);
    await supabase.from('lab_telemetry_logs').insert({
      project_id: projectId,
      action_type: 'move',
      details: `Moved task ${taskId.slice(0, 4)} to ${newStatus}`
    });
  };

  const links = tasks.filter(t => t.commit_sha).map(t => {
    const commit = commits.find(c => c.commit_sha === t.commit_sha);
    return commit ? { fromId: commit.id, toId: t.id } : null;
  }).filter(Boolean) as { fromId: string; toId: string }[];

  if (loading) return (
    <div className="h-full w-full bg-zinc-950 flex items-center justify-center">
      <div className="text-emerald-500 font-mono animate-pulse tracking-widest uppercase">Initializing Mission Control...</div>
    </div>
  );

  return (
    <div className="h-full flex flex-col bg-zinc-950 text-zinc-100 overflow-hidden font-sans selection:bg-emerald-500/30" ref={containerRef}>
      <LabHeader title="Lab Mission Control" status="online" />
      
      <main className="flex-1 grid grid-cols-12 overflow-hidden relative" 
        onMouseMove={(e) => {
          if (activeDrag && containerRef.current) {
            const rect = containerRef.current.getBoundingClientRect();
            setActiveDrag({ ...activeDrag, currentPos: { x: e.clientX - rect.left, y: e.clientY - rect.top } });
          }
        }}
      >
        {/* Neural Link Overlay */}
        <NeuralLinkOverlay 
          links={links} 
          nodes={nodes} 
          activeDrag={activeDrag}
          hoveredNodeId={hoveredNodeId}
        />

        {/* Cols 1-3: Git Feed */}
        <div className="col-span-3 h-full">
          <GitFeed 
            commits={commits} 
            onPortClick={handlePortClick}
          />
        </div>

        {/* Cols 4-12: Kanban Board */}
        <div className="col-span-9 h-full relative overflow-hidden bg-zinc-900/10">
          <KanbanBoard 
            tasks={tasks} 
            onTaskMove={handleTaskMove}
            onPortClick={handlePortClick}
            onDeleteTask={(id) => supabase.from('lab_tasks').delete().eq('id', id)}
            onDisconnectLink={(id) => supabase.from('lab_tasks').update({ commit_sha: null }).eq('id', id)}
          />
        </div>
      </main>

      {/* Footer */}
      <footer className="h-48 grid grid-cols-12 border-t border-emerald-500/10 bg-zinc-950/80 backdrop-blur-md">
        <div className="col-span-4 h-full border-r border-emerald-500/10">
          <AuditPulse logs={logs} />
        </div>
        <div className="col-span-8 h-full bg-black relative group">
          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/60 z-10">
            <span className="text-[10px] font-mono text-emerald-500 uppercase tracking-widest px-4 py-2 border border-emerald-500/20 bg-emerald-500/5 rounded">Live Uplink Active</span>
          </div>
          <iframe 
            src={`https://example-project-${projectId}.netlify.app`} 
            className="w-full h-full border-none grayscale-[0.5] contrast-[1.2] hover:grayscale-0 transition-all duration-700"
            title="Project Live Preview"
          />
        </div>
      </footer>

      {/* Global CSS for this page */}
      <style jsx global>{`
        .glass-panel {
          background: rgba(24, 24, 27, 0.4);
          backdrop-filter: blur(12px);
          -webkit-backdrop-filter: blur(12px);
        }
        .rim-light {
          box-shadow: inset 0 1px 1px 0 rgba(255, 255, 255, 0.05);
        }
        .no-scrollbar::-webkit-scrollbar {
          display: none;
        }
        .no-scrollbar {
          -ms-overflow-style: none;
          scrollbar-width: none;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.1);
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(16, 185, 129, 0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(16, 185, 129, 0.3);
        }
      `}</style>
    </div>
  );
}
