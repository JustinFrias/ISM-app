import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Edit2, Trash2, Shield, Users } from 'lucide-react';
import { Header } from '../../components/layout/Header';
import { SkeuoButton } from '../../components/skeuomorphic/SkeuoButton';
import { SkeuoBadge } from '../../components/skeuomorphic/SkeuoBadge';
import { SkeuoLED } from '../../components/skeuomorphic/SkeuoLED';
import { SkeuoModal, ConfirmModal } from '../../components/skeuomorphic/SkeuoModal';
import { SkeuoInput, SkeuoSelect } from '../../components/skeuomorphic/SkeuoInput';
import { useAuthStore } from '../../store/useAuthStore';
import { useAuditLogger } from '../../store/useAuditStore';
import { mockUsers } from '../../services/mockData';
import { formatDate, formatDateTime } from '../../utils';
import type { User } from '../../types';
import { v4 as uuidv4 } from 'uuid';

interface UserManagementPageProps { targetRole: 'ADMIN' | 'STAFF'; }

export const UserManagementPage: React.FC<UserManagementPageProps> = ({ targetRole }) => {
  const currentUser = useAuthStore(s => s.currentUser);
  const logAudit = useAuditLogger();
  const [users, setUsers] = useState<User[]>(mockUsers.filter(u => u.role === targetRole));
  const [showModal, setShowModal] = useState(false);
  const [editUser, setEditUser] = useState<User | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);
  const [form, setForm] = useState<Partial<User> & { password?: string }>({});

  const openAdd = () => { setEditUser(null); setForm({ role: targetRole, isActive: true }); setShowModal(true); };
  const openEdit = (u: User) => { setEditUser(u); setForm(u); setShowModal(true); };

  const handleSave = () => {
    if (!form.username || !form.fullName) return;
    if (editUser) {
      setUsers(prev => prev.map(u => u.id === editUser.id ? { ...u, ...form } as User : u));
      logAudit(currentUser!.id, currentUser!.fullName, currentUser!.role, 'ACCOUNT_UPDATE', 'User', editUser.id, `Updated ${targetRole} account: ${form.username}`);
    } else {
      const newUser: User = { id: uuidv4(), username: form.username!, fullName: form.fullName!, email: form.email || '', role: targetRole, isActive: form.isActive !== false, createdAt: new Date().toISOString() };
      setUsers(prev => [...prev, newUser]);
      logAudit(currentUser!.id, currentUser!.fullName, currentUser!.role, 'ACCOUNT_CREATE', 'User', newUser.id, `Created ${targetRole} account: ${form.username}`);
    }
    setShowModal(false);
  };

  const handleDelete = (id: string) => {
    const u = users.find(u => u.id === id);
    setUsers(prev => prev.filter(u => u.id !== id));
    if (u) logAudit(currentUser!.id, currentUser!.fullName, currentUser!.role, 'ACCOUNT_DELETE', 'User', id, `Deleted ${targetRole} account: ${u.username}`);
    setDeleteId(null);
  };

  const toggleActive = (id: string) => setUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: !u.isActive } : u));

  const Icon = targetRole === 'ADMIN' ? Shield : Users;

  return (
    <div className="flex flex-col min-h-screen">
      <Header title={`${targetRole === 'ADMIN' ? 'Admin' : 'Staff'} Accounts`}
        subtitle={`Manage ${targetRole.toLowerCase()} credentials and access`}
        actions={<SkeuoButton variant="gold" size="sm" onClick={openAdd}><Plus size={14} /> Add {targetRole === 'ADMIN' ? 'Admin' : 'Staff'}</SkeuoButton>}
      />
      <div className="flex-1 p-8">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {users.map((u, i) => (
            <motion.div key={u.id} initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.06 }}
              className="skeuo-panel border border-white/08 rounded-2xl p-5 hover:border-white/15 transition-all group">
              {/* Badge top */}
              <div className="flex items-start justify-between mb-4">
                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-2xl font-black shadow-skeuo-button ${targetRole === 'ADMIN' ? 'bg-metallic-gold text-black' : 'bg-gradient-to-br from-[#3a4150] to-[#22262f] text-gray-300 border border-white/08'}`}>
                  {u.fullName.charAt(0)}
                </div>
                <SkeuoLED status={u.isActive ? 'green' : 'off'} size="md" label={u.isActive ? 'Active' : 'Inactive'} />
              </div>

              <h3 className="font-display font-bold text-skeuo-chrome">{u.fullName}</h3>
              <p className="text-xs text-gray-500 font-mono mt-0.5">@{u.username}</p>
              <p className="text-xs text-gray-600 mt-0.5">{u.email}</p>

              <div className="mt-3 flex items-center justify-between">
                <SkeuoBadge label={u.role} variant={u.role === 'ADMIN' ? 'gold' : 'metal'} />
                <p className="text-[10px] text-gray-700">{u.lastLogin ? `Last: ${formatDate(u.lastLogin)}` : 'Never logged in'}</p>
              </div>

              <div className="mt-4 pt-4 border-t border-white/06 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <SkeuoButton variant={u.isActive ? 'danger' : 'success'} size="xs" onClick={() => toggleActive(u.id)} className="flex-1">
                  {u.isActive ? 'Disable' : 'Enable'}
                </SkeuoButton>
                <SkeuoButton variant="ghost" size="xs" onClick={() => openEdit(u)}><Edit2 size={11} /></SkeuoButton>
                <SkeuoButton variant="danger" size="xs" onClick={() => setDeleteId(u.id)}><Trash2 size={11} /></SkeuoButton>
              </div>
            </motion.div>
          ))}
        </div>
      </div>

      <SkeuoModal isOpen={showModal} onClose={() => setShowModal(false)}
        title={editUser ? `Edit ${targetRole} Account` : `Add ${targetRole} Account`} size="sm"
        footer={
          <>
            <SkeuoButton variant="ghost" size="sm" onClick={() => setShowModal(false)}>Cancel</SkeuoButton>
            <SkeuoButton variant="gold" size="sm" onClick={handleSave}>Save</SkeuoButton>
          </>
        }>
        <div className="space-y-4">
          <SkeuoInput label="Full Name" id="ua-name" value={form.fullName || ''} onChange={e => setForm(f => ({ ...f, fullName: e.target.value }))} required />
          <SkeuoInput label="Username" id="ua-user" value={form.username || ''} onChange={e => setForm(f => ({ ...f, username: e.target.value }))} required />
          <SkeuoInput label="Email" id="ua-email" type="email" value={form.email || ''} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          {!editUser && <SkeuoInput label="Password" id="ua-pw" type="password" value={form.password || ''} onChange={e => setForm(f => ({ ...f, password: e.target.value }))} />}
        </div>
      </SkeuoModal>

      <ConfirmModal isOpen={!!deleteId} onClose={() => setDeleteId(null)} onConfirm={() => deleteId && handleDelete(deleteId)}
        title="Delete Account" message="Permanently delete this account? This action cannot be undone." isDanger />
    </div>
  );
};

export const AdminAccountsPage: React.FC = () => <UserManagementPage targetRole="ADMIN" />;
export const StaffAccountsPage: React.FC = () => <UserManagementPage targetRole="STAFF" />;
