import React, { useState, useEffect } from 'react';
import { Users, Building, Plus, Search, Mail, Phone, Briefcase, FileText, CheckCircle2, MoreHorizontal, Loader2, Calendar } from 'lucide-react';
import { Button, PageHeader, Modal, Input, Select, DataTable, Badge } from '../../components/ui';
import { useToast } from '../../components/ui/Toast';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { apiRequest } from '../../lib/api';
import { format } from 'date-fns';

interface ClientAssignment {
  id: string;
  companyName: string;
  phone?: string;
  status: 'INVITED' | 'ACTIVE' | 'SUSPENDED' | 'DEACTIVATED';
  invitationExpiry?: string;
  createdAt: string;
  user: {
    id: string;
    email: string;
    name: string;
    lastLogin?: string;
  };
  assignedProjects: {
    project: {
      id: string;
      name: string;
    };
  }[];
}

export function ClientManagement() {
  const { currentOrg } = useWorkspace();
  const { success: toastSuccess, error: toastError } = useToast();
  const [showModal, setShowModal] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [clients, setClients] = useState<ClientAssignment[]>([]);

  // Form states
  const [companyName, setCompanyName] = useState('');
  const [clientName, setClientName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [selectedProjectIds, setSelectedProjectIds] = useState<string[]>([]);

  const loadClients = async () => {
    if (!currentOrg?.id) return;
    setLoading(true);
    try {
      const data = await apiRequest<ClientAssignment[]>(`/api/v1/clients/list/${currentOrg.id}`);
      setClients(data);
    } catch (err: any) {
      console.error('Failed to load clients:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadClients();
  }, [currentOrg?.id]);

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentOrg?.id) return;

    setSubmitting(true);
    try {
      await apiRequest('/api/v1/clients', {
        method: 'POST',
        body: JSON.stringify({
          companyName,
          name: clientName,
          email,
          phone: phone || undefined,
          organizationId: currentOrg.id,
          projectIds: selectedProjectIds,
        }),
      });

      toastSuccess(
        'Invitation Sent',
        `Client created. Invitation email sent to ${email} successfully.`
      );
      setShowModal(false);
      
      // Reset form
      setCompanyName('');
      setClientName('');
      setEmail('');
      setPhone('');
      setSelectedProjectIds([]);

      // Reload
      loadClients();
    } catch (err: any) {
      toastError('Invitation Failed', err.message || 'Failed to create client.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleProjectToggle = (projectId: string) => {
    if (selectedProjectIds.includes(projectId)) {
      setSelectedProjectIds(selectedProjectIds.filter(id => id !== projectId));
    } else {
      setSelectedProjectIds([...selectedProjectIds, projectId]);
    }
  };

  const columns = [
    {
      header: 'Company / Client',
      accessorKey: (row: ClientAssignment) => (
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center border border-gray-200">
            <Building className="w-5 h-5 text-gray-500" />
          </div>
          <div>
            <p className="font-bold text-gray-900">{row.companyName}</p>
            <p className="text-xs text-gray-500 font-semibold">{row.user.name}</p>
          </div>
        </div>
      ),
      sortable: true,
    },
    {
      header: 'Contact Info',
      accessorKey: (row: ClientAssignment) => (
        <div>
          <p className="font-semibold text-gray-800 text-sm flex items-center gap-1">
            <Mail className="w-3.5 h-3.5 text-gray-400" /> {row.user.email}
          </p>
          {row.phone && (
            <p className="text-xs text-gray-500 font-medium flex items-center gap-1 mt-0.5">
              <Phone className="w-3.5 h-3.5 text-gray-400" /> {row.phone}
            </p>
          )}
        </div>
      ),
    },
    {
      header: 'Projects Assigned',
      accessorKey: (row: ClientAssignment) => (
        <div className="flex flex-wrap gap-1 max-w-[240px]">
          {row.assignedProjects.map((ap, i) => (
            <span
              key={i}
              className="inline-flex items-center px-2 py-0.5 bg-brand-50 border border-brand-100 text-brand-700 text-[10px] font-bold rounded"
            >
              {ap.project.name}
            </span>
          ))}
          {row.assignedProjects.length === 0 && (
            <span className="text-xs text-gray-400 italic">None</span>
          )}
        </div>
      ),
    },
    {
      header: 'Portal Status',
      accessorKey: (row: ClientAssignment) => {
        let variant: 'success' | 'warning' | 'error' | 'neutral' = 'neutral';
        if (row.status === 'ACTIVE') variant = 'success';
        if (row.status === 'INVITED') variant = 'warning';
        if (row.status === 'SUSPENDED') variant = 'error';
        return (
          <Badge variant={variant} dot>
            {row.status.toLowerCase()}
          </Badge>
        );
      },
      sortable: true,
    },
    {
      header: 'Last Login',
      accessorKey: (row: ClientAssignment) => (
        <span className="text-xs text-gray-500 font-semibold">
          {row.user.lastLogin
            ? format(new Date(row.user.lastLogin), 'MMM d, yyyy')
            : 'Never logged in'}
        </span>
      ),
      sortable: true,
    },
  ];

  return (
    <div className="p-6 md:p-8 max-w-[1200px] mx-auto w-full space-y-8 animate-fade-in text-left">
      <PageHeader
        title="Client CRM Directory"
        description="Invite external clients, manage assigned projects, and audit portal invitation activities."
        actions={
          <Button
            variant="primary"
            size="sm"
            onClick={() => setShowModal(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Invite Client User
          </Button>
        }
      />

      <div className="mt-4">
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <div className="flex flex-col items-center gap-3">
              <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
              <p className="text-sm text-gray-500 font-medium">Loading clients directory...</p>
            </div>
          </div>
        ) : (
          <DataTable
            data={clients}
            columns={columns}
            searchKey="companyName"
            searchPlaceholder="Search clients by company name..."
            pageSize={10}
          />
        )}
      </div>

      {/* Invite Client Dialog Modal */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Invite Client Collaborator"
        description="Register a new external client user. They will receive a secure login invitation link."
      >
        <form onSubmit={handleAddClient} className="space-y-4 text-left">
          <Input
            label="Client Company Name"
            placeholder="e.g. Acme Corporation"
            value={companyName}
            onChange={(e) => setCompanyName(e.target.value)}
            required
            disabled={submitting}
            id="company-name"
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Contact Full Name"
              placeholder="e.g. Sarah Jenkins"
              value={clientName}
              onChange={(e) => setClientName(e.target.value)}
              required
              disabled={submitting}
              id="client-name"
            />
            <Input
              label="Client Contact Email"
              type="email"
              placeholder="sarah@company.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              disabled={submitting}
              id="client-email"
            />
          </div>

          <Input
            label="Phone Number (Optional)"
            placeholder="e.g. +1 555-0199"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            disabled={submitting}
            id="client-phone"
          />

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Assign Projects
            </label>
            <div className="max-h-40 overflow-y-auto neu-well rounded-xl p-3 space-y-2">
              {currentOrg?.projects?.map((project) => (
                <label
                  key={project.id}
                  className="flex items-center gap-2.5 p-1.5 hover:bg-white rounded-lg cursor-pointer transition-colors"
                >
                  <input
                    type="checkbox"
                    checked={selectedProjectIds.includes(project.id)}
                    onChange={() => handleProjectToggle(project.id)}
                    className="w-4 h-4 rounded border-gray-300 text-brand-600 focus:ring-brand-500"
                  />
                  <div>
                    <p className="text-xs font-bold text-gray-800">{project.name}</p>
                    {project.description && (
                      <p className="text-[10px] text-gray-400 font-semibold truncate max-w-[320px]">
                        {project.description}
                      </p>
                    )}
                  </div>
                </label>
              ))}
              {(!currentOrg?.projects || currentOrg.projects.length === 0) && (
                <p className="text-xs text-gray-400 italic py-2">No projects configured in this workspace yet.</p>
              )}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
            <Button
              variant="secondary"
              onClick={() => setShowModal(false)}
              disabled={submitting}
            >
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Send Invitation Link
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
export default ClientManagement;
