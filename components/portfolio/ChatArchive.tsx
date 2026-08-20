import React from 'react';
import { MessageSquare, Bot, User } from 'lucide-react';

export default function ChatArchive({ data }: { data: any }) {
  const { chat } = data;

  if (!chat || chat.length === 0) {
    return (
      <div className="bg-zinc-900/30 border border-zinc-800/50 p-12 rounded-md text-center text-zinc-400 glass-panel">
        <MessageSquare className="mx-auto w-12 h-12 text-zinc-700 mb-4" />
        <p className="text-lg">No AI chat history available.</p>
        <p className="text-sm mt-2 text-zinc-500">The Neural Link agent was not engaged during this project.</p>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto h-[70vh] flex flex-col bg-zinc-900/40 border border-zinc-800 rounded-md overflow-hidden glass-panel">
      <div className="p-4 border-b border-zinc-800/80 bg-zinc-950/80 flex items-center justify-between shrink-0">
        <h2 className="text-lg font-bold text-white flex items-center gap-3">
          <MessageSquare className="text-emerald-500" /> Neural Link Archive
        </h2>
        <div className="text-xs font-mono font-bold text-zinc-500 uppercase tracking-widest">
          {chat.length} Transmissions
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        {chat.map((msg: any) => {
          const isModel = msg.role === 'model';
          return (
            <div key={msg.id} className={`flex gap-4 max-w-[85%] ${isModel ? 'mr-auto' : 'ml-auto flex-row-reverse'}`}>
              <div className="shrink-0 pt-1">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center border ${
                  isModel 
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-500' 
                    : 'bg-zinc-800 border-zinc-700 text-zinc-400'
                }`}>
                  {isModel ? <Bot size={16} /> : <User size={16} />}
                </div>
              </div>
              
              <div className={`flex flex-col ${isModel ? 'items-start' : 'items-end'}`}>
                <div className="flex items-center gap-2 mb-1 px-1">
                  <span className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
                    {isModel ? 'Neural Link AI' : 'Participant'}
                  </span>
                  {!isModel && msg.user_role && (
                    <span className="text-[9px] font-mono font-bold bg-zinc-800 text-zinc-400 px-1.5 py-0.5 rounded border border-zinc-700 uppercase">
                      {msg.user_role}
                    </span>
                  )}
                  <span className="text-[10px] font-mono text-zinc-600">
                    {new Date(msg.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </span>
                </div>
                
                <div className={`p-4 rounded-md text-sm whitespace-pre-wrap ${
                  isModel
                    ? 'bg-zinc-950/80 border border-zinc-800/80 text-zinc-300 rounded-tl-sm'
                    : 'bg-emerald-500/10 border border-emerald-500/20 text-emerald-50 rounded-tr-sm'
                }`}>
                  {msg.parts}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
