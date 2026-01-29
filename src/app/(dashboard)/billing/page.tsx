'use client';

import React, { useState } from 'react';
import { useBillingData, BillingRecord } from '@/hooks/useBillingData';
import { Search, Printer, CreditCard, User, FileText, CheckCircle2, Building2 } from 'lucide-react';
import { cn } from '@/lib/utils';

export default function BillingPage() {
    const { searchPatient, settleBill } = useBillingData();
    const [searchTerm, setSearchTerm] = useState('');
    const [record, setRecord] = useState<BillingRecord | null>(null);

    const handleSearch = (e: React.FormEvent) => {
        e.preventDefault();
        const found = searchPatient(searchTerm);
        if (found) {
            setRecord(found);
        } else {
            alert('Patient not found!');
            setRecord(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
            {/* HEADER */}
            <div className="bg-white border-b border-slate-200 px-8 py-5 flex items-center justify-between sticky top-0 z-10 shadow-sm">
                <div className="flex items-center gap-4">
                    <div className="p-2.5 bg-indigo-100 rounded-xl text-indigo-700">
                        <CreditCard className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">BILLING & ACCOUNTS</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Centralized Financial Controller</p>
                    </div>
                </div>

                {/* SEARCH BAR */}
                <form onSubmit={handleSearch} className="flex-1 max-w-xl mx-12 relative">
                    <Search className="absolute left-4 top-3.5 h-5 w-5 text-slate-400" />
                    <input
                        type="text"
                        placeholder="Search by Patient Name or ID..."
                        className="w-full pl-12 pr-4 py-3 bg-slate-100 border border-transparent rounded-2xl text-sm font-medium focus:bg-white focus:border-indigo-500 focus:ring-4 focus:ring-indigo-500/10 transition-all outline-none"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </form>

                <div className="text-right">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Today's Date</div>
                    <div className="font-mono font-bold text-slate-700">{new Date().toLocaleDateString()}</div>
                </div>
            </div>

            {/* CONTENT */}
            <div className="max-w-7xl mx-auto p-8">
                {record ? (
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">

                        {/* LEFT: PATIENT PROFILE */}
                        <div className="space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-sm">
                                <div className="flex items-center gap-4 mb-6">
                                    <div className="h-16 w-16 bg-slate-100 rounded-full flex items-center justify-center text-3xl">
                                        🧑‍
                                    </div>
                                    <div>
                                        <h2 className="text-xl font-bold text-slate-800">{record.patientName}</h2>
                                        <p className="text-sm text-slate-500 font-mono">ID: {record.patientId}</p>
                                    </div>
                                </div>
                                <div className="space-y-3 text-sm">
                                    <div className="flex justify-between border-b border-slate-50 pb-2">
                                        <span className="text-slate-500">Contact</span>
                                        <span className="font-medium text-slate-800">{record.mobile || 'N/A'}</span>
                                    </div>
                                    <div className="flex justify-between border-b border-slate-50 pb-2">
                                        <span className="text-slate-500">Age / Gender</span>
                                        <span className="font-medium text-slate-800">{record.age || '--'} Y / {record.gender || '--'}</span>
                                    </div>
                                    {record.isIPDActive && (
                                        <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-xl flex items-center gap-3 text-red-700 animate-pulse">
                                            <Building2 className="w-5 h-5" />
                                            <div>
                                                <div className="text-xs font-bold uppercase">Currently Admitted</div>
                                                <div className="font-medium text-sm">{record.bedInfo}</div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* PAYMENT SUMMARY S/BAR */}
                            <div className="bg-slate-900 text-white rounded-2xl p-6 shadow-lg">
                                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-6">Payment Summary</h3>

                                <div className="space-y-4 mb-8">
                                    <div className="flex justify-between items-center">
                                        <span className="text-slate-400">Total Billed</span>
                                        <span className="text-xl font-medium">₹{record.total.toLocaleString()}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span className="text-emerald-400">Paid Amount</span>
                                        <span className="text-xl font-medium text-emerald-400">- ₹{record.paidAmount.toLocaleString()}</span>
                                    </div>
                                    <div className="h-px bg-slate-700 my-2" />
                                    <div className="flex justify-between items-center">
                                        <span className="font-bold text-indigo-400 uppercase tracking-wider">Due Balance</span>
                                        <span className="text-3xl font-black text-white">₹{record.dueAmount.toLocaleString()}</span>
                                    </div>
                                </div>

                                <button
                                    onClick={() => settleBill(record.patientId)}
                                    disabled={record.dueAmount <= 0}
                                    className="w-full py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold flex items-center justify-center gap-2 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-900/30"
                                >
                                    <CheckCircle2 className="w-5 h-5" />
                                    {record.dueAmount <= 0 ? 'Settled' : 'Record Payment'}
                                </button>
                            </div>
                        </div>

                        {/* RIGHT: BILL BREAKDOWN */}
                        <div className="lg:col-span-2 space-y-6">
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <FileText className="w-5 h-5 text-slate-400" />
                                        Invoice Details
                                    </h3>
                                    <button
                                        onClick={() => window.print()}
                                        className="text-sm font-medium text-slate-500 hover:text-indigo-600 flex items-center gap-1 transition-colors"
                                    >
                                        <Printer className="w-4 h-4" />
                                        Print Statement
                                    </button>
                                </div>

                                <table className="w-full text-left text-sm">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs">
                                        <tr>
                                            <th className="px-6 py-4">Description</th>
                                            <th className="px-6 py-4">Category</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-right">Amount</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {record.items.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-8 text-center text-slate-400 italic">No billable items found.</td>
                                            </tr>
                                        ) : (
                                            record.items.map((item, idx) => (
                                                <tr key={idx} className="hover:bg-slate-50 transition-colors">
                                                    <td className="px-6 py-4">
                                                        <div className="font-medium text-slate-800">{item.description}</div>
                                                        <div className="text-xs text-slate-400">{item.id} • {item.date}</div>
                                                    </td>
                                                    <td className="px-6 py-4">
                                                        <span className={cn(
                                                            "px-2.5 py-1 rounded-md text-[10px] font-bold border",
                                                            item.category === 'OPD' && "bg-blue-50 text-blue-700 border-blue-100",
                                                            item.category === 'PHARMACY' && "bg-emerald-50 text-emerald-700 border-emerald-100",
                                                            item.category === 'IPD' && "bg-purple-50 text-purple-700 border-purple-100",
                                                        )}>
                                                            {item.category}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <span className={cn(
                                                            "inline-flex items-center gap-1 text-xs font-bold",
                                                            item.status === 'Paid' ? "text-emerald-600" : "text-amber-500 animate-pulse"
                                                        )}>
                                                            {item.status === 'Paid' ? <CheckCircle2 className="w-3 h-3" /> : '⏳'}
                                                            {item.status}
                                                        </span>
                                                    </td>
                                                    <td className="px-6 py-4 text-right font-bold text-slate-700 font-mono">
                                                        ₹{item.amount.toLocaleString()}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                    <tfoot className="bg-slate-50 border-t border-slate-200">
                                        <tr>
                                            <td colSpan={3} className="px-6 py-4 text-right font-bold text-slate-500 uppercase">Grand Total</td>
                                            <td className="px-6 py-4 text-right font-black text-xl text-slate-900">₹{record.total.toLocaleString()}</td>
                                        </tr>
                                    </tfoot>
                                </table>
                            </div>
                        </div>
                    </div>
                ) : (
                    /* EMPTY STATE */
                    <div className="flex flex-col items-center justify-center py-20 text-center opacity-60">
                        <div className="w-32 h-32 bg-slate-100 rounded-full flex items-center justify-center mb-6">
                            <Search className="w-12 h-12 text-slate-300" />
                        </div>
                        <h2 className="text-2xl font-bold text-slate-400 mb-2">Patient Search</h2>
                        <p className="text-slate-400 max-w-md">Enter Patient Name or ID above to fetch their consolidated financial record.</p>
                    </div>
                )}
            </div>
        </div>
    );
}
