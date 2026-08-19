'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';
import { Save, RefreshCw, GitBranch as Github, CheckCircle2, Server, Activity, ArrowRight, LayoutDashboard, Settings, Info } from 'lucide-react';
import Link from 'next/link';

export default function LabConfigPage() {
  const params = useParams();
  const projectId = params.id as string;
  const supabase = createClient();

  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [syncCount, setSyncCount] = useState<number | null>(null);

  const [config, setConfig] = useState({
    repo_url: '',
    deployment_url: '',
    db_health_endpoint: '',
  });

  const [origin, setOrigin] = useState('');

  useEffect(() => {
    setOrigin(window.location.origin);
    fetchConfig();
  }, [projectId]);

  const fetchConfig = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('lab_config')
        .select('*')
        .eq('project_id', projectId)
        .single();
      
      if (data) {
        setConfig({
          repo_url: data.repo_url || '',
          deployment_url: data.deployment_url || '',
          db_health_endpoint: data.db_health_endpoint || '',
        });
      }
    } catch (error) {
      console.error('Error fetching config:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const { error } = await supabase.from('lab_config').upsert(
        {
          project_id: projectId,
          ...config,
        },
        { onConflict: 'project_id' }
      );
      if (error) throw error;
      alert('Configuration saved successfully');
    } catch (error) {
      console.error('Error saving config:', error);
      alert('Failed to save configuration');
    } finally {
      setIsSaving(false);
    }
  };

  const handleVerify = async () => {
    setIsVerifying(true);
    try {
      const { count, error } = await supabase
        .from('lab_commits')
        .select('*', { count: 'exact', head: true })
        .eq('project_id', projectId);
      
      if (error) throw error;
      setSyncCount(count || 0);
    } catch (error) {
      console.error('Error verifying sync:', error);
      alert('Failed to verify sync');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-zinc-950 flex justify-center items-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
      </div>
    );
  }

  return (
    <div className="flex-1 p-6 md:p-8 overflow-y-auto bg-zinc-950 text-zinc-200">
      <div className="max-w-6xl mx-auto space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-white tracking-tight flex items-center gap-3">
              <Settings className="h-8 w-8 text-emerald-500" />
              Lab Configuration
            </h1>
            <p className="text-zinc-400 mt-2 text-sm max-w-2xl">
              Configure external integrations, CI/CD webhooks, and monitoring endpoints for your project lab.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <Link 
              href={`/projects/${projectId}/lab`}
              className="flex items-center gap-2 px-4 py-2 bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-sm font-medium rounded-md border border-zinc-800 transition-colors"
            >
              <LayoutDashboard className="h-4 w-4" />
              Back to Lab
            </Link>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Main Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center gap-2 border-b border-zinc-800/50 pb-4">
                <Activity className="h-5 w-5 text-zinc-400" />
                <h2 className="text-lg font-semibold text-white">Environment Settings</h2>
              </div>
              
              <div className="space-y-6">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Github className="h-4 w-4 text-zinc-500" />
                    GitHub Repo URL
                  </label>
                  <input
                    type="text"
                    value={config.repo_url}
                    onChange={(e) => setConfig({ ...config, repo_url: e.target.value })}
                    placeholder="https://github.com/org/repo"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Server className="h-4 w-4 text-zinc-500" />
                    Deployment URL
                  </label>
                  <input
                    type="text"
                    value={config.deployment_url}
                    onChange={(e) => setConfig({ ...config, deployment_url: e.target.value })}
                    placeholder="https://project.vercel.app"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-zinc-500" />
                    DB Health Endpoint
                  </label>
                  <input
                    type="text"
                    value={config.db_health_endpoint}
                    onChange={(e) => setConfig({ ...config, db_health_endpoint: e.target.value })}
                    placeholder="https://api.your-app.com/health"
                    className="w-full bg-zinc-950 border border-zinc-800 rounded-md px-4 py-2.5 text-zinc-200 focus:outline-none focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/50 transition-all font-mono text-sm"
                  />
                </div>
              </div>

              <div className="mt-8 flex justify-end">
                <button
                  onClick={handleSave}
                  disabled={isSaving}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50 disabled:cursor-not-allowed shadow-sm shadow-emerald-900/20"
                >
                  {isSaving ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}
                  Save Configuration
                </button>
              </div>
            </div>
          </div>

          {/* Webhook Guide */}
          <div className="space-y-6">
            <div className="bg-zinc-900/50 border border-zinc-800/50 rounded-xl p-6 backdrop-blur-sm">
              <div className="mb-6 flex items-center gap-2 border-b border-zinc-800/50 pb-4">
                <Github className="h-5 w-5 text-zinc-400" />
                <h2 className="text-lg font-semibold text-white">Webhook Setup Guide</h2>
              </div>
              
              <div className="space-y-5 text-sm">
                <p className="text-zinc-400 leading-relaxed">
                  Configure your GitHub repository to send commit events to this lab environment.
                </p>

                <div className="space-y-4">
                  <div className="bg-zinc-950 rounded-md p-4 border border-zinc-800/80">
                    <div className="text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Payload URL</div>
                    <code className="text-emerald-400 font-mono text-xs break-all block">
                      {origin}/api/webhooks/github
                    </code>
                  </div>

                  <div className="bg-zinc-950 rounded-md p-4 border border-zinc-800/80">
                    <div className="text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Content type</div>
                    <code className="text-zinc-300 font-mono text-xs">application/json</code>
                  </div>

                  <div className="bg-zinc-950 rounded-md p-4 border border-zinc-800/80">
                    <div className="text-xs font-semibold text-zinc-500 mb-1.5 uppercase tracking-wider">Secret / Header</div>
                    <p className="text-zinc-400 text-xs mb-2">Add a custom header to your webhook:</p>
                    <code className="text-zinc-300 font-mono text-xs block bg-zinc-900 p-2 rounded border border-zinc-800">
                      x-project-id: {projectId}
                    </code>
                  </div>

                  <div className="bg-zinc-950 rounded-md p-4 border border-zinc-800/80 flex items-start gap-3">
                    <Info className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
                    <div className="text-xs text-zinc-400">
                      Select <span className="text-zinc-300 font-medium">Send me everything</span> or select <span className="text-zinc-300 font-medium">Push</span> and <span className="text-zinc-300 font-medium">Pull Request</span> events.
                    </div>
                  </div>
                </div>

                <div className="pt-4 border-t border-zinc-800/50">
                  <button
                    onClick={handleVerify}
                    disabled={isVerifying}
                    className="w-full flex items-center justify-center gap-2 px-4 py-2.5 bg-zinc-800 hover:bg-zinc-700 text-white text-sm font-medium rounded-md transition-colors disabled:opacity-50"
                  >
                    {isVerifying ? (
                      <RefreshCw className="h-4 w-4 animate-spin" />
                    ) : (
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    )}
                    Verify Sync
                  </button>
                  
                  {syncCount !== null && (
                    <div className="mt-4 p-3 bg-emerald-950/30 border border-emerald-900/50 rounded-md flex items-center gap-3">
                      <div className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse"></div>
                      <p className="text-xs text-emerald-300 font-medium">
                        {syncCount} commits synced successfully.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
