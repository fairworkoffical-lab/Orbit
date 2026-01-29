'use client';

import React, { useState } from 'react';
import { useAppStore } from '@/lib/store';
import { Users, UserPlus, Mail, Shield, CheckCircle2, Copy, Trash2, MoreHorizontal } from 'lucide-react';
import { cn } from '@/lib/utils';

// Mock Roles
const ROLES = [
    { id: 'DOCTOR', label: 'Doctor', apps: ['OPD', 'IPD'] },
    { id: 'RECEPTION', label: 'Receptionist', apps: ['OPD'] },
    { id: 'NURSE', label: 'Nurse', apps: ['IPD'] },
    { id: 'PHARMACIST', label: 'Pharmacist', apps: ['Pharmacy'] },
    { id: 'ADMIN', label: 'Admin', apps: ['All'] },
];

export default function TeamPage() {
    const { users, addUser, removeUser } = useAppStore();
    const [showInviteModal, setShowInviteModal] = useState(false);

    // Invite Form
    const [inviteName, setInviteName] = useState('');
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteRole, setInviteRole] = useState('DOCTOR');
    const [magicLink, setMagicLink] = useState<string | null>(null);

    const handleGenerateLink = () => {
        // Simulate Link Generation
        const link = `https://orbit.hospital/join/${inviteRole.toLowerCase()}?token=${Date.now()}`;
        setMagicLink(link);
    };

    const handleCopyLink = () => {
        if (magicLink) {
            navigator.clipboard.writeText(magicLink);
            alert("Invite Link Copied!");

            // Add "Pending" User
            addUser({
                id: `user-${Date.now()}`,
                name: inviteName || 'Pending User',
                email: inviteEmail,
                role: inviteRole as any,
                permissions: [],
                tenantId: 'workspace-1'
            });

            setShowInviteModal(false);
            setMagicLink(null);
            setInviteName('');
            setInviteEmail('');
        }
    };

    return (
        <div className="p-8 max-w-6xl mx-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Team & Permissions</h1>
                    <p className="text-slate-500">Manage access to your Hospital OS.</p>
                </div>
                <button
                    onClick={() => setShowInviteModal(true)}
                    className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-3 rounded-xl font-bold transition-all shadow-lg shadow-indigo-200"
                >
                    <UserPlus className="w-5 h-5" />
                    Invite Member
                </button>
            </div>

            {/* TEAM GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {/* ACTIVE USERS */}
                {users.map((user) => (
                    <div key={user.id} className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex flex-col gap-4 group hover:border-indigo-200 transition-all">
                        <div className="flex items-start justify-between">
                            <div className="flex items-center gap-3">
                                <div className="h-12 w-12 rounded-xl bg-slate-100 flex items-center justify-center text-xl font-bold text-slate-600 group-hover:bg-indigo-50 group-hover:text-indigo-600 transition-colors">
                                    {user.name.charAt(0)}
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900">{user.name}</h3>
                                    <span className="text-xs font-medium text-slate-500 flex items-center gap-1">
                                        <Mail className="w-3 h-3" /> {user.email || 'No Email'}
                                    </span>
                                </div>
                            </div>
                            <button className="text-slate-300 hover:text-slate-600">
                                <MoreHorizontal className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="flex items-center gap-2">
                            <span className="px-2.5 py-1 rounded-md bg-slate-100 text-slate-600 text-xs font-bold uppercase tracking-wider border border-slate-200">
                                {user.role}
                            </span>
                            <span className="px-2.5 py-1 rounded-md bg-emerald-50 text-emerald-600 text-xs font-bold uppercase tracking-wider border border-emerald-100 flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3" /> Active
                            </span>
                        </div>
                    </div>
                ))}

                {users.length === 0 && (
                    <div className="col-span-full py-12 text-center text-slate-400 bg-slate-50 rounded-2xl border-2 border-dashed border-slate-200">
                        No team members found. Invite someone to get started.
                    </div>
                )}
            </div>

            {/* INVITE MODAL */}
            {showInviteModal && (
                <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-3xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                        <div className="p-8 border-b border-slate-100">
                            <h2 className="text-2xl font-black text-slate-900">Invite Team Member</h2>
                            <p className="text-slate-500">Send an invitation to join your workspace.</p>
                        </div>

                        <div className="p-8 space-y-6">
                            {!magicLink ? (
                                <>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Name</label>
                                            <input
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500"
                                                placeholder="Dr. Smith"
                                                value={inviteName}
                                                onChange={e => setInviteName(e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Email</label>
                                            <input
                                                className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl font-bold text-slate-700 outline-none focus:border-indigo-500"
                                                placeholder="email@hospital.com"
                                                value={inviteEmail}
                                                onChange={e => setInviteEmail(e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider">Assign Role</label>
                                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                                            {ROLES.map(role => (
                                                <button
                                                    key={role.id}
                                                    onClick={() => setInviteRole(role.id)}
                                                    className={cn(
                                                        "p-3 rounded-xl border-2 text-left transition-all",
                                                        inviteRole === role.id
                                                            ? "bg-indigo-50 border-indigo-600 text-indigo-900"
                                                            : "bg-white border-slate-100 text-slate-500 hover:border-slate-300"
                                                    )}
                                                >
                                                    <div className="font-bold text-sm">{role.label}</div>
                                                    <div className="text-[10px] opacity-70">Access: {role.apps.join(', ')}</div>
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <button
                                        onClick={handleGenerateLink}
                                        disabled={!inviteName || !inviteEmail}
                                        className="w-full py-4 bg-slate-900 hover:bg-black text-white rounded-xl font-bold shadow-lg transition-all disabled:opacity-50"
                                    >
                                        Generate Invite Link
                                    </button>
                                </>
                            ) : (
                                <div className="space-y-6 text-center">
                                    <div className="h-16 w-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-4">
                                        <CheckCircle2 className="w-8 h-8" />
                                    </div>
                                    <h3 className="text-xl font-bold text-slate-900">Link Generated!</h3>

                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex items-center gap-3">
                                        <code className="flex-1 text-xs text-slate-500 truncate font-mono">{magicLink}</code>
                                        <button onClick={handleCopyLink} className="p-2 hover:bg-slate-200 rounded-lg text-slate-600">
                                            <Copy className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <button
                                        onClick={handleCopyLink}
                                        className="w-full py-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold shadow-lg transition-all"
                                    >
                                        Copy Link & Add User
                                    </button>
                                </div>
                            )}
                        </div>

                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-center">
                            <button onClick={() => { setShowInviteModal(false); setMagicLink(null); }} className="text-sm font-bold text-slate-400 hover:text-slate-600">
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
