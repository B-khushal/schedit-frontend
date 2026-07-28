import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FolderOpen, Search, Briefcase, ChevronRight, Loader2 } from 'lucide-react';
import { clientApiRequest } from '../../lib/api';
import { Card, PageHeader, Input, Badge, Button } from '../../components/ui';

interface Project {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  status: string;
  _count: { scheduledPosts: number };
}

export function ClientProjects() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    async function load() {
      try {
        const result = await clientApiRequest<Project[]>('/api/v1/clients/me/projects');
        setProjects(result);
      } catch (err) {
        console.error('Failed to load projects:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(search.toLowerCase()) ||
    p.description?.toLowerCase().includes(search.toLowerCase())
  );

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading projects...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto w-full space-y-6 animate-fade-in text-left">
      <PageHeader
        title="Assigned Projects"
        description="View all workspace projects assigned to your company."
      />

      <div className="flex items-center max-w-full sm:max-w-sm">
        <Input
          placeholder="Search projects..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          icon={<Search className="w-4 h-4" />}
          id="project-search"
        />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mt-4">
        {filteredProjects.map((project) => (
          <Link key={project.id} to={`/client/projects/${project.id}`} className="group">
            <Card className="p-4 sm:p-6 hover:shadow-elevated hover:border-brand-200 transition-all cursor-pointer h-full flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-10 h-10 rounded-xl bg-brand-50 border border-brand-100 flex items-center justify-center group-hover:bg-brand-100 transition-colors">
                    <FolderOpen className="w-5 h-5 text-brand-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight group-hover:text-brand-700 transition-colors">
                      {project.name}
                    </h3>
                    <p className="text-xs text-gray-400 font-semibold font-mono mt-0.5">{project.slug}</p>
                  </div>
                </div>
                {project.description && (
                  <p className="text-sm text-gray-500 line-clamp-2 mb-4 font-medium leading-relaxed">
                    {project.description}
                  </p>
                )}
              </div>
              <div className="flex items-center justify-between pt-4 border-t border-gray-100 mt-auto">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-gray-100 border border-gray-200 text-gray-700 text-xs font-bold rounded-lg shadow-xs">
                  <Briefcase className="w-3.5 h-3.5 text-gray-400" /> {project._count.scheduledPosts} Posts
                </span>
                <div className="flex items-center gap-2">
                  <Badge variant={project.status === 'ACTIVE' ? 'success' : 'neutral'} dot>
                    {project.status === 'ACTIVE' ? 'Active' : 'Inactive'}
                  </Badge>
                  <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-brand-500 group-hover:translate-x-0.5 transition-all" />
                </div>
              </div>
            </Card>
          </Link>
        ))}

        {filteredProjects.length === 0 && (
          <div className="col-span-full text-center py-16 bg-white border border-gray-200 rounded-3xl">
            <FolderOpen className="w-12 h-12 mx-auto mb-4 text-gray-300" />
            <h3 className="font-bold text-gray-800 text-lg mb-1">No Projects Found</h3>
            <p className="text-gray-500 text-sm font-medium">There are no projects matching your search.</p>
          </div>
        )}
      </div>
    </div>
  );
}
export default ClientProjects;
