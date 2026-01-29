'use client';

import React from 'react';
import { useAdminData } from '@/hooks/useAdminData';
import {
    Activity, Users, Clock, AlertTriangle, BedDouble,
    TrendingUp, AlertOctagon, BarChart3, Zap, ArrowRight, DollarSign
} from 'lucide-react';
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer,
    Cell, PieChart, Pie, AreaChart, Area
} from 'recharts';
import { cn } from '@/lib/utils';

export default function AdminPage() {
    const [selectedDate, setSelectedDate] = React.useState<Date>(new Date());
    const metrics = useAdminData(selectedDate);

    if (!metrics) {
        return (
            <div className="flex h-[80vh] items-center justify-center bg-slate-50">
                <div className="h-12 w-12 animate-spin rounded-full border-4 border-slate-200 border-t-blue-600"></div>
            </div>
        );
    }

    // Prepare Data for Charts
    const doctorLoadData = metrics.opd.doctorLoad.map(d => ({
        name: d.name.split(' ').slice(1).join(' '), // Last name only for brevity
        queue: d.queue,
        status: d.status
    }));

    const occupancyData = [
        { name: 'Occupied', value: metrics.ipd.occupiedBeds },
        { name: 'Available', value: metrics.ipd.totalBeds - metrics.ipd.occupiedBeds }
    ];

    const doctorStatusData = [
        { name: 'Available', value: metrics.opd.doctorStats.available, color: '#10b981' },
        { name: 'Busy', value: metrics.opd.doctorStats.busy, color: '#f59e0b' },
        { name: 'Unavailable', value: metrics.opd.doctorStats.unavailable, color: '#64748b' },
    ];

    const COLORS = ['#ef4444', '#10b981']; // Red (Occupied), Green (Free)

    const formatDate = (date: Date) => {
        return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    };

    const changeDate = (days: number) => {
        const newDate = new Date(selectedDate);
        newDate.setDate(selectedDate.getDate() + days);
        setSelectedDate(newDate);
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 p-6 font-sans">
            {/* HEADER */}
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-black tracking-tight text-slate-900 flex items-center gap-3">
                        <div className="p-3 bg-white rounded-xl shadow-sm border border-slate-200">
                            <Zap className="h-8 w-8 text-yellow-500 fill-yellow-500" />
                        </div>
                        OPERATIONS COMMAND
                    </h1>
                    <p className="text-slate-500 font-mono text-xs mt-2 tracking-wider uppercase pl-16">
                        System Monitor • {selectedDate.toDateString() === new Date().toDateString() ? 'LIVE' : 'HISTORICAL VIEW'}
                    </p>
                </div>

                <div className="flex items-center gap-6">
                    {/* DATE PICKER */}
                    <div className="flex items-center bg-white rounded-xl border border-slate-200 shadow-sm p-1">
                        <button onClick={() => changeDate(-1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
                            <ArrowRight className="h-5 w-5 rotate-180" />
                        </button>
                        <div className="px-4 py-1 flex flex-col items-center min-w-[140px]">
                            <span className="text-xs text-slate-400 font-bold uppercase tracking-wider">Viewing Date</span>
                            <span className="text-sm font-bold text-slate-800">{formatDate(selectedDate)}</span>
                        </div>
                        <button onClick={() => changeDate(1)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500" disabled={selectedDate.toDateString() === new Date().toDateString()}>
                            <ArrowRight className="h-5 w-5" />
                        </button>
                    </div>

                    <div className={cn(
                        "px-6 py-3 rounded-xl border-2 font-black font-mono text-2xl flex items-center gap-3 shadow-sm bg-white",
                        metrics.chaosScore > 70 ? "border-red-500 text-red-500" :
                            metrics.chaosScore > 40 ? "border-amber-500 text-amber-500" :
                                "border-emerald-500 text-emerald-500"
                    )}>
                        <Activity className="h-6 w-6" />
                        CHAOS: {metrics.chaosScore}%
                    </div>
                </div>
            </header>

            {/* KPI GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {/* 1. OPD LOAD */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group shadow-md hover:shadow-xl transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <Users className="h-32 w-32 text-blue-600" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Total Visits</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-slate-900">{metrics.opd.totalVisits}</span>
                            <span className="text-sm font-medium text-slate-500">patients</span>
                        </div>
                        <div className="mt-4 flex gap-2 text-xs font-bold">
                            <span className="px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
                                {metrics.opd.completed} Done
                            </span>
                            <span className="px-3 py-1.5 rounded-full bg-slate-50 text-slate-600 border border-slate-200">
                                {metrics.opd.emergencyCount} Emergency
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. REVENUE (Swapped with Wait Time) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group shadow-md hover:shadow-xl transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <DollarSign className="h-32 w-32 text-emerald-600" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Pharmacy Revenue</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-slate-900">₹{(metrics.pharmacy?.revenue || 0).toLocaleString()}</span>
                            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">Today</span>
                        </div>
                        <div className="mt-4 text-xs font-medium text-slate-400">
                            Simulated transactional data
                        </div>
                    </div>
                </div>

                {/* 3. IPD OCCUPANCY */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group shadow-md hover:shadow-xl transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <BedDouble className="h-32 w-32 text-purple-600" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Bed Occupancy</h3>
                        <div className="flex items-baseline gap-2">
                            <span className="text-5xl font-black text-slate-900">{metrics.ipd.occupancyRate}%</span>
                            <span className="text-sm font-medium text-slate-500">full</span>
                        </div>
                        <div className="mt-4 w-full bg-slate-100 rounded-full h-2 overflow-hidden">
                            <div
                                className="h-full bg-purple-600 transition-all duration-500"
                                style={{ width: `${metrics.ipd.occupancyRate}%` }}
                            />
                        </div>
                    </div>
                </div>

                {/* 4. DOCTOR AVAILABILITY */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 relative overflow-hidden group shadow-md hover:shadow-xl transition-all">
                    <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                        <TrendingUp className="h-32 w-32 text-emerald-600" />
                    </div>
                    <div className="relative z-10">
                        <h3 className="text-slate-500 text-xs font-bold uppercase tracking-wider mb-2">Doctor Availability</h3>
                        <div className="flex items-center gap-4">
                            <div className="h-16 w-16 relative">
                                <ResponsiveContainer width="100%" height="100%">
                                    <PieChart>
                                        <Pie
                                            data={doctorStatusData}
                                            innerRadius={20}
                                            outerRadius={30}
                                            paddingAngle={5}
                                            dataKey="value"
                                            stroke="none"
                                        >
                                            {doctorStatusData.map((entry, index) => (
                                                <Cell key={`cell-${index}`} fill={entry.color} />
                                            ))}
                                        </Pie>
                                    </PieChart>
                                </ResponsiveContainer>
                            </div>
                            <div className="flex flex-col justify-center">
                                <div className="text-2xl font-black text-slate-900">{Math.round((metrics.opd.doctorStats.available / (metrics.opd.doctorStats.available + metrics.opd.doctorStats.busy + metrics.opd.doctorStats.unavailable || 1)) * 100)}%</div>
                                <div className="text-xs text-slate-500 font-bold">Effective</div>
                            </div>
                        </div>
                        <div className="mt-2 text-xs flex gap-3 text-slate-500 font-medium">
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-emerald-500"></div> {metrics.opd.doctorStats.available} Avail</span>
                            <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-amber-500"></div> {metrics.opd.doctorStats.busy} Busy</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN DASHBOARD CONTENT */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px]">

                {/* LEFT: DOCTOR LOAD */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col shadow-md">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-slate-800 font-bold flex items-center gap-2 text-lg">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            OPD Doctor Load
                        </h3>
                    </div>
                    <div className="flex-1 w-full min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={doctorLoadData}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                                <XAxis
                                    dataKey="name"
                                    stroke="#64748b"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{
                                        backgroundColor: '#ffffff',
                                        borderColor: '#e2e8f0',
                                        color: '#1e293b',
                                        borderRadius: '8px',
                                        boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'
                                    }}
                                    cursor={{ fill: '#f1f5f9', opacity: 0.5 }}
                                />
                                <Bar dataKey="queue" radius={[4, 4, 0, 0]}>
                                    {doctorLoadData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.queue > 8 ? '#ef4444' : '#3b82f6'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* RIGHT: IPD CAPACITY (SEMI-CIRCLE GAUGE) */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col shadow-md relative overflow-hidden">
                    <h3 className="text-slate-800 font-bold mb-2 flex items-center gap-2 text-lg z-10 relative">
                        <BedDouble className="w-5 h-5 text-purple-600" />
                        IPD Capacity
                    </h3>
                    <div className="flex-1 w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={occupancyData}
                                    cx="50%"
                                    cy="85%"
                                    startAngle={180}
                                    endAngle={0}
                                    innerRadius="100%"
                                    outerRadius="140%"
                                    paddingAngle={2}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {occupancyData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute inset-x-0 bottom-0 flex flex-col items-center justify-center pointer-events-none mb-4">
                            <span className="text-5xl font-black text-slate-900">{metrics.ipd.totalBeds - metrics.ipd.occupiedBeds}</span>
                            <span className="text-xs uppercase text-emerald-600 font-bold tracking-wider mt-1">Available Beds</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* ANALYTICS ROW 2 (Time & Alerts) */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 h-[400px] mt-6">

                {/* LEFT: THROUGHPUT TIMELINE */}
                <div className="lg:col-span-2 bg-white border border-slate-200 rounded-2xl p-6 flex flex-col shadow-md">
                    <div className="flex items-center justify-between mb-6">
                        <h3 className="text-slate-800 font-bold flex items-center gap-2 text-lg">
                            <BarChart3 className="w-5 h-5 text-blue-600" />
                            Hourly Patient Throughput
                        </h3>
                    </div>
                    <div className="flex-1 w-full min-h-[250px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={metrics.opd.visitsByHour}>
                                <defs>
                                    <linearGradient id="colorVisits" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis
                                    dataKey="hour"
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                    dy={10}
                                />
                                <YAxis
                                    stroke="#94a3b8"
                                    fontSize={12}
                                    tickLine={false}
                                    axisLine={false}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#ffffff', borderColor: '#e2e8f0', borderRadius: '8px', color: '#1e293b' }}
                                />
                                <Area type="monotone" dataKey="count" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorVisits)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* RIGHT: ALERTS FEED */}
                <div className="bg-white border border-slate-200 rounded-2xl p-6 flex flex-col shadow-md overflow-hidden">
                    <h3 className="text-slate-800 font-bold mb-4 flex items-center gap-2 text-lg">
                        <AlertOctagon className="w-5 h-5 text-red-600" />
                        Critical Feed
                    </h3>
                    <div className="space-y-3 overflow-y-auto custom-scrollbar pr-2 flex-1">
                        {metrics.alerts.length > 0 ? (
                            metrics.alerts.map((alert, idx) => (
                                <div key={idx} className="bg-red-50 border border-red-100 p-3 rounded-lg flex items-start gap-3">
                                    <div className="h-2 w-2 rounded-full bg-red-500 mt-1.5 animate-pulse" />
                                    <span className="text-sm font-medium text-red-900">{alert}</span>
                                </div>
                            ))
                        ) : (
                            <div className="text-slate-400 text-center py-8 italic text-sm">
                                No active alerts. System running smoothly.
                            </div>
                        )}

                        {/* Pending Admissions Alert */}
                        {metrics.ipd.pendingRequests > 0 && (
                            <div className="bg-amber-50 border border-amber-100 p-3 rounded-lg flex items-start gap-3">
                                <div className="h-2 w-2 rounded-full bg-amber-500 mt-1.5" />
                                <span className="text-sm font-medium text-amber-900">
                                    {metrics.ipd.pendingRequests} IPD Admission Requests Pending
                                </span>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
