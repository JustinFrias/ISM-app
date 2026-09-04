import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Shield, Users, Mail, CheckCircle2, UserCheck } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { SkeuoLED } from '../../components/skeuomorphic/SkeuoLED';
import { SkeuoModal, ConfirmModal } from '../../components/skeuomorphic/SkeuoModal';
import { SkeuoInput } from '../../components/skeuomorphic/SkeuoInput';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuditLogger } from '../../store/useAuditStore';
import { mockUsers } from '../../services/mockData';
import { formatDate } from '../../utils';
import type { User } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface UserManagementPageProps { targetRole: 'ADMIN' | 'STAFF'; }

// Helper to derive a clean full name from an email address
function deriveNameFromEmail(email: string): { fullName: string; username: string } {
  const prefix = email.split('@')[0] || '';
  const cleaned = prefix.replace(/[^a-zA-Z]/g, ' ').trim();
  const words = cleaned.split(/\s+/).filter(Boolean);
  const fullName = words.length > 0 
    ? words.map(w => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase()).join(' ')
    : prefix;
  const username = prefix.toLowerCase().replace(/[^a-z0-9]/g, '');
  return { fullName: fullName || prefix, username: username || prefix };
}

export const UserManagementPage: React.FC<UserManagementPageProps> = ({ targetRole }) => {
  const currentUser = useAuthStore(s => s.currentUser);
  const logAudit = useAuditLogger();

  const storageKey = `skeuo_users_management_${targetRole}`;

  const [users, setUsers] = useState<User[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          // Ensure all accounts are automatically marked active & accepted
          return parsed.map((u: User) => ({
            ...u,
            isActive: u.isActive !== undefined ? u.isActive : true,
            invitationStatus: 'ACCEPTED' as const,
          }));
        }
      }
    } catch (e) {
      // fallback
    }
    return mockUsers
      .filter(u => u.role === targetRole)
      .map(u => ({ ...u, invitationStatus: 'ACCEPTED' as const, isActive: true }));
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(users));

      // Synchronize to global email-to-role map
      const existingMapRaw = localStorage.getItem('skeuo_user_assigned_roles');
      const roleMap: Record<string, 'ADMIN' | 'STAFF'> = existingMapRaw ? JSON.parse(existingMapRaw) : {};
      users.forEach(u => {
        if (u.email) {
          roleMap[u.email.toLowerCase().trim()] = targetRole;
        }
      });
      localStorage.setItem('skeuo_user_assigned_roles', JSON.stringify(roleMap));
    } catch (e) {
      // ignore
    }
  }, [users, storageKey, targetRole]);

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<User>>({});
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const openAdd = () => {
    setEditUser(null);
    setForm({ role: targetRole, isActive: true, email: '', fullName: '', username: '' });
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm(u);
    setShowModal(true);
  };

  const handleSaveRole = async () => {
    if (!form.email || !form.email.includes('@')) {
      alert('Pakilagay ang wastong email address.');
      return;
    }

    const cleanEmail = form.email.trim().toLowerCase();
    const { fullName: defaultName, username: defaultUser } = deriveNameFromEmail(cleanEmail);
    const finalFullName = form.fullName?.trim() || defaultName;
    const finalUsername = form.username?.trim() || defaultUser;

    setIsSaving(true);

    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { 
        ...u, 
        ...form, 
        fullName: finalFullName, 
        username: finalUsername, 
        role: targetRole,
        invitationStatus: 'ACCEPTED',
      } as User : u));

      logAudit(currentUser!.id, currentUser!.fullName, currentUser!.role, 'ACCOUNT_UPDATE', 'User', editUser.id, `Updated ${targetRole} account: ${finalUsername}`);
      setNotification({
        title: 'Account Updated',
        message: `Matagumpay na na-update ang impormasyon para kay ${finalFullName} bilang ${targetRole}.`,
      });
      setIsSaving(false);
      setShowModal(false);
      return;
    }

    // Call serverless /api/invite asynchronously in background to sync Clerk metadata
    try {
      fetch('/api/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email: cleanEmail,
          role: targetRole,
          redirectUrl: window.location.origin,
        }),
      }).catch(err => console.warn('Background Clerk sync notice:', err));
    } catch (err) {
      console.warn('API sync warning:', err);
    }

    // Immediately assign role and mark account active
    const newUser: User = {
      id: uuidv4(),
      username: finalUsername,
      fullName: finalFullName,
      email: cleanEmail,
      role: targetRole,
      isActive: true,
      invitationStatus: 'ACCEPTED',
      createdAt: new Date().toISOString(),
    };

    setUsers(prev => {
      const filtered = prev.filter(u => u.email.toLowerCase().trim() !== cleanEmail);
      return [newUser, ...filtered];
    });

    // Update global role lookup immediately
    try {
      const existingMapRaw = localStorage.getItem('skeuo_user_assigned_roles');
      const roleMap: Record<string, 'ADMIN' | 'STAFF'> = existingMapRaw ? JSON.parse(existingMapRaw) : {};
      roleMap[cleanEmail] = targetRole;
      localStorage.setItem('skeuo_user_assigned_roles', JSON.stringify(roleMap));
    } catch (e) {}

    logAudit(currentUser!.id, currentUser!.fullName, currentUser!.role, 'ACCOUNT_CREATE', 'User', newUser.id, `Assigned ${targetRole} role to: ${cleanEmail}`);

    setNotification({
      title: 'Awtomatikong Na-assign ang Role!',
      message: `Awtomatiko nang na-assign ang role na ${targetRole} kay ${finalFullName} (${cleanEmail}). Aktibo na agad ang kanyang account sa system at hindi na kailangan ng email confirmation link!`,
    });

    setIsSaving(false);
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const u = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    if (u) {
      logAudit(currentUser!.id, currentUser!.fullName, currentUser!.role, 'ACCOUNT_DELETE', 'User', id, `Deleted ${targetRole} account: ${u.username}`);
      try {
        const existingMapRaw = localStorage.getItem('skeuo_user_assigned_roles');
        if (existingMapRaw) {
          const roleMap = JSON.parse(existingMapRaw);
          delete roleMap[u.email.toLowerCase().trim()];
          localStorage.setItem('skeuo_user_assigned_roles', JSON.stringify(roleMap));
        }
      } catch (e) {}
    }
    setDeleteId(null);
  };

  const toggleActive = (id: string) => setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title={`${targetRole === 'ADMIN' ? 'Admin' : 'Staff'} Accounts`}
        subtitle={`Manage active ${targetRole.toLowerCase()} accounts and permissions`}
        actions={
          <SkeuoButton variant="gold" size="sm" onClick={openAdd}>
            <Shield size={14} /> Assign {targetRole === 'ADMIN' ? 'Admin' : 'Staff'} Role
          </SkeuoButton>
        }
      />

      <div className="flex-1 p-8">
        {/* Success / Notification Banner */}
        <AnimatePresence>
          {notification && (
            <motion.div
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 text-emerald-300 flex items-start justify-between shadow-lg"
            >
              <div className="flex items-start gap-3">
                <CheckCircle2 className="w-5 h-5 text-emerald-400 mt-0.5 shrink-0" />
                <div>
                  <h4 className="font-semibold text-emerald-200">{notification.title}</h4>
                  <p className="text-xs text-emerald-300/90 mt-0.5 leading-relaxed">{notification.message}</p>
                </div>
              </div>
              <button
                onClick={() => setNotification(null)}
                className="text-emerald-400 hover:text-white text-xs px-2 py-1 ml-4 rounded transition-colors"
              >
                ✕
              </button>
            </motion.div>
          )}
        </AnimatePresence>

        {/* User Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {users.map((u, i) => {
            return (
              <motion.div
                key={u.id}
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.05 }}
                className="skeuo-panel border border-white/08 rounded-2xl p-5 hover:border-white/15 transition-all group flex flex-col justify-between"
              >
                <div>
                  {/* Top LED & Avatar */}
                  <div className="flex items-start justify-between mb-4">
                    <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-skeuo-button ${
                      targetRole === 'ADMIN'
                        ? 'bg-metallic-gold text-black'
                        : 'bg-gradient-to-br from-[#3a4150] to-[#22262f] text-gray-300 border border-white/08'
                    }`}>
                      {u.fullName ? u.fullName.charAt(0).toUpperCase() : u.email.charAt(0).toUpperCase()}
                    </div>

                    <SkeuoLED status={u.isActive ? 'green' : 'off'} size="md" label={u.isActive ? 'Active' : 'Inactive'} />
                  </div>

                  <h3 className="font-display font-bold text-skeuo-chrome truncate">{u.fullName || 'User'}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">@{u.username}</p>
                  <p className="text-xs text-amber-300/80 mt-1 flex items-center gap-1.5 truncate font-medium">
                    <Mail size={12} className="shrink-0 text-amber-400" />
                    {u.email}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <SkeuoBadge label={u.role} variant={u.role === 'ADMIN' ? 'gold' : 'metal'} />
                    <span className="text-[10px] text-emerald-400 font-mono font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 inline-block"></span>
                      Active Account
                    </span>
                  </div>
                </div>

                {/* Actions Bottom */}
                <div className="mt-5 pt-3 border-t border-white/06 flex flex-col gap-2">
                  <div className="flex items-center gap-2 opacity-80 group-hover:opacity-100 transition-opacity">
                    <SkeuoButton
                      variant={u.isActive ? 'danger' : 'success'}
                      size="xs"
                      onClick={() => toggleActive(u.id)}
                      className="flex-1 text-[10px]"
                    >
                      {u.isActive ? 'Disable' : 'Enable'}
                    </SkeuoButton>
                    <SkeuoButton variant="ghost" size="xs" onClick={() => openEdit(u)} title="Edit details">
                      <Edit2 size={11} />
                    </SkeuoButton>
                    <SkeuoButton variant="danger" size="xs" onClick={() => setDeleteId(u.id)} title="Delete user">
                      <Trash2 size={11} />
                    </SkeuoButton>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* Assign Role / Edit Modal */}
      <SkeuoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editUser ? `Edit ${targetRole} Account` : `Assign ${targetRole} Role`}
        size="sm"
        footer={
          <>
            <SkeuoButton variant="ghost" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </SkeuoButton>
            <SkeuoButton variant="gold" size="sm" onClick={handleSaveRole} disabled={isSaving}>
              <UserCheck size={13} /> {isSaving ? 'Saving...' : editUser ? 'Save Changes' : `Assign ${targetRole} Role`}
            </SkeuoButton>
          </>
        }
      >
        <div className="space-y-4">
          {/* Email (Primary Field) */}
          <SkeuoInput
            label="Email Address"
            id="ua-email"
            type="email"
            value={form.email || ''}
            onChange={e => setForm(f => ({ ...f, email: e.target.value }))}
            required
          />

          {/* Full Name */}
          <SkeuoInput
            label="Full Name"
            id="ua-name"
            value={form.fullName || ''}
            onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))}
          />

          {/* Username */}
          <SkeuoInput
            label="Username"
            id="ua-user"
            value={form.username || ''}
            onChange={e => setForm(f => ({ ...f, username: e.target.value }))}
          />

          {/* Automatic Role Assignment Info Banner */}
          <div className="p-3.5 bg-gradient-to-r from-emerald-500/10 to-emerald-600/05 border border-emerald-500/25 rounded-xl text-xs flex items-start gap-3 shadow-inner">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-emerald-200">Awtomatikong Role Assignment</p>
              <p className="text-gray-400 mt-1 leading-relaxed">
                Awtomatiko nang itatalaga at magiging aktibo agad ang role na <strong className="text-emerald-300">{targetRole}</strong> sa account na ito. Pagka-login ng user gamit ang email na ito, diretso siyang makakapasok bilang <strong className="text-white">{targetRole}</strong> nang hindi na kailangan mag-confirm sa email.
              </p>
            </div>
          </div>
        </div>
      </SkeuoModal>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={!!deleteId}
        onClose={() => setDeleteId(null)}
        onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Account"
        message="Permanently delete this account? This action cannot be undone."
        isDanger
      />
    </div>
  );
};

export const AdminAccountsPage: React.FC = () => <UserManagementPage targetRole="ADMIN" />;
export const StaffAccountsPage: React.FC = () => <UserManagementPage targetRole="STAFF" />;
