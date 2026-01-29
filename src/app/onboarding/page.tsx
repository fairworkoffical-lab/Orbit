'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useTenant } from '@/components/saas/TenantProvider';
import { Building2, ArrowRight, Check, BedDouble, Pill, Users, LayoutDashboard, CreditCard, Box, ShieldCheck } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAppStore } from '@/lib/store';

// APP STORE MOCK DATA
const AVAILABLE_APPS = [
    { id: 'opd', name: 'OPD Command Center', desc: 'Queue & Triage Management', icon: Users, color: 'text-blue-500', bg: 'bg-blue-50', required: true },
    { id: 'billing', name: 'Billing Engine', desc: 'Invoices & Revenue Cycle', icon: CreditCard, color: 'text-indigo-500', bg: 'bg-indigo-50', required: true },
    { id: 'ipd', name: 'IPD Ward Manager', desc: 'Bed Allocation & Admissions', icon: BedDouble, color: 'text-purple-500', bg: 'bg-purple-50', required: false },
    { id: 'pharmacy', name: 'Pharmacy Pro', desc: 'Inventory & Dispensary', icon: Pill, color: 'text-emerald-500', bg: 'bg-emerald-50', required: false },
    { id: 'admin', name: 'Ops War Room', desc: 'Analytics & Admin Console', icon: LayoutDashboard, color: 'text-red-500', bg: 'bg-red-50', required: false },
];

export default function OnboardingPage() {
    const router = useRouter();
    const { setTenant } = useTenant();
    const { currentUser } = useAppStore(); // Assuming user is logged in
    const [step, setStep] = useState(1);

    // Form State
    const [workspaceName, setWorkspaceName] = useState('');
    const [installedApps, setInstalledApps] = useState<string[]>(['opd', 'billing']); // Core apps default

    const toggleApp = (id: string, required: boolean) => {
        if (required) return; // Cannot uninstall core
        if (installedApps.includes(id)) {
            setInstalledApps(installedApps.filter(a => a !== id));
        } else {
            setInstalledApps([...installedApps, id]);
        }
    };

    const handleCreateWorkspace = () => {
        // Construct the Tenant Config
        const modules: any = {};
        // Default all to false first
        ['opd', 'ipd', 'pharmacy', 'billing', 'admin', 'super-admin', 'lab'].forEach(k => modules[k] = false);

        // Enable installed
        installedApps.forEach(app => modules[app] = true);

        // Enable super-admin for the creator
        modules['super-admin'] = true;

        const newTenant = {
            id: `workspace-${Date.now()}`,
            name: workspaceName,
            slug: workspaceName.toLowerCase().replace(/\s+/g, '-'),
            modules: modules,
            plan: 'pro' as const,
        };

        // Update Context (and simulate backend save)
        setTenant(newTenant);

        // Redirect
        router.push('/');
    };

    return (
        <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-8">
            <div className="w-full max-w-4xl">

                {/* STEPS INDICATOR */}
                <div className="flex items-center justify-between mb-12 px-12">
                    <div className={cn("flex items-center gap-2 text-sm font-bold transition-colors", step >= 1 ? "text-indigo-600" : "text-slate-300")}>
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2", step >= 1 ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-300")}>1</div>
                        Identity
                    </div>
                    <div className="h-1 flex-1 bg-slate-200 mx-4 rounded-full">
                        <div className="h-full bg-indigo-600 rounded-full transition-all duration-500" style={{ width: step === 1 ? '50%' : step === 2 ? '100%' : '0%' }}></div>
                    </div>
                    <div className={cn("flex items-center gap-2 text-sm font-bold transition-colors", step >= 2 ? "text-indigo-600" : "text-slate-300")}>
                        <div className={cn("w-8 h-8 rounded-full flex items-center justify-center border-2", step >= 2 ? "bg-indigo-600 text-white border-indigo-600" : "border-slate-300")}>2</div>
                        Install Apps
                    </div>
                </div>


                {/* CONTENT CARD */}
                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200 border border-slate-100 p-12 min-h-[500px] flex flex-col">

                    {step === 1 && (
                        <div className="flex-1 flex flex-col justify-center animate-in fade-in slide-in-from-right-8 duration-500">
                            <h1 className="text-4xl font-black text-slate-800 mb-4">Name your Workspace</h1>
                            <p className="text-lg text-slate-500 mb-8 max-w-lg">This will be the digital home for your hospital. You can change this later.</p>

                            <div className="relative max-w-xl">
                                <Building2 className="absolute left-6 top-1/2 -translate-y-1/2 w-8 h-8 text-indigo-300" />
                                <input
                                    autoFocus
                                    className="w-full pl-20 pr-6 py-6 text-3xl font-black text-slate-800 placeholder:text-slate-200 border-b-4 border-slate-100 focus:border-indigo-500 outline-none transition-all bg-transparent"
                                    placeholder="Apollo Digital..."
                                    value={workspaceName}
                                    onChange={(e) => setWorkspaceName(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && workspaceName && setStep(2)}
                                />
                            </div>
                        </div>
                    )}

                    {step === 2 && (
                        <div className="flex-1 animate-in fade-in slide-in-from-right-8 duration-500">
                            <h1 className="text-3xl font-black text-slate-800 mb-2">Install Apps</h1>
                            <p className="text-slate-500 mb-8">Select the modules you need for {workspaceName}.</p>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {AVAILABLE_APPS.map((app) => {
                                    const isInstalled = installedApps.includes(app.id);
                                    const Icon = app.icon;

                                    return (
                                        <button
                                            key={app.id}
                                            onClick={() => toggleApp(app.id, app.required)}
                                            className={cn(
                                                "relative p-4 rounded-2xl border-2 text-left transition-all flex items-start gap-4 group",
                                                isInstalled
                                                    ? "bg-white border-indigo-600 shadow-lg shadow-indigo-100 ring-1 ring-indigo-600"
                                                    : "bg-slate-50 border-slate-100 hover:border-slate-300 opacity-70 hover:opacity-100"
                                            )}
                                        >
                                            <div className={cn("p-3 rounded-xl", app.bg, app.color)}>
                                                <Icon className="w-6 h-6" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center justify-between">
                                                    <h3 className={cn("font-bold text-lg", isInstalled ? "text-slate-900" : "text-slate-500")}>
                                                        {app.name}
                                                    </h3>
                                                    {isInstalled && <Check className="w-5 h-5 text-indigo-600" />}
                                                </div>
                                                <p className="text-sm text-slate-400 font-medium">{app.desc}</p>
                                            </div>
                                            {app.required && (
                                                <span className="absolute top-2 right-2 text-[10px] font-bold text-slate-300 uppercase tracking-wider">Required</span>
                                            )}
                                        </button>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {/* FOOTER ACTIONS */}
                    <div className="mt-8 flex justify-end">
                        {step === 1 ? (
                            <button
                                onClick={() => setStep(2)}
                                disabled={!workspaceName}
                                className="px-8 py-4 bg-slate-900 text-white rounded-xl font-bold text-lg hover:bg-black transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
                            >
                                Next Step <ArrowRight className="w-5 h-5" />
                            </button>
                        ) : (
                            <button
                                onClick={handleCreateWorkspace}
                                className="px-8 py-4 bg-indigo-600 text-white rounded-xl font-bold text-lg hover:bg-indigo-700 shadow-xl shadow-indigo-500/30 transition-all flex items-center gap-2"
                            >
                                <Box className="w-5 h-5" /> Launch Workspace
                            </button>
                        )}
                    </div>

                </div>
            </div>
        </div>
    );
}
