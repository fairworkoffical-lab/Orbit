'use client';

import React, { useState } from 'react';
import { useSuperAdminData } from '@/hooks/useSuperAdminData';
import { useAppStore } from '@/lib/store';
import {
    LayoutDashboard, Users, ShieldAlert, Activity,
    MoreHorizontal, Search, Plus, Trash2, Edit, CheckCircle2,
    Lock, Key, ShieldCheck
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Doctor, AppUser } from '@/lib/types';

export default function SuperAdminPage() {
    const { financials, staff, system, branches } = useSuperAdminData();
    const { users, addUser, removeUser, updateUserStatus } = useAppStore();
    const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'STAFF' | 'SYSTEM'>('OVERVIEW');

    // Staff Management State
    const [staffView, setStaffView] = useState<'DOCTORS' | 'USERS'>('DOCTORS');
    const [showAddDoctor, setShowAddDoctor] = useState(false);
    const [newDoc, setNewDoc] = useState<Partial<Doctor>>({ name: 'Dr. ', specialization: 'General', status: 'READY' });

    // User Management State
    const [showAddUser, setShowAddUser] = useState(false);
    const [newUser, setNewUser] = useState<Partial<AppUser>>({ name: '', role: 'RECEPTION', accessLevel: 'READ', status: 'ACTIVE' });

    const handleAddDoctor = () => {
        if (!newDoc.name || !newDoc.specialization) return;

        staff.addDoctor({
            id: `doc-${Date.now()}`,
            name: newDoc.name,
            specialization: newDoc.specialization || 'General',
            categoryId: newDoc.specialization?.toLowerCase() || 'general',
            status: 'READY',
            queueCount: 0,
            estimatedWait: 0,
            consultDuration: 15, // Default
            ...newDoc
        } as Doctor);

        setShowAddDoctor(false);
        setNewDoc({ name: 'Dr. ', specialization: 'General', status: 'READY' });
    };

    const handleAddUser = () => {
        if (!newUser.name) return;
        addUser({
            id: `usr-${Date.now()}`,
            name: newUser.name,
            role: newUser.role || 'RECEPTION',
            accessLevel: newUser.accessLevel || 'READ',
            status: 'ACTIVE',
            lastLogin: Date.now()
        } as AppUser);
        setShowAddUser(false);
        setNewUser({ name: '', role: 'RECEPTION', accessLevel: 'READ', status: 'ACTIVE' });
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans selection:bg-indigo-100 selection:text-indigo-900">
            {/* SUPER HEADER */}
            <div className="border-b border-slate-200 bg-white sticky top-0 z-20 shadow-sm">
                <div className="px-6 py-4 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 bg-indigo-50 rounded-lg border border-indigo-100">
                            <ShieldAlert className="w-6 h-6 text-indigo-600" />
                        </div>
                        <div>
                            <h1 className="text-xl font-black tracking-tight text-slate-900">ORBIT <span className="text-indigo-600">GOD MODE</span></h1>
                            <p className="text-xs text-slate-500 font-mono uppercase tracking-widest">Network Command Center</p>
                        </div>
                    </div>

                    {/* Navigation Tabs */}
                    <div className="flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                        {(['OVERVIEW', 'STAFF', 'SYSTEM'] as const).map(tab => (
                            <button
                                key={tab}
                                onClick={() => setActiveTab(tab)}
                                className={cn(
                                    "px-4 py-1.5 text-xs font-bold rounded-lg transition-all",
                                    activeTab === tab ? "bg-white text-indigo-600 shadow-sm border border-slate-200" : "text-slate-500 hover:text-slate-800 hover:bg-slate-200"
                                )}
                            >
                                {tab}
                            </button>
                        ))}
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="text-right">
                            <div className="text-[10px] text-slate-400 uppercase font-bold">Network Revenue</div>
                            <div className="text-lg font-mono font-black text-emerald-600">₹{financials.totalRevenue.toLocaleString()}</div>
                        </div>
                        <div className="h-8 w-8 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-xs ring-2 ring-indigo-100 text-white cursor-pointer shadow-lg shadow-indigo-200">
                            SA
                        </div>
                    </div>
                </div>
            </div>

            <div className="p-8 max-w-7xl mx-auto">

                {/* 1. OVERVIEW TAB */}
                {activeTab === 'OVERVIEW' && (
                    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* KPI Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            {branches.map(branch => (
                                <div key={branch.id} className="bg-white border border-slate-200 rounded-2xl p-6 hover:shadow-xl transition-all group">
                                    <div className="flex justify-between items-start mb-4">
                                        <h3 className="font-bold text-lg text-slate-800 group-hover:text-indigo-600 transition-colors">{branch.name}</h3>
                                        <span className={cn(
                                            "px-2 py-0.5 rounded text-[10px] font-bold border",
                                            branch.healthScore > 90 ? "bg-emerald-50 text-emerald-700 border-emerald-100" : "bg-amber-50 text-amber-700 border-amber-100"
                                        )}>
                                            Health: {branch.healthScore}%
                                        </span>
                                    </div>
                                    <div className="space-y-2">
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">Revenue</span>
                                            <span className="font-mono font-bold text-emerald-600">₹{branch.revenue.toLocaleString()}</span>
                                        </div>
                                        <div className="flex justify-between text-sm">
                                            <span className="text-slate-500">P. Volume</span>
                                            <span className="font-mono font-bold text-slate-700">{branch.patients}</span>
                                        </div>
                                    </div>
                                    {/* Mini Graph Viz Placeholder */}
                                    <div className="mt-4 h-1 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500" style={{ width: `${branch.healthScore}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Recent Activity / Audit Feed */}
                        <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden shadow-sm">
                            <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center bg-slate-50/50">
                                <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                    <Activity className="w-4 h-4 text-indigo-500" />
                                    Live Network Activity
                                </h3>
                                <span className="text-xs text-slate-400 font-mono">Real-time Feed</span>
                            </div>
                            <div className="divide-y divide-slate-100 max-h-[400px] overflow-y-auto">
                                {system.auditLogs.map(log => (
                                    <div key={log.id} className="px-6 py-3 flex items-center justify-between hover:bg-slate-50 transition-colors group">
                                        <div className="flex items-center gap-4">
                                            <span className="font-mono text-xs text-slate-400 w-16">
                                                {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            </span>
                                            <div className="flex flex-col">
                                                <span className={cn(
                                                    "text-sm font-medium",
                                                    log.severity === 'CRITICAL' ? "text-red-600" : "text-slate-700"
                                                )}>
                                                    {log.details}
                                                </span>
                                                <span className="text-[10px] text-slate-400 uppercase tracking-widest">{log.actor} • {log.action}</span>
                                            </div>
                                        </div>
                                        {/* Severity Dot */}
                                        <div className={cn(
                                            "w-2 h-2 rounded-full",
                                            log.severity === 'CRITICAL' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.3)]" :
                                                log.severity === 'WARN' ? "bg-amber-400" : "bg-emerald-400 opacity-20 group-hover:opacity-100"
                                        )} />
                                    </div>
                                ))}
                                {system.auditLogs.length === 0 && (
                                    <div className="p-8 text-center text-slate-400 italic">No recent network activity.</div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* 2. STAFF TAB */}
                {activeTab === 'STAFF' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        {/* Sub-Tabs */}
                        <div className="flex items-center gap-4 mb-8">
                            <button
                                onClick={() => setStaffView('DOCTORS')}
                                className={cn(
                                    "px-4 py-2 font-bold text-sm rounded-lg border transition-all",
                                    staffView === 'DOCTORS' ? "bg-white border-slate-300 text-indigo-700 shadow-sm" : "border-transparent text-slate-500 hover:bg-slate-100"
                                )}
                            >
                                Clinical Staff (Doctors)
                            </button>
                            <button
                                onClick={() => setStaffView('USERS')}
                                className={cn(
                                    "px-4 py-2 font-bold text-sm rounded-lg border transition-all",
                                    staffView === 'USERS' ? "bg-white border-slate-300 text-indigo-700 shadow-sm" : "border-transparent text-slate-500 hover:bg-slate-100"
                                )}
                            >
                                System Users (RBAC)
                            </button>

                            <div className="flex-1" />

                            <button
                                onClick={() => staffView === 'DOCTORS' ? setShowAddDoctor(true) : setShowAddUser(true)}
                                className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-bold text-sm flex items-center gap-2 transition-all shadow-lg shadow-indigo-100 transform active:scale-95"
                            >
                                <Plus className="w-4 h-4" />
                                {staffView === 'DOCTORS' ? 'Add Doctor' : 'Create User'}
                            </button>
                        </div>

                        {staffView === 'DOCTORS' ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {staff.doctors.map(doc => (
                                    <div key={doc.id} className="bg-white border border-slate-200 rounded-xl p-5 relative group hover:border-indigo-200 hover:shadow-md transition-all">
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button className="p-1.5 hover:bg-slate-100 rounded text-slate-400 hover:text-indigo-600"><Edit className="w-4 h-4" /></button>
                                            <button
                                                onClick={() => {
                                                    if (confirm(`Revoke credentials for ${doc.name}?`)) staff.removeDoctor(doc.id);
                                                }}
                                                className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-12 w-12 bg-slate-100 rounded-full flex items-center justify-center text-xl shadow-inner">
                                                👨‍⚕️
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{doc.name}</h3>
                                                <span className="text-xs bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded">{doc.specialization}</span>
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-2 text-xs text-slate-500">
                                            <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                                <span className="block text-[10px] uppercase font-bold text-slate-400">Status</span>
                                                <span className={cn(
                                                    "font-bold",
                                                    doc.status === 'READY' ? "text-emerald-600" : "text-amber-600"
                                                )}>{doc.status}</span>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded border border-slate-100">
                                                <span className="block text-[10px] uppercase font-bold text-slate-400">Avg Consult</span>
                                                <span className="font-bold text-slate-700">{doc.consultDuration}m</span>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            /* USERS GRID */
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {users.length === 0 && (
                                    <div className="col-span-full py-20 text-center opacity-50">
                                        <Lock className="w-12 h-12 mx-auto mb-4 text-slate-300" />
                                        <p className="text-slate-500 font-bold">No system users defined yet.</p>
                                    </div>
                                )}
                                {users.map(user => (
                                    <div key={user.id} className="bg-white border border-slate-200 rounded-xl p-5 relative group hover:border-indigo-200 hover:shadow-md transition-all">
                                        <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => removeUser(user.id)}
                                                className="p-1.5 hover:bg-red-50 rounded text-slate-400 hover:text-red-500"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        <div className="flex items-center gap-4 mb-4">
                                            <div className="h-12 w-12 bg-indigo-50 rounded-full flex items-center justify-center shadow-inner">
                                                <Key className="w-5 h-5 text-indigo-500" />
                                            </div>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{user.name}</h3>
                                                <span className="text-xs font-mono text-slate-400">{user.id}</span>
                                            </div>
                                        </div>

                                        <div className="space-y-2 text-xs">
                                            <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                                <span className="text-slate-500">Role</span>
                                                <span className="font-bold bg-slate-100 px-2 py-0.5 rounded text-slate-700">{user.role}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-1 border-b border-slate-50">
                                                <span className="text-slate-500">Access</span>
                                                <span className="font-bold text-indigo-600">{user.accessLevel}</span>
                                            </div>
                                            <div className="flex justify-between items-center py-1">
                                                <span className="text-slate-500">Status</span>
                                                <button
                                                    onClick={() => updateUserStatus(user.id, user.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE')}
                                                    className={cn(
                                                        "font-bold px-2 py-0.5 rounded cursor-pointer transition-colors",
                                                        user.status === 'ACTIVE' ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                                                    )}
                                                >
                                                    {user.status}
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* 3. SYSTEM TAB */}
                {activeTab === 'SYSTEM' && (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500 grid grid-cols-2 gap-8">
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 shadow-sm">
                            <h3 className="font-bold text-lg mb-4 text-slate-800">System Health</h3>
                            <div className="space-y-4">
                                {Object.entries(system.health).map(([key, val]) => (
                                    <div key={key} className="flex justify-between items-center py-2 border-b border-slate-100 last:border-0">
                                        <span className="text-slate-500 capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                                        <span className="font-mono font-bold text-emerald-600">{val}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                        <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col items-center justify-center text-center shadow-sm">
                            <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
                                <ShieldCheck className="w-8 h-8 text-emerald-500" />
                            </div>
                            <h3 className="font-bold text-lg text-slate-800">All Systems Operational</h3>
                            <p className="text-slate-500 text-sm mt-2">Database integrity verified. Backup scheduled for 02:00 AM.</p>
                        </div>
                    </div>
                )}

            </div>

            {/* ADD DOCTOR MODAL */}
            {showAddDoctor && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Register New Doctor</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                                <input
                                    value={newDoc.name}
                                    onChange={e => setNewDoc({ ...newDoc, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="e.g. Dr. Jane Doe"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Specialization</label>
                                <select
                                    value={newDoc.specialization}
                                    onChange={e => setNewDoc({ ...newDoc, specialization: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                >
                                    {['General', 'Pediatrics', 'Ortho', 'Cardio', 'Neuro', 'Dermatology'].map(s => (
                                        <option key={s} value={s}>{s}</option>
                                    ))}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Avg. Consult Duration (mins)</label>
                                <input
                                    type="number"
                                    value={newDoc.consultDuration || 15}
                                    onChange={e => setNewDoc({ ...newDoc, consultDuration: parseInt(e.target.value) })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                />
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setShowAddDoctor(false)} className="text-slate-500 hover:text-slate-700 font-bold px-4 py-2">Cancel</button>
                            <button onClick={handleAddDoctor} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-lg shadow-lg shadow-indigo-200">Register</button>
                        </div>
                    </div>
                </div>
            )}

            {/* ADD USER MODAL */}
            {showAddUser && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-sm animate-in fade-in">
                    <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-2xl">
                        <h2 className="text-xl font-bold text-slate-800 mb-6">Create System User</h2>
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Full Name</label>
                                <input
                                    value={newUser.name}
                                    onChange={e => setNewUser({ ...newUser, name: e.target.value })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                    placeholder="e.g. Alice Administrator"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Role</label>
                                <select
                                    value={newUser.role}
                                    onChange={e => setNewUser({ ...newUser, role: e.target.value as any })}
                                    className="w-full bg-slate-50 border border-slate-200 rounded-lg p-3 text-slate-900 focus:ring-2 focus:ring-indigo-500 outline-none transition-all"
                                >
                                    <option value="RECEPTION">Receptionist</option>
                                    <option value="PHARMACY">Pharmacist</option>
                                    <option value="ADMIN">Admin</option>
                                    <option value="NURSE">Nurse</option>
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1">Access Level</label>
                                <div className="flex gap-4">
                                    {['READ', 'WRITE', 'FULL'].map(level => (
                                        <label key={level} className="flex items-center gap-2 text-sm text-slate-700 cursor-pointer">
                                            <input
                                                type="radio"
                                                name="access"
                                                checked={newUser.accessLevel === level}
                                                onChange={() => setNewUser({ ...newUser, accessLevel: level as any })}
                                            />
                                            {level}
                                        </label>
                                    ))}
                                </div>
                            </div>
                        </div>
                        <div className="flex justify-end gap-3 mt-8">
                            <button onClick={() => setShowAddUser(false)} className="text-slate-500 hover:text-slate-700 font-bold px-4 py-2">Cancel</button>
                            <button onClick={handleAddUser} className="bg-indigo-600 hover:bg-indigo-700 text-white font-bold px-6 py-2 rounded-lg shadow-lg shadow-indigo-200">Create User</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
