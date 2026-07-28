import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';
import { apiRequest } from '../lib/api';
import { useAuth } from './AuthContext';

interface Organization {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  subscriptionPlan: string;
  timezone: string;
  projects: Project[];
}

interface Project {
  id: string;
  name: string;
  slug: string;
  logoUrl?: string;
  description?: string;
  status: string;
  createdAt?: string;
  socialAccounts?: any[];
  members?: any[];
}

interface WorkspaceContextType {
  organizations: Organization[];
  currentOrg: Organization | null;
  currentProject: Project | null;
  isLoading: boolean;
  error: string | null;
  setCurrentOrg: (org: Organization) => void;
  setCurrentProject: (project: Project) => void;
  refreshWorkspace: () => Promise<void>;
}

const WorkspaceContext = createContext<WorkspaceContextType | undefined>(undefined);

export function useWorkspace() {
  const ctx = useContext(WorkspaceContext);
  if (!ctx) throw new Error('useWorkspace must be used within WorkspaceProvider');
  return ctx;
}

export function WorkspaceProvider({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, token } = useAuth();
  const [organizations, setOrganizations] = useState<Organization[]>([]);
  const [currentOrg, setCurrentOrgState] = useState<Organization | null>(null);
  const [currentProject, setCurrentProjectState] = useState<Project | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadWorkspace = useCallback(async () => {
    if (!isAuthenticated) return;
    
    setIsLoading(true);
    setError(null);
    try {
      const orgs = await apiRequest<Organization[]>('/api/v1/organizations');
      setOrganizations(orgs);

      // Restore saved selections or use defaults
      const savedOrgId = localStorage.getItem('schedit_current_org');
      const savedProjectId = localStorage.getItem('schedit_current_project');

      let selectedOrg = orgs.find(o => o.id === savedOrgId) || orgs[0] || null;
      setCurrentOrgState(selectedOrg);

      if (selectedOrg?.projects?.length) {
        const selectedProject = selectedOrg.projects.find(p => p.id === savedProjectId) || selectedOrg.projects[0];
        
        // Fetch full project details with social accounts
        try {
          const projectDetails = await apiRequest<Project>(`/api/v1/projects/${selectedProject.id}`);
          setCurrentProjectState(projectDetails);
        } catch {
          setCurrentProjectState(selectedProject);
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to load workspace');
      console.error('Workspace load error:', err);
    } finally {
      setIsLoading(false);
    }
  }, [isAuthenticated]);

  useEffect(() => {
    loadWorkspace();
  }, [loadWorkspace]);

  const setCurrentOrg = useCallback((org: Organization) => {
    setCurrentOrgState(org);
    localStorage.setItem('schedit_current_org', org.id);
    
    // Auto-select first project
    if (org.projects?.length) {
      const firstProject = org.projects[0];
      setCurrentProjectState(firstProject);
      localStorage.setItem('schedit_current_project', firstProject.id);
    } else {
      setCurrentProjectState(null);
      localStorage.removeItem('schedit_current_project');
    }
  }, []);

  const setCurrentProject = useCallback(async (project: Project) => {
    localStorage.setItem('schedit_current_project', project.id);
    
    // Fetch full project details
    try {
      const projectDetails = await apiRequest<Project>(`/api/v1/projects/${project.id}`);
      setCurrentProjectState(projectDetails);
    } catch {
      setCurrentProjectState(project);
    }
  }, []);

  const value = useMemo<WorkspaceContextType>(() => ({
    organizations,
    currentOrg,
    currentProject,
    isLoading,
    error,
    setCurrentOrg,
    setCurrentProject,
    refreshWorkspace: loadWorkspace,
  }), [organizations, currentOrg, currentProject, isLoading, error, setCurrentOrg, setCurrentProject, loadWorkspace]);

  return <WorkspaceContext.Provider value={value}>{children}</WorkspaceContext.Provider>;
}
