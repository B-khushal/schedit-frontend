import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, FolderOpen, Clock, Users, Layers, Share2, Sparkles, HardDrive, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { useWorkspace } from '../contexts/WorkspaceContext';
import { cn } from '../lib/utils';

export function Projects() {
  const { currentOrg, setCurrentProject, refreshWorkspace } = useWorkspace();
  const [projects, setProjects] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function loadProjects() {
    if (!currentOrg) return;
    setLoading(true);
    try {
      const data = await apiRequest<any[]>(`/api/v1/organizations/${currentOrg.id}/projects`);
      setProjects(data || []);
    } catch (err) {
      console.error('Error fetching projects:', err);
      setProjects(currentOrg.projects || []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (currentOrg) {
      loadProjects();
    }
  }, [currentOrg]);

  const handleCreateProject = async () => {
    if (!name.trim() || !currentOrg) return;
    setSubmitting(true);
    setError(null);
    try {
      const slug = name.toLowerCase().replace(/[^a-z0-9-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

      await apiRequest('/api/v1/projects', {
        method: 'POST',
        body: JSON.stringify({
          organizationId: currentOrg.id,
          name,
          slug,
          description,
        }),
      });

      setName('');
      setDescription('');
      setShowModal(false);
      await refreshWorkspace();
      loadProjects();
    } catch (err: any) {
      setError(err.message || 'Failed to create workspace project.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredProjects = projects.filter((p) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      p.name?.toLowerCase().includes(q) ||
      p.description?.toLowerCase().includes(q) ||
      p.slug?.toLowerCase().includes(q)
    );
  });

  return (
    <div className="p-4 md:p-8 max-w-[1600px] mx-auto space-y-8 w-full font-sans">
      {/* Page Header */}
      <div className="neu-card p-6 rounded-2xl flex flex-col md:flex-row justify-between items-start md:items-center gap-4 flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-xl neu-well flex items-center justify-center text-blue-600 shrink-0">
              <FolderOpen className="w-5 h-5" />
            </div>
            <h1 className="text-2xl font-bold text-[var(--neu-text-primary)] font-display tracking-tight truncate">Workspace Projects</h1>
          </div>
          <p className="text-xs sm:text-sm text-[var(--neu-text-secondary)] font-medium mt-1">
            Real-time brand workspaces, social connections, post queues, and team assignments for <strong>{currentOrg?.name || 'Workspace'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="neu-input w-full pl-10 pr-4 py-2.5 text-xs font-medium"
            />
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="neu-button-primary px-4 py-2.5 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-2 shrink-0 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xs p-4 animate-fade-in">
          <div className="neu-card rounded-2xl max-w-md w-full p-6 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-[var(--neu-text-primary)]">Create Project Workspace</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-[var(--neu-text-primary)] font-bold text-xl cursor-pointer">×</button>
            </div>

            {error && (
              <div className="p-3 bg-red-500/10 border border-red-500/20 text-red-600 text-xs rounded-xl">
                {error}
              </div>
            )}

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-[var(--neu-text-secondary)] font-bold mb-1.5">Project Brand Name</label>
                <input
                  type="text"
                  placeholder="e.g. Acme Corp, Brand Strategy Q4"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="neu-input w-full px-3.5 py-2.5 text-xs"
                />
              </div>

              <div>
                <label className="block text-[var(--neu-text-secondary)] font-bold mb-1.5">Description (Optional)</label>
                <textarea
                  placeholder="Describe the scope, objectives, or target audience for this project..."
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows={3}
                  className="neu-input w-full p-3 text-xs"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="neu-raised px-4 py-2 rounded-xl text-xs font-bold text-[var(--neu-text-secondary)] cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                disabled={submitting || !name.trim()}
                onClick={handleCreateProject}
                className="neu-button-primary px-5 py-2 rounded-xl text-xs font-bold text-white cursor-pointer disabled:opacity-50"
              >
                {submitting ? 'Creating...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-16 text-[var(--neu-text-secondary)] font-semibold text-xs">
          Loading workspace projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 neu-well rounded-3xl p-8 space-y-3">
          <FolderOpen className="w-12 h-12 mx-auto text-gray-400 opacity-60" />
          <h3 className="text-base font-bold text-[var(--neu-text-primary)]">No Projects Found</h3>
          <p className="text-xs text-[var(--neu-text-secondary)] max-w-sm mx-auto">
            {searchQuery ? `No project matches "${searchQuery}".` : 'Create your first project workspace to start connecting social accounts and scheduling content.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project, i) => {
            const accountsCount = project._count?.socialAccounts ?? project.socialAccounts?.length ?? 0;
            const postsCount = project._count?.scheduledPosts ?? 0;
            const assetsCount = project._count?.assets ?? 0;

            const totalFollowers = Array.isArray(project.socialAccounts)
              ? project.socialAccounts.reduce((sum: number, acc: any) => sum + (acc.followerCount || 0), 0)
              : 0;

            return (
              <Link 
                key={project.id} 
                to={`/app/projects/${project.id}`}
                onClick={() => setCurrentProject(project)}
              >
                <div 
                  className="neu-card rounded-2xl p-6 hover:neu-card-hover transition-all flex flex-col h-full cursor-pointer relative overflow-hidden space-y-4"
                >
                  <div className="flex justify-between items-start">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl neu-raised bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-xs">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-[var(--neu-text-primary)] text-base line-clamp-1">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 neu-inset px-2 py-0.5 rounded-md">
                            PROJECT
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={cn(
                      "px-2.5 py-0.5 rounded-full text-[10px] font-bold neu-inset",
                      project.status === 'ARCHIVED' ? 'text-gray-500' : 'text-emerald-600'
                    )}>
                      {project.status === 'ARCHIVED' ? 'Archived' : 'Active'}
                    </span>
                  </div>

                  <p className="text-xs text-[var(--neu-text-secondary)] font-medium line-clamp-2 min-h-[36px] leading-relaxed">
                    {project.description || 'Dedicated workspace for social account publishing, content approval workflows, and asset storage.'}
                  </p>

                  {/* Real Stats Grid */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="neu-well p-3.5 rounded-2xl">
                      <span className="text-[11px] font-bold text-[var(--neu-text-secondary)] block mb-0.5">Scheduled Posts</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-bold text-[var(--neu-text-primary)]">{postsCount}</span>
                        <Layers className="w-4 h-4 text-blue-500" />
                      </div>
                    </div>

                    <div className="neu-well p-3.5 rounded-2xl">
                      <span className="text-[11px] font-bold text-[var(--neu-text-secondary)] block mb-0.5">Total Audience</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-bold text-[var(--neu-text-primary)]">
                          {totalFollowers > 0 ? totalFollowers.toLocaleString() : '0'}
                        </span>
                        <Users className="w-4 h-4 text-indigo-500" />
                      </div>
                    </div>
                  </div>

                  {/* Footer Real Metrics */}
                  <div className="mt-auto pt-3 border-t border-black/5 dark:border-white/5 flex items-center justify-between text-xs">
                    <div className="flex items-center gap-3 text-[var(--neu-text-secondary)] font-semibold">
                      <div className="flex items-center gap-1.5">
                        <Share2 className="w-3.5 h-3.5 text-blue-600" />
                        <span>{accountsCount} Accounts</span>
                      </div>
                      <span>•</span>
                      <div className="flex items-center gap-1.5">
                        <HardDrive className="w-3.5 h-3.5 text-amber-500" />
                        <span>{assetsCount} Assets</span>
                      </div>
                    </div>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
