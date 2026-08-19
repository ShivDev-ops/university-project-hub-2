'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { createClient } from '@/lib/supabase/client';
import { usePathname, useParams } from 'next/navigation';
import { Terminal, Settings, Menu, X } from 'lucide-react';

export default function LabLayout({ children }: { children: React.ReactNode }) {
  const params = useParams();
  const pathname = usePathname();
  const projectId = Array.isArray(params.id) ? params.id[0] : params.id;
  
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [projectTitle, setProjectTitle] = useState<string | null>(null);

  useEffect(() => {
    async function fetchProject() {
      if (!projectId) return;
      try {
        const res = await fetch(`/api/projects/${projectId}`);
        if (res.ok) {
          const data = await res.json();
          setProjectTitle(data.title);
        }
      } catch (err) {
        console.error('Failed to fetch project title', err);
      }
    }
    fetchProject();
  }, [projectId]);

  const navItems = [
    { name: 'Mission Control', href: `/projects/${projectId}/lab`, icon: Terminal },
    { name: 'Configuration', href: `/projects/${projectId}/lab/config`, icon: Settings },
  ];

  return (
    <div className="pt-[60px] h-screen bg-zinc-950 flex overflow-hidden">
      {/* Mobile Sidebar Toggle */}
      <div className="md:hidden absolute top-[70px] left-4 z-50">
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-2 text-zinc-400 hover:text-white bg-zinc-900 border border-zinc-800 rounded-md transition-colors"
        >
          {mobileMenuOpen ? <X size={20} /> : <Menu size={20} />}
        </button>
      </div>

      {/* Sidebar */}
      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-zinc-950 border-r border-zinc-800 
        transform transition-transform duration-300 ease-in-out md:pt-0 pt-[60px]
        ${mobileMenuOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        <div className="h-full flex flex-col pt-6 pb-4">
          <div className="px-6 mb-8 flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
              <h2 className="text-[10px] text-zinc-100 uppercase tracking-widest font-mono">Lab Portal</h2>
            </div>
            {projectTitle && (
              <div className="mt-2 text-sm font-bold text-zinc-300 truncate" title={projectTitle}>
                {projectTitle}
              </div>
            )}
          </div>
          
          <nav className="flex-1 px-4 space-y-2">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              const Icon = item.icon;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`
                    flex items-center gap-3 px-3 py-2 rounded-md text-[10px] uppercase tracking-widest font-mono transition-colors
                    ${isActive 
                      ? 'bg-white text-black' 
                      : 'text-zinc-400 hover:text-white hover:bg-zinc-900'
                    }
                  `}
                >
                  <Icon size={16} />
                  {item.name}
                </Link>
              );
            })}
          </nav>
          
          <div className="px-4 mt-auto">
            <Link 
              href="/dashboard" 
              className="flex items-center gap-3 px-3 py-2 rounded-md text-[10px] uppercase tracking-widest font-mono text-zinc-500 hover:text-white transition-colors"
            >
              <span className="material-symbols-outlined" style={{fontSize: '16px'}}>arrow_back</span>
              Exit to Dashboard
            </Link>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-hidden h-full">
        {children}
      </main>

      {/* Mobile Overlay */}
      {mobileMenuOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-30 md:hidden"
          onClick={() => setMobileMenuOpen(false)}
        />
      )}
    </div>
  );
}
