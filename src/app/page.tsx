
'use client';

import React from 'react';
import Link from 'next/link';
import { Stethoscope, UserCheck, LayoutDashboard, BedDouble, Pill, Users, ArrowRight, Activity, ShieldCheck, CreditCard, ShieldAlert, Building2, ChevronDown } from 'lucide-react';
import { useTenant } from '@/components/saas/TenantProvider';
import { TenantConfig } from '@/lib/saas-types';
import { useAppStore } from '@/lib/store';

export default function Home() {
  const { tenant, setTenant, hasModule } = useTenant();
  const { currentUser } = useAppStore();

  // AUTO-FIX: If we are on the test clinic and super-admin is missing (from old cache), force update it.
  React.useEffect(() => {
    if (tenant.id === 'clinic_1' && !tenant.modules['super-admin']) {
      setTenant({
        id: 'clinic_1',
        name: 'Anjali Family Clinic',
        slug: 'anjali-clinic',
        modules: {
          opd: true,
          billing: true,
          ipd: true,
          pharmacy: true,
          admin: true,
          'super-admin': true, // FORCE ENABLE
          lab: false
        },
        plan: 'pro'
      });
    }
  }, [tenant, setTenant]);

  const handleSwitchTenant = () => {
    // Simulation of switching to a "Basic Clinic" layout
    if (tenant.id === 'default') {
      setTenant({
        id: 'clinic_1',
        name: 'Anjali Family Clinic',
        slug: 'anjali-clinic',
        modules: {
          opd: true,
          billing: true, // Only OPD + Billing
          ipd: true,    // Enabled (Pro Plan)
          pharmacy: true,
          admin: true,
          'super-admin': true, // Enable for demo
          lab: false
        },
        plan: 'pro'
      });
      alert("Switched to 'Anjali Family Clinic' Workspace (OPD + Billing Only)");
    } else {
      // Reset
      setTenant(require('@/lib/saas-types').DEFAULT_TENANT);
      alert("Switched back to 'Orbit General Hospital' (Enterprise)");
    }
  };

  return (
    <main className="flex min-h-screen flex-col items-center bg-slate-50 relative selection:bg-indigo-100 selection:text-indigo-900">

      {/* SAAS TOP BAR */}
      <div className="w-full bg-white border-b border-slate-200 px-8 py-3 flex justify-between items-center sticky top-0 z-50 shadow-sm">
        <div className="flex items-center gap-2">
          <div className="h-8 w-8 bg-indigo-600 rounded-lg flex items-center justify-center text-white font-black hover:rotate-12 transition-transform cursor-pointer">
            O
          </div>
          <div className="flex flex-col">
            <span className="font-bold text-slate-800 tracking-tight leading-none text-lg">ORBIT</span>
            <span className="text-[10px] font-bold text-indigo-600 uppercase tracking-widest">Hospital OS</span>
          </div>
        </div>

        {/* TENANT SWITCHER (CLICKUP STYLE) */}
        <button
          onClick={handleSwitchTenant}
          className="flex items-center gap-3 bg-slate-100 hover:bg-slate-200 border border-slate-200 px-4 py-2 rounded-xl transition-all group"
        >
          <div className="h-8 w-8 bg-indigo-100 rounded-md flex items-center justify-center border border-indigo-200 group-hover:bg-indigo-200 transition-colors">
            <Building2 className="w-4 h-4 text-indigo-700" />
          </div>
          <div className="text-left hidden md:block">
            <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Current Workspace</div>
            <div className="text-sm font-bold text-slate-800 flex items-center gap-1">
              {tenant.name}
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </div>
          </div>
        </button>

        <div className="flex items-center gap-4">
          <span className="hidden md:inline-flex px-3 py-1 bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full text-xs font-bold">
            ● v1.2 Live
          </span>
          {currentUser ? (
            <div className="flex items-center gap-3 pl-4 border-l border-slate-200">
              <div className="text-right hidden md:block">
                <div className="text-xs font-bold text-slate-900">{currentUser.role}</div>
                <button onClick={() => useAppStore.getState().logout()} className="text-[10px] font-bold text-red-500 hover:text-red-700 uppercase tracking-wider cursor-pointer">
                  Sign Out
                </button>
              </div>
              <div className="h-9 w-9 bg-indigo-600 rounded-full flex items-center justify-center text-white font-bold shadow-md shadow-indigo-200">
                {currentUser.role.charAt(0)}
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              className="px-5 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-black transition-all shadow-lg shadow-slate-900/20 active:scale-95"
            >
              Sign In
            </Link>
          )}
        </div>
      </div>

      {/* Background Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-blue-400/20 blur-[120px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] rounded-full bg-purple-400/20 blur-[120px]" />
      </div>

      <div className="z-10 container mx-auto px-4 py-24 flex flex-col items-center text-center">

        {/* Badge */}
        <div className="inline-flex items-center rounded-full border border-blue-200 bg-blue-50 px-3 py-1 text-sm font-medium text-blue-800 backdrop-blur-sm mb-8">
          <span className="flex h-2 w-2 rounded-full bg-blue-600 mr-2 animate-pulse"></span>
          ORBIT Hospital OS v1.1 Live
        </div>

        {/* Hero Text */}
        <h1 className="text-5xl font-extrabold tracking-tight sm:text-7xl mb-6 bg-gradient-to-r from-slate-900 to-slate-600 bg-clip-text text-transparent">
          The Operating System <br /> for <span className="text-blue-600">High-Chaos</span> Hospitals.
        </h1>

        <p className="mt-4 max-w-2xl text-lg text-slate-600 mb-12">
          Orchestrate patient flow, predict bottlenecks, and reduce provider burnout with AI-driven queue management. designed for India's busiest OPDs.
        </p>

        {/* Action Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-8 w-full max-w-5xl z-10">

          {/* 1. RECEPTION (Always On) */}
          {hasModule('opd') && (
            <Link href="/reception" className="group relative overflow-hidden rounded-2xl border bg-white p-8 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y--8 rounded-full bg-blue-50 opacity-50 transition-all group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-xl bg-blue-50 p-3 text-blue-600">
                  <Users className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-slate-800">Reception Desk</h2>
                <p className="font-medium text-slate-500">Fast-track registration for walk-ins. Handle queue overrides and triage instantly.</p>
                <div className="mt-4 flex items-center font-bold text-blue-600 group-hover:gap-2 transition-all">
                  Launch Dashboard <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </Link>
          )}

          {/* 2. DOCTOR CONSOLE (Always On) */}
          {hasModule('opd') && (
            <Link href="/doctor" className="group relative overflow-hidden rounded-2xl border bg-white p-8 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y--8 rounded-full bg-emerald-50 opacity-50 transition-all group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <Activity className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-slate-800">Doctor Console</h2>
                <p className="font-medium text-slate-500">Focus on care, not chaos. View live queue, patient history, and autonomous alerts.</p>
                <div className="mt-4 flex items-center font-bold text-emerald-600 group-hover:gap-2 transition-all">
                  Open Console <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </Link>
          )}

          {/* 3. IPD (Feature Flagged) */}
          {hasModule('ipd') ? (
            <Link href="/ipd" className="group relative overflow-hidden rounded-2xl border bg-white p-8 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y--8 rounded-full bg-purple-50 opacity-50 transition-all group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-xl bg-purple-50 p-3 text-purple-600">
                  <BedDouble className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-slate-800">IPD / Ward Operations</h2>
                <p className="font-medium text-slate-500">Manage admissions, bed allocation, and ward shifts.</p>
                <div className="mt-4 flex items-center font-bold text-purple-600 group-hover:gap-2 transition-all">
                  Access Ward Console <ArrowRight className="ml-1 h-4 w-4" />
                </div>
              </div>
            </Link>
          ) : (
            // TEASER CARD FOR DISABLED MODULE
            <div className="group relative overflow-hidden rounded-2xl border border-dashed border-slate-300 bg-slate-50 p-8 opacity-75">
              <div className="relative z-10 filter grayscale">
                <div className="mb-4 inline-flex rounded-xl bg-slate-200 p-3 text-slate-400">
                  <BedDouble className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-slate-400">IPD Module</h2>
                <p className="font-medium text-slate-400">Ward Management & Bed Allocation.</p>
                <div className="mt-4 text-xs font-bold text-slate-400 uppercase tracking-widest bg-slate-200 inline-block px-2 py-1 rounded">Not Included in Plan</div>
              </div>
            </div>
          )}

          {/* 4. OPS CONSOLE */}
          {hasModule('admin') && (
            <Link href="/admin" className="group relative overflow-hidden rounded-2xl border bg-white p-8 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y--8 rounded-full bg-red-50 opacity-50 transition-all group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-xl bg-red-50 p-3 text-red-600">
                  <LayoutDashboard className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-slate-800">Operations Console</h2>
                <p className="font-medium text-slate-500">Live Hospital Metrics & War Room.</p>
              </div>
            </Link>
          )}

          {/* 5. PHARMACY */}
          {hasModule('pharmacy') && (
            <Link href="/pharmacy" className="group relative overflow-hidden rounded-2xl border bg-white p-8 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y--8 rounded-full bg-emerald-50 opacity-20 transition-all group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-xl bg-emerald-50 p-3 text-emerald-600">
                  <Pill className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-slate-800">Pharmacy</h2>
                <p className="font-medium text-slate-500">Dispensary & Billing.</p>
              </div>
            </Link>
          )}

          {/* 6. BILLING */}
          {hasModule('billing') && (
            <Link href="/billing" className="group relative overflow-hidden rounded-2xl border bg-white p-8 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y--8 rounded-full bg-indigo-100 opacity-20 transition-all group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-xl bg-indigo-100 p-3 text-indigo-600">
                  <CreditCard className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-slate-800">Billing & Accounts</h2>
                <p className="font-medium text-slate-500">Consolidated Patient Invoices.</p>
              </div>
            </Link>
          )}

          {/* 7. GOD MODE (Super Admin Only) */}
          {hasModule('super-admin') && (
            <Link href="/super-admin" className="group relative overflow-hidden rounded-2xl border bg-white p-8 shadow-xl transition-all hover:shadow-2xl hover:scale-[1.02]">
              <div className="absolute right-0 top-0 h-32 w-32 translate-x-8 translate-y--8 rounded-full bg-slate-100 opacity-20 transition-all group-hover:scale-150"></div>
              <div className="relative z-10">
                <div className="mb-4 inline-flex rounded-xl bg-slate-100 p-3 text-slate-600">
                  <ShieldAlert className="h-8 w-8" />
                </div>
                <h2 className="mb-2 text-2xl font-bold text-slate-800">Super Admin</h2>
                <p className="font-medium text-slate-500">Network Command Center.</p>
              </div>
            </Link>
          )}

        </div>

        {/* Feature Ticker */}
        <div className="mt-20 flex gap-8 text-sm text-slate-400 font-medium">
          <span className="flex items-center"><ShieldCheck className="w-4 h-4 mr-2" /> HIPAA Compliant</span>
          <span className="flex items-center"><Activity className="w-4 h-4 mr-2" /> 99.9% Uptime</span>
          <span className="flex items-center"><Users className="w-4 h-4 mr-2" /> Multi-Tenant Ready</span>
        </div>

      </div>
    </main>
  );
}
