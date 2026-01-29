'use client';

import React, { useState, useEffect } from 'react';
import { IpdService, AdmissionRequest, BedCategory } from '@/lib/ipd-store';
import { CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useParams } from 'next/navigation';

export default function PatientAdmissionPage({ params }: { params: { id: string } }) {
    const [request, setRequest] = useState<AdmissionRequest | null>(null);
    const [categories, setCategories] = useState<BedCategory[]>([]);
    const [selectedCategory, setSelectedCategory] = useState<string>('');
    const [confirmed, setConfirmed] = useState(false);

    // Mock Params for now if using static route, but assuming nextjs dynamic route
    // For prototype, we'll just grab the FIRST pending request if ID doesn't match
    // to make testing easier without copy-pasting UUIDs.

    useEffect(() => {
        IpdService.init();
        const data = IpdService.getData();
        setCategories(data.categories);

        let req = data.requests.find(r => r.id === params.id);
        if (!req) {
            // FALLBACK FOR DEMO: Get latest pending
            req = data.requests.find(r => r.status === 'PENDING');
        }

        if (req) {
            setRequest(req);
            setSelectedCategory(req.recommendedCategory);
        }
    }, [params.id]);

    const handleConfirm = () => {
        if (!request) return;

        // In a real app, we'd update via API. Here we update store directly.
        // We need to simulate the "PATIENT_SELECTED" event.
        // Since IpdService.getData() returns a copy, we need a robust update method.
        // We'll just cheat and re-read, modify, save.

        const data = IpdService.getData();
        const newRequests = data.requests.map(r => {
            if (r.id === request.id) {
                return { ...r, status: 'PATIENT_SELECTED' as const, patientSelection: selectedCategory };
            }
            return r;
        });

        localStorage.setItem('orbit_ipd_requests', JSON.stringify(newRequests));
        window.dispatchEvent(new Event('storage')); // Notify IPD Console

        setConfirmed(true);
    };

    if (!request) return <div className="p-10 text-center">Loading Admission Request... (or ID invalid)</div>;

    if (confirmed) {
        return (
            <div className="min-h-screen bg-emerald-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full p-8 rounded-3xl shadow-xl text-center">
                    <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6">
                        <CheckCircle2 className="w-10 h-10 text-emerald-600" />
                    </div>
                    <h1 className="text-2xl font-black text-slate-800 mb-2">Selection Confirmed!</h1>
                    <p className="text-slate-600 mb-6">
                        We have reserved a <strong className="text-emerald-700">{categories.find(c => c.id === selectedCategory)?.name}</strong> for you.
                    </p>
                    <div className="bg-slate-50 p-4 rounded-xl text-left text-sm text-slate-500 mb-6">
                        Please proceed to the <strong>Admission Desk (Ground Floor)</strong> to complete formalities. Your token is:
                        <div className="text-center text-3xl font-mono font-bold text-slate-800 mt-2 tracking-widest">
                            #IPD-{request.timestamp.toString().slice(-4)}
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 font-sans">
            {/* Header */}
            <div className="bg-white p-4 shadow-sm border-b sticky top-0 z-10">
                <div className="container mx-auto max-w-lg flex items-center gap-2">
                    <span className="text-xl">🏥</span>
                    <span className="font-bold text-slate-800">ORBIT Patient Portal</span>
                </div>
            </div>

            <main className="container mx-auto max-w-lg p-4 pb-24">
                <div className="bg-indigo-600 text-white p-6 rounded-2xl shadow-lg mb-6">
                    <div className="flex items-start justify-between">
                        <div>
                            <p className="text-indigo-100 font-medium text-sm mb-1">Admission Recommended by</p>
                            <h1 className="text-2xl font-bold">{request.doctorName}</h1>
                        </div>
                        {request.urgency === 'EMERGENCY' && (
                            <div className="bg-red-500 text-white px-3 py-1 rounded-full text-xs font-bold animate-pulse">
                                URGENT
                            </div>
                        )}
                    </div>
                    <div className="mt-4 pt-4 border-t border-indigo-500/50">
                        <p className="text-sm opacity-90">Reason: {request.reason}</p>
                    </div>
                </div>

                <h2 className="text-lg font-bold text-slate-700 mb-4 px-1">Select Room Category</h2>

                <div className="space-y-4">
                    {categories.map(cat => {
                        const isRecommended = cat.id === request.recommendedCategory;
                        const isSelected = cat.id === selectedCategory;

                        return (
                            <div
                                key={cat.id}
                                onClick={() => setSelectedCategory(cat.id)}
                                className={cn(
                                    "relative p-5 rounded-2xl border-2 transition-all cursor-pointer",
                                    isSelected ? "border-indigo-600 bg-indigo-50" : "border-slate-200 bg-white hover:border-slate-300"
                                )}
                            >
                                {isRecommended && (
                                    <div className="absolute -top-3 left-4 bg-amber-400 text-amber-900 text-[10px] font-bold px-2 py-1 rounded-full shadow-sm">
                                        ⭐ DOCTOR RECOMMENDED
                                    </div>
                                )}

                                <div className="flex justify-between items-center mb-2">
                                    <h3 className="font-bold text-slate-800">{cat.name}</h3>
                                    <div className="text-right">
                                        <span className="block font-bold text-indigo-600">₹{cat.baseCharge}</span>
                                        <span className="text-[10px] text-slate-400">per day</span>
                                    </div>
                                </div>

                                <div className="flex flex-wrap gap-2 mb-3">
                                    {cat.features.slice(0, 2).map((feat, i) => (
                                        <span key={i} className="text-[10px] bg-white border border-slate-200 px-2 py-1 rounded-md text-slate-500">
                                            {feat}
                                        </span>
                                    ))}
                                </div>

                                <div className={cn(
                                    "w-5 h-5 rounded-full border-2 flex items-center justify-center absolute top-5 right-5",
                                    isSelected ? "border-indigo-600" : "border-slate-300"
                                )}>
                                    {isSelected && <div className="w-2.5 h-2.5 bg-indigo-600 rounded-full" />}
                                </div>
                            </div>
                        );
                    })}
                </div>
            </main>

            {/* Bottom Bar */}
            <div className="fixed bottom-0 left-0 right-0 p-4 bg-white border-t border-slate-200 shadow-[0_-4px_20px_rgba(0,0,0,0.05)]">
                <div className="container mx-auto max-w-lg">
                    <button
                        onClick={handleConfirm}
                        className="w-full bg-indigo-600 hover:bg-indigo-700 text-white p-4 rounded-xl font-bold shadow-lg shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                    >
                        <span>Confirm Selection</span>
                        <ArrowRight className="w-5 h-5" />
                    </button>
                    <p className="text-[10px] text-center text-slate-400 mt-2">
                        By confirming, you agree to the hospital charges.
                    </p>
                </div>
            </div>
        </div>
    );
}
