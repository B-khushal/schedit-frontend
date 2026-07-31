import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Plus, Search, FolderOpen, Clock, Users, Layers, Share2, Sparkles, HardDrive, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { apiRequest } from '../lib/api';
import { useWorkspace } from '../contexts/WorkspaceContext';

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
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-4 sm:p-6 rounded-2xl border border-slate-200/90 shadow-sm flex-wrap">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <FolderOpen className="w-6 h-6 text-brand-600 shrink-0" />
            <h1 className="text-2xl font-black text-slate-900 tracking-tight truncate">Workspace Projects</h1>
          </div>
          <p className="text-xs sm:text-sm text-slate-500 font-medium mt-1">
            Real-time brand workspaces, social connections, post queues, and team assignments for <strong>{currentOrg?.name || 'Workspace'}</strong>.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto shrink-0 flex-wrap sm:flex-nowrap">
          <div className="relative flex-1 md:w-64">
            <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none" />
            <input 
              type="text" 
              placeholder="Search projects..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-medium focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-slate-900 placeholder:text-slate-400"
            />
          </div>

          <button 
            onClick={() => setShowModal(true)}
            className="px-4 py-2.5 bg-brand-600 hover:bg-brand-700 text-white text-xs font-bold rounded-xl shadow-md shadow-brand-600/20 transition-all flex items-center justify-center gap-2 shrink-0 min-h-[42px] whitespace-nowrap cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>New Project</span>
          </button>
        </div>
      </div>

      {/* New Project Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4 animate-fade-in">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-md w-full p-5 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-black text-slate-900">Create Project Workspace</h2>
              <button onClick={() => setShowModal(false)} className="text-slate-400 hover:text-slate-600 font-bold">×</button>
            </div>

            {error && (
              <div className="p-3 text-xs font-semibold text-rose-700 bg-rose-50 rounded-xl border border-rose-200">
                {error}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Project Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Nike Global Socials"
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-xs font-semibold text-slate-900"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-1.5">Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Brand description or campaign objectives..."
                  rows={3}
                  className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-brand-500/30 text-xs font-semibold text-slate-900 resize-none"
                />
              </div>
            </div>

            <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
              <button
                type="button"
                onClick={() => setShowModal(false)}
                className="px-4 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-2xl transition-colors border border-slate-200"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCreateProject}
                disabled={submitting || !name.trim()}
                className="px-5 py-2.5 bg-brand-600 hover:bg-brand-700 disabled:opacity-50 text-white text-xs font-bold rounded-2xl shadow-md transition-all"
              >
                {submitting ? 'Creating Project...' : 'Create Project'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Projects Grid */}
      {loading ? (
        <div className="text-center py-16 text-slate-400 font-semibold text-xs">
          Loading workspace projects...
        </div>
      ) : filteredProjects.length === 0 ? (
        <div className="text-center py-16 border-2 border-dashed border-slate-200 rounded-3xl bg-white text-slate-500 p-8 space-y-3">
          <FolderOpen className="w-10 h-10 mx-auto text-slate-300" />
          <h3 className="text-base font-bold text-slate-800">No Projects Found</h3>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            {searchQuery ? `No project matches "${searchQuery}".` : 'Create your first project workspace to start connecting social accounts and scheduling content.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredProjects.map((project, i) => {
            const accountsCount = project._count?.socialAccounts ?? project.socialAccounts?.length ?? 0;
            const postsCount = project._count?.scheduledPosts ?? 0;
            const membersCount = project._count?.members ?? project.members?.length ?? 1;
            const assetsCount = project._count?.assets ?? 0;

            // Calculate total real audience from connected social accounts
            const totalFollowers = Array.isArray(project.socialAccounts)
              ? project.socialAccounts.reduce((sum: number, acc: any) => sum + (acc.followerCount || 0), 0)
              : 0;

            const membersList = project.members || [];

            return (
              <Link 
                key={project.id} 
                to={`/app/projects/${project.id}`}
                onClick={() => setCurrentProject(project)}
              >
                <motion.div 
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.04 }}
                  className="bg-white border border-slate-200/90 rounded-2xl p-4 sm:p-6 hover:border-brand-500/50 hover:shadow-xl hover:shadow-brand-500/5 transition-all group flex flex-col h-full cursor-pointer relative overflow-hidden"
                >
                  <div className="flex justify-between items-start mb-5 relative z-10">
                    <div className="flex items-center gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-600 text-white flex items-center justify-center font-black text-xl shadow-md shadow-brand-600/20 group-hover:scale-105 transition-transform">
                        {project.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-extrabold text-slate-900 text-base group-hover:text-brand-600 transition-colors line-clamp-1">
                          {project.name}
                        </h3>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-[10px] font-extrabold uppercase tracking-wider text-brand-700 bg-brand-50 px-2 py-0.5 rounded-md border border-brand-100">
                            PROJECT
                          </span>
                        </div>
                      </div>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold ${
                      project.status === 'ARCHIVED'
                        ? 'bg-slate-100 text-slate-600 border border-slate-200'
                        : 'bg-emerald-50 text-emerald-700 border border-emerald-200/80'
                    }`}>
                      {project.status === 'ARCHIVED' ? 'Archived' : 'Active'}
                    </span>
                  </div>

                  <p className="text-xs text-slate-500 font-medium mb-6 relative z-10 line-clamp-2 min-h-[36px]">
                    {project.description || 'Dedicated workspace for social account publishing, content approval workflows, and asset storage.'}
                  </p>

                  {/* Real Stats Grid */}
                  <div className="grid grid-cols-2 gap-3 mb-6 relative z-10">
                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                      <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Scheduled Posts</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-black text-slate-900">{postsCount}</span>
                        <Layers className="w-4 h-4 text-brand-500" />
                      </div>
                    </div>

                    <div className="bg-slate-50 p-3.5 rounded-2xl border border-slate-200/70">
                      <span className="text-[11px] font-bold text-slate-400 block mb-0.5">Total Audience</span>
                      <div className="flex items-baseline justify-between">
                        <span className="text-lg font-black text-slate-900">
                          {totalFollowers > 0 ? totalFollowers.toLocaleString() : '0'}
                        </span>
                        <Users className="w-4 h-4 text-indigo-500" />
                      </div>
                    </div>
                  </div>

                  {/* Footer Real Metrics */}
                  <div className="mt-auto pt-4 border-t border-slate-100 flex items-center justify-between relative z-10 text-xs">
                    <div className="flex items-center gap-3 text-slate-600 font-semibold">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <Share2 className="w-3.5 h-3.5 text-brand-600" />
                        <span>{accountsCount} Accounts</span>
                      </div>
                      <span className="text-slate-300">•</span>
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <HardDrive className="w-3.5 h-3.5 text-amber-500" />
                        <span>{assetsCount} Assets</span>
                      </div>
                    </div>

                    {/* Real Member Avatars */}
                    <div className="flex items-center -space-x-2">
                      {membersList.length > 0 ? (
                        membersList.slice(0, 3).map((m: any) => (
                          <div
                            key={m.id || m.userId}
                            className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-2xs"
                            title={m.user?.name || m.user?.email || 'Team Member'}
                          >
                            {m.user?.name?.substring(0, 2).toUpperCase() || 'TM'}
                          </div>
                        ))
                      ) : (
                        <div className="w-7 h-7 rounded-full bg-indigo-600 text-white font-bold text-[10px] flex items-center justify-center border-2 border-white shadow-2xs">
                          ME
                        </div>
                      )}
                    </div>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
