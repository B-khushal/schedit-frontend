import React, { useState, useEffect } from 'react';
import { User, Phone, Mail, Building, Key, Check, AlertCircle, Loader2 } from 'lucide-react';
import { clientApiRequest } from '../../lib/api';
import { useToast } from '../../components/ui/Toast';
import { PageHeader, Card, Input, Button } from '../../components/ui';

interface ProfileData {
  id: string;
  name: string;
  email: string;
  avatarUrl?: string;
  clientProfile: {
    companyName: string;
    phone?: string;
    organization: { name: string };
  };
}

export function ClientProfile() {
  const { success: toastSuccess, error: toastError } = useToast();
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);

  // Form states
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [updatingProfile, setUpdatingProfile] = useState(false);

  // Password change states
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [updatingPassword, setUpdatingPassword] = useState(false);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  useEffect(() => {
    async function load() {
      try {
        const data = await clientApiRequest<ProfileData>('/api/v1/clients/me/profile');
        setProfile(data);
        setName(data.name);
        setPhone(data.clientProfile.phone || '');
      } catch (err) {
        console.error('Failed to load profile:', err);
      } finally {
        setLoading(false);
      }
    }
    load();
  }, []);

  const handleUpdateProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setUpdatingProfile(true);
    try {
      const updated = await clientApiRequest<ProfileData>('/api/v1/clients/me/profile', {
        method: 'PATCH',
        body: JSON.stringify({ name, phone }),
      });
      setProfile(updated);
      toastSuccess('Profile Updated', 'Your profile details have been saved.');
    } catch (err: any) {
      toastError('Update Failed', err.message);
    } finally {
      setUpdatingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError(null);

    if (newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError('New passwords do not match.');
      return;
    }

    setUpdatingPassword(true);
    try {
      await clientApiRequest('/api/v1/clients/me/password', {
        method: 'PATCH',
        body: JSON.stringify({ currentPassword, newPassword }),
      });
      toastSuccess('Password Changed', 'Your password has been updated.');
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
    } catch (err: any) {
      setPasswordError(err.message || 'Failed to update password.');
      toastError('Error', err.message);
    } finally {
      setUpdatingPassword(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full min-h-[400px]">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-brand-600 animate-spin" />
          <p className="text-sm text-gray-500 font-medium">Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-[800px] mx-auto w-full space-y-6 animate-fade-in text-left">
      <PageHeader
        title="My Profile"
        description="Manage your contact details and security credentials."
      />

      <div className="grid grid-cols-1 gap-6">
        {/* Profile Card */}
        <Card className="p-6 border border-gray-200/80">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Contact Information</h3>
          <form onSubmit={handleUpdateProfile} className="space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="Full Name"
                placeholder="Jane Doe"
                value={name}
                onChange={(e) => setName(e.target.value)}
                icon={<User className="w-4 h-4" />}
                required
                disabled={updatingProfile}
                id="profile-name"
              />
              <Input
                label="Phone Number"
                placeholder="Optional"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                icon={<Phone className="w-4 h-4" />}
                disabled={updatingProfile}
                id="profile-phone"
              />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Email Address
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm font-semibold">
                  <Mail className="w-4 h-4 text-gray-400" />
                  {profile?.email}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                  Assigned Company
                </label>
                <div className="flex items-center gap-2 px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-gray-500 text-sm font-semibold">
                  <Building className="w-4 h-4 text-gray-400" />
                  {profile?.clientProfile.companyName}
                </div>
              </div>
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" loading={updatingProfile}>
                Save Changes
              </Button>
            </div>
          </form>
        </Card>

        {/* Change Password Card */}
        <Card className="p-6 border border-gray-200/80">
          <h3 className="font-bold text-gray-900 text-sm mb-4">Change Password</h3>
          {passwordError && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl flex items-center gap-2 text-red-700 text-sm font-medium">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span>{passwordError}</span>
            </div>
          )}
          <form onSubmit={handleChangePassword} className="space-y-4">
            <Input
              label="Current Password"
              type="password"
              placeholder="••••••••"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              icon={<Key className="w-4 h-4" />}
              required
              disabled={updatingPassword}
              id="current-password"
            />
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                icon={<Key className="w-4 h-4" />}
                required
                disabled={updatingPassword}
                id="new-password"
              />
              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                icon={<Key className="w-4 h-4" />}
                required
                disabled={updatingPassword}
                id="confirm-password"
              />
            </div>
            <div className="flex justify-end pt-2">
              <Button type="submit" variant="primary" loading={updatingPassword}>
                Update Password
              </Button>
            </div>
          </form>
        </Card>
      </div>
    </div>
  );
}
export default ClientProfile;
