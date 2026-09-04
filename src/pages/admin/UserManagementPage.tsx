import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Plus, Edit2, Trash2, Shield, Users, Mail, Send, CheckCircle2, RefreshCw, UserCheck } from 'lucide-react';
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
      if (saved) return JSON.parse(saved);
    } catch (e) {
      // fallback
    }
    return mockUsers.filter(u => u.role === targetRole);
  });

  useEffect(() => {
    try {
      localStorage.setItem(storageKey, JSON.stringify(users));
    } catch (e) {
      // ignore
    }
  }, [users, storageKey]);

  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<User>>({});
  const [notification, setNotification] = useState<{ title: string; message: string } | null>(null);
  const [isAutoFilled, setIsAutoFilled] = useState(false);

  const openAdd = () => {
    setEditUser(null);
    setForm({ role: targetRole, isActive: true, email: '', fullName: '', username: '' });
    setIsAutoFilled(false);
    setShowModal(true);
  };

  const openEdit = (u: User) => {
    setEditUser(u);
    setForm(u);
    setIsAutoFilled(false);
    setShowModal(true);
  };

  const handleEmailChange = (emailVal: string) => {
    setForm(prev => {
      const updated = { ...prev, email: emailVal };
      // Auto-suggest name and username if they haven't been manually altered yet
      if (!editUser && (!prev.fullName || isAutoFilled)) {
        const { fullName, username } = deriveNameFromEmail(emailVal);
        updated.fullName = fullName;
        updated.username = username;
        setIsAutoFilled(true);
      }
      return updated;
    });
  };

  const handleSendInvite = () => {
    if (!form.email || !form.email.includes('@')) {
      alert('Pakilagay ang wastong email address.');
      return;
    }

    const { fullName: defaultName, username: defaultUser } = deriveNameFromEmail(form.email);
    const finalFullName = form.fullName?.trim() || defaultName;
    const finalUsername = form.username?.trim() || defaultUser;

    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...form, fullName: finalFullName, username: finalUsername } as User : u));
      logAudit(currentUser!.id, currentUser!.fullName, currentUser!.role, 'ACCOUNT_UPDATE', 'User', editUser.id, `Updated ${targetRole} account: ${finalUsername}`);
      setNotification({
        title: 'Account Updated',
        message: `Matagumpay na na-update ang impormasyon para kay ${finalFullName}.`,
      });
    } else {
      const newUser: User = {
        id: uuidv4(),
        username: finalUsername,
        fullName: finalFullName,
        email: form.email.trim(),
        role: targetRole,
        isActive: true,
        invitationStatus: 'PENDING',
        createdAt: new Date().toISOString(),
      };
      setUsers(prev => [newUser, ...prev]);
      logAudit(currentUser!.id, currentUser!.fullName, currentUser!.role, 'ACCOUNT_CREATE', 'User', newUser.id, `Sent invitation for ${targetRole} account: ${form.email}`);

      setNotification({
        title: 'Invitation Sent!',
        message: `Isang notification at confirmation link ang ipinadala sa ${form.email}. Makakatanggap sila ng email para i-accept at kumpirmahin ang kanilang ${targetRole} access.`,
      });
    }

    setShowModal(false);
  };

  const handleResendInvite = (u: User) => {
    setNotification({
      title: 'Invitation Re-sent!',
      message: `Muling nagpadala ng notification at confirmation link sa ${u.email}.`,
    });
  };

  const handleSimulateAccept = (id: string) => {
    setUsers(prev => prev.map(u => u.id === id ? { ...u, invitationStatus: 'ACCEPTED', isActive: true, lastLogin: new Date().toISOString() } : u));
    setNotification({
      title: 'Invitation Accepted!',
      message: 'Kinumpirma na ng user ang kanyang email at aktibo na ang kanyang account.',
    });
  };

  const handleDelete = (id: string) => {
    const u = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    if (u) logAudit(currentUser!.id, currentUser!.fullName, currentUser!.role, 'ACCOUNT_DELETE', 'User', id, `Deleted ${targetRole} account: ${u.username}`);
    setDeleteId(null);
  };

  const toggleActive = (id: string) => setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));

  return (
    <div className="flex flex-col min-h-screen">
      <Header
        title={`${targetRole === 'ADMIN' ? 'Admin' : 'Staff'} Accounts`}
        subtitle={`Manage ${targetRole.toLowerCase()} email invitations and credentials`}
        actions={
          <SkeuoButton variant="gold" size="sm" onClick={openAdd}>
            <Mail size={14} /> Invite {targetRole === 'ADMIN' ? 'Admin' : 'Staff'} via Email
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
            const isPending = u.invitationStatus === 'PENDING';

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

                    {isPending ? (
                      <SkeuoLED status="amber" size="md" label="Pending Accept" pulse />
                    ) : (
                      <SkeuoLED status={u.isActive ? 'green' : 'off'} size="md" label={u.isActive ? 'Active' : 'Inactive'} />
                    )}
                  </div>

                  <h3 className="font-display font-bold text-skeuo-chrome truncate">{u.fullName || 'New Invited User'}</h3>
                  <p className="text-xs text-gray-500 font-mono mt-0.5 truncate">@{u.username}</p>
                  <p className="text-xs text-amber-300/80 mt-1 flex items-center gap-1.5 truncate font-medium">
                    <Mail size={12} className="shrink-0 text-amber-400" />
                    {u.email}
                  </p>

                  <div className="mt-3 flex items-center justify-between gap-2">
                    <SkeuoBadge label={u.role} variant={u.role === 'ADMIN' ? 'gold' : 'metal'} />
                    {isPending ? (
                      <span className="text-[10px] bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2 py-0.5 rounded-full font-mono font-medium">
                        Invite Sent
                      </span>
                    ) : (
                      <p className="text-[10px] text-gray-700 font-mono">
                        {u.lastLogin ? `Last: ${formatDate(u.lastLogin)}` : 'Never logged in'}
                      </p>
                    )}
                  </div>
                </div>

                {/* Actions Bottom */}
                <div className="mt-5 pt-3 border-t border-white/06 flex flex-col gap-2">
                  {isPending && (
                    <div className="flex items-center gap-2">
                      <SkeuoButton
                        variant="gold"
                        size="xs"
                        onClick={() => handleResendInvite(u)}
                        className="flex-1 text-[10px]"
                        title="Resend invitation email"
                      >
                        <RefreshCw size={10} /> Resend Email
                      </SkeuoButton>
                      <SkeuoButton
                        variant="success"
                        size="xs"
                        onClick={() => handleSimulateAccept(u.id)}
                        className="text-[10px]"
                        title="Accept invite (Confirm)"
                      >
                        <UserCheck size={10} /> Accept
                      </SkeuoButton>
                    </div>
                  )}

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

      {/* Invite / Add Modal */}
      <SkeuoModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title={editUser ? `Edit ${targetRole} Account` : `Invite ${targetRole} Account`}
        size="sm"
        footer={
          <>
            <SkeuoButton variant="ghost" size="sm" onClick={() => setShowModal(false)}>
              Cancel
            </SkeuoButton>
            <SkeuoButton variant="gold" size="sm" onClick={handleSendInvite}>
              <Send size={13} /> {editUser ? 'Save Changes' : 'Send Invite'}
            </SkeuoButton>
          </>
        }
      >
        <div className="space-y-4">
          {/* Email (Primary Field) */}
          <SkeuoInput
            label="EMAIL ADDRESS *"
            id="ua-email"
            type="email"
            placeholder="alveromaryrose025@gmail.com"
            value={form.email || ''}
            onChange={e => handleEmailChange(e.target.value)}
            required
          />

          {/* Full Name (Auto-derived or customizable) */}
          <SkeuoInput
            label="FULL NAME"
            id="ua-name"
            placeholder="Mary Rose Alvero"
            value={form.fullName || ''}
            onChange={e => {
              setIsAutoFilled(false);
              setForm(f => ({ ...f, fullName: e.target.value }));
            }}
          />

          {/* Username (Auto-derived or customizable) */}
          <SkeuoInput
            label="USERNAME"
            id="ua-user"
            placeholder="maryrosealvero"
            value={form.username || ''}
            onChange={e => {
              setIsAutoFilled(false);
              setForm(f => ({ ...f, username: e.target.value }));
            }}
          />

          {/* Information Banner explaining Email Confirmation Flow */}
          <div className="p-3.5 bg-gradient-to-r from-amber-500/10 to-amber-600/05 border border-amber-500/25 rounded-xl text-xs flex items-start gap-3 shadow-inner">
            <Mail className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <p className="font-semibold text-amber-200">Email Invitation & Confirmation</p>
              <p className="text-gray-400 mt-1 leading-relaxed">
                Hindi na kailangan ng manual password. Makakatanggap ang user ng notification sa email na ito para i-confirm o i-accept ang imbitasyon at mag-set up ng sarili niyang password.
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
