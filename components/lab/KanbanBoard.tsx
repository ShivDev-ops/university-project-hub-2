'use client';

import React, { useState, useEffect, useRef } from 'react';
import { motion, Reorder } from 'framer-motion';
import { LabTask, TaskCard } from './LabComponents';

interface KanbanBoardProps {
  tasks: LabTask[];
  onTaskMove: (taskId: string, newStatus: LabTask['status']) => void;
  onPortClick?: (id: string, el: HTMLElement) => void;
  onDeleteTask?: (id: string) => void;
  onDisconnectLink?: (id: string) => void;
}

const COLUMNS: LabTask['status'][] = ['Todo', 'Progress', 'Review', 'Verified'];

const KanbanBoard: React.FC<KanbanBoardProps> = ({ tasks, onTaskMove, onPortClick, onDeleteTask, onDisconnectLink }) => {
  return (
    <div className="grid grid-cols-4 gap-4 h-full p-4">
      {COLUMNS.map((status) => (
        <div key={status} className="flex flex-col h-full bg-zinc-950/20 rounded-md border border-zinc-900/50">
          <div className="p-3 border-b border-zinc-900/50 flex items-center justify-between">
            <span className="text-[11px] font-bold uppercase tracking-[0.2em] text-zinc-500">{status}</span>
            <span className="text-[10px] font-mono text-zinc-600">{tasks.filter(t => t.status === status).length}</span>
          </div>
          
          <div 
            className="flex-1 p-3 space-y-3 overflow-y-auto custom-scrollbar"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              const taskId = e.dataTransfer.getData('taskId');
              if (taskId) onTaskMove(taskId, status);
            }}
          >
            {tasks
              .filter((t) => t.status === status)
              .map((task) => (
                <div 
                  key={task.id}
                  draggable
                  onDragStart={(e) => e.dataTransfer.setData('taskId', task.id)}
                >
                  <TaskCard 
                    task={task} 
                    onPortClick={onPortClick} 
                    onDelete={onDeleteTask}
                    onDisconnect={onDisconnectLink}
                  />
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default KanbanBoard;
