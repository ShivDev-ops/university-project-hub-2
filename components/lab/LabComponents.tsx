'use client';

import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, GitBranch, Cpu, Database, Activity, Globe, Info, Trash2, Link2Off } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface LabTask {
  id: string;
  title: string;
  description: string;
  status: 'Todo' | 'Progress' | 'Review' | 'Verified';
  commit_sha?: string;
}

export interface LabCommit {
  id: string;
  message: string;
  author_handle: string;
  commit_sha: string;
}

export interface LabLog {
  id: string;
  action_type: string;
  details: string;
  created_at: string;
}

// --- Components ---

export const LabHeader = ({ title, status }: { title: string; status: 'online' | 'offline' }) => (
  <header className="flex items-center justify-between px-6 py-4 bg-zinc-950/50 border-b border-emerald-500/20 backdrop-blur-xl">
    <div className="flex items-center gap-6">
      <div className="flex items-center gap-2">
        <Globe className={cn("w-4 h-4", status === 'online' ? "text-emerald-500 animate-pulse" : "text-zinc-600")} />
        <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-400">Uplink: {status.toUpperCase()}</span>
      </div>
      <div className="flex items-center gap-2">
        <Database className="w-4 h-4 text-emerald-500/50" />
        <span className="text-[10px] uppercase tracking-widest font-mono text-zinc-400">Registry: 24ms</span>
      </div>
    </div>
    <h1 className="text-4xl font-black tracking-tighter text-emerald-500 uppercase">{title}</h1>
    <div className="flex items-center gap-2">
      <Activity className="w-4 h-4 text-emerald-500" />
      <span className="text-[10px] uppercase tracking-widest font-mono text-emerald-500/80">System Live</span>
    </div>
  </header>
);

export const GitFeed = ({ commits, onPortClick }: { commits: LabCommit[], onPortClick?: (id: string, el: HTMLElement) => void }) => (
  <div className="h-full border-r border-emerald-500/10 bg-zinc-950/20 p-4 overflow-y-auto">
    <div className="flex items-center gap-2 mb-4">
      <GitBranch className="w-4 h-4 text-emerald-500" />
      <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-500/50">Version Registry</span>
    </div>
    <div className="space-y-2">
      {commits.map((commit) => (
        <div key={commit.id} className="group relative p-3 rounded bg-zinc-900/50 border border-zinc-800 hover:border-emerald-500/30 transition-all">
          <div className="text-[13px] text-zinc-300 font-mono truncate">{commit.message}</div>
          <div className="flex items-center justify-between mt-1">
            <span className="text-[10px] text-zinc-500 font-mono">{commit.commit_sha.slice(0, 7)}</span>
            <button 
              className="w-2 h-2 rounded-full bg-emerald-500/20 border border-emerald-500/40 hover:bg-emerald-500 cursor-crosshair transition-colors"
              onClick={(e) => onPortClick?.(commit.id, e.currentTarget)}
            />
          </div>
        </div>
      ))}
    </div>
  </div>
);

export const TaskCard = ({ task, onPortClick, onDelete, onDisconnect }: { task: LabTask, onPortClick?: (id: string, el: HTMLElement) => void, onDelete?: (id: string) => void, onDisconnect?: (id: string) => void }) => (
  <motion.div
    layoutId={task.id}
    whileDrag={{ scale: 0.8 }}
    transition={{ type: "spring", stiffness: 500, damping: 30 }}
    className="group relative p-4 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500/30 transition-shadow glass-panel rim-light"
  >
    <div className="flex items-start justify-between mb-2">
      <div className="w-2 h-2 rounded-full bg-zinc-800 border border-zinc-700 cursor-crosshair hover:bg-emerald-500 transition-colors"
        onClick={(e) => onPortClick?.(task.id, e.currentTarget)}
      />
      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        {task.commit_sha && (
          <button onClick={() => onDisconnect?.(task.id)} className="p-1 hover:text-emerald-500 text-zinc-500">
            <Link2Off size={12} />
          </button>
        )}
        <button onClick={() => onDelete?.(task.id)} className="p-1 hover:text-red-500 text-zinc-500">
          <Trash2 size={12} />
        </button>
      </div>
    </div>
    <h3 className="text-[15px] font-bold text-zinc-100 mb-1">{task.title}</h3>
    <p className="text-[13px] text-zinc-400 line-clamp-2 mb-3">{task.description}</p>
    {task.commit_sha && (
      <div className="flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/5 border border-emerald-500/20 w-fit">
        <GitBranch size={10} className="text-emerald-500" />
        <span className="text-[10px] font-mono text-emerald-400">{task.commit_sha.slice(0, 7)}</span>
      </div>
    )}
  </motion.div>
);

export const AuditPulse = ({ logs }: { logs: LabLog[] }) => (
  <div className="flex items-center h-full px-4 gap-4 overflow-hidden">
    <div className="flex items-center gap-2 whitespace-nowrap">
      <Activity className="w-3 h-3 text-emerald-500" />
      <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-500/50">Telemetry Logs</span>
    </div>
    <div className="flex gap-6 overflow-x-auto no-scrollbar">
      {logs.map((log) => (
        <div key={log.id} className="flex gap-2 items-center whitespace-nowrap">
          <span className="text-[10px] text-emerald-500/80 font-mono">[{log.action_type.toUpperCase()}]</span>
          <span className="text-[10px] text-zinc-500 font-mono">// {log.details}</span>
        </div>
      ))}
    </div>
  </div>
);
