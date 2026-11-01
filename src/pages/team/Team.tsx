import React, { useState, useEffect } from 'react';
import { Users, UserPlus, Search, Shield, Mail, CheckCircle2, Trash2, ShieldAlert } from 'lucide-react';
import { motion } from 'motion/react';
import { cn } from '../../lib/utils';
import { apiRequest } from '../../lib/api';
import { useWorkspace } from '../../contexts/WorkspaceContext';
import { useToast } from '../../components/ui/Toast';
import { Button, PageHeader, Modal, Input, Select, DataTable } from '../../components/ui';

export function Team() {
  const { currentOrg } = useWorkspace();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Invite states
  const [showModal, setShowModal] = useState(false);
  const [email, setEmail] = useState('');
  const [role, setRole] = useState('VIEWER');
  const [submitting, setSubmitting] = useState(false);

  const fetchTeamMembers = async () => {
    if (!currentOrg) return;
    setRefreshing(true);
    try {
      const list = await apiRequest(`/api/v1/organizations/${currentOrg.id}/members`);
      setMembers(list);
    } catch (err) {
      console.error('Failed to load team list:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    if (currentOrg) {
      fetchTeamMembers();
    }
  }, [currentOrg]);

  const handleInviteMember = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim() || !currentOrg) return;
    setSubmitting(true);
    try {
      await apiRequest(`/api/v1/organizations/${currentOrg.id}/members`, {
        method: 'POST',
        body: JSON.stringify({ email, role }),
      });
      toastSuccess('User Invited', `${email} has been added to organization as ${role.toLowerCase()}.`);
      setEmail('');
      setRole('VIEWER');
      setShowModal(false);
      fetchTeamMembers();
    } catch (err: any) {
      toastError('Invite Failed', err.message || 'Could not send invitation.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleRemoveMember = async (userId: string, email: string) => {
    if (!currentOrg) return;
    if (!window.confirm(`Are you sure you want to remove ${email} from this organization?`)) return;
    try {
      setRefreshing(true);
      await apiRequest(`/api/v1/organizations/${currentOrg.id}/members/${userId}`, {
        method: 'DELETE',
      });
      toastSuccess('Member Removed', `${email} was removed from organization workspace.`);
      fetchTeamMembers();
    } catch (err: any) {
      toastError('Remove Failed', err.message || 'Could not delete team member.');
    } finally {
      setRefreshing(false);
    }
  };

  const handleRoleChange = async (userId: string, targetRole: string) => {
    if (!currentOrg) return;
    try {
      setRefreshing(true);
      await apiRequest(`/api/v1/organizations/${currentOrg.id}/members`, {
        method: 'POST',
        body: JSON.stringify({
          email: members.find(m => m.userId === userId)?.user?.email,
          role: targetRole
        })
      });
      toastSuccess('Role Updated', `Changed user role to ${targetRole.toLowerCase()}.`);
      fetchTeamMembers();
    } catch (err: any) {
      toastError('Update Failed', err.message || 'Could not change user role.');
    } finally {
      setRefreshing(false);
    }
  };

  const columns = [
    {
      header: 'Member',
      accessorKey: (row: any) => {
        const name = row.user?.name || 'Unknown User';
        const email = row.user?.email || '';
        return (
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-brand-600 to-indigo-600 text-white font-bold text-sm flex items-center justify-center">
              {name.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-bold text-gray-900">{name}</p>
              <p className="text-xs text-gray-500">{email}</p>
            </div>
          </div>
        );
      },
      sortable: false,
    },
    {
      header: 'Role',
      accessorKey: (row: any) => (
        <select
          value={row.role}
          onChange={(e) => handleRoleChange(row.userId, e.target.value)}
          className="text-xs neu-input rounded-xl p-2 font-bold text-[var(--neu-text-primary)] cursor-pointer"
        >
          <option value="OWNER">Owner</option>
          <option value="ADMIN">Admin</option>
          <option value="MANAGER">Manager</option>
          <option value="BILLING_MANAGER">Billing Manager</option>
          <option value="VIEWER">Viewer</option>
        </select>
      ),
      sortable: true,
    },
    {
      header: 'Status',
      accessorKey: () => (
        <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-250">
          <CheckCircle2 className="w-3 h-3 text-emerald-500" /> Active
        </span>
      ),
      sortable: false,
    },
    {
      header: 'Action',
      accessorKey: (row: any) => (
        <button
          onClick={() => handleRemoveMember(row.userId, row.user?.email)}
          className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
          title="Remove Member"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      ),
      sortable: false,
      className: 'w-20 text-center',
    },
  ];

  return (
    <div className="p-4 md:p-8 max-w-[1200px] mx-auto w-full space-y-8 animate-fade-in bg-transparent">
      <PageHeader
        title="Team Directory"
        description="Manage organization memberships, roles, permissions, and status parameters."
        actions={
          <Button variant="primary" size="sm" onClick={() => setShowModal(true)} icon={<UserPlus className="w-4 h-4" />}>
            Invite Member
          </Button>
        }
      />

      <div className="mt-4">
        <DataTable
          data={members}
          columns={columns}
          searchKey="role"
          searchPlaceholder="Filter by roles (Viewer, Admin)..."
          pageSize={10}
        />
      </div>

      {/* Invite Member dialog */}
      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="Invite Team Member"
        description="Send an email invitation to grant access to this workspace organization."
      >
        <form onSubmit={handleInviteMember} className="space-y-4">
          <Input
            label="Email Address"
            type="email"
            placeholder="colleague@company.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={submitting}
          />

          <Select
            label="Organization Role"
            value={role}
            onChange={(e) => setRole(e.target.value)}
            options={[
              { value: 'OWNER', label: 'Owner (All Actions)' },
              { value: 'ADMIN', label: 'Administrator' },
              { value: 'MANAGER', label: 'Manager' },
              { value: 'BILLING_MANAGER', label: 'Billing Manager' },
              { value: 'VIEWER', label: 'Viewer (Read Only)' },
            ]}
          />

          <div className="flex flex-col-reverse sm:flex-row sm:justify-end gap-3 pt-2">
            <Button variant="secondary" onClick={() => setShowModal(false)} disabled={submitting}>
              Cancel
            </Button>
            <Button type="submit" variant="primary" loading={submitting}>
              Send Invitation
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
export default Team;
