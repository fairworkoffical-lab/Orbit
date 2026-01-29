'use client';

import React, { useState, useEffect } from 'react';
import { DoctorStatusStrip, initialDoctors, Doctor } from '@/components/orbit/DoctorStatusStrip';
import { RegistrationPanel, RegistrationData } from '@/components/orbit/RegistrationPanel';
import { OperationalQueue, QueueItem } from '@/components/orbit/OperationalQueue';
import { EmergencyOverride } from '@/components/orbit/EmergencyOverride';
import { IpdService, AdmissionRequest } from '@/lib/ipd-store';
import { CheckCircle2, BedDouble } from 'lucide-react';

export default function ReceptionPage() {
    // State management for doctors and queue
    const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [ipdRequests, setIpdRequests] = useState<AdmissionRequest[]>([]);

    // Selection state
    const [selectedDoctorId, setSelectedDoctorId] = useState<string | null>(null);
    const [selectedCategory, setSelectedCategory] = useState('all');

    // Load state from localStorage on mount and poll for updates
    useEffect(() => {
        const loadData = () => {
            const savedQueue = localStorage.getItem('orbit_queue');
            // const savedDoctors = localStorage.getItem('orbit_doctors'); // Doctors usually static or managed by DoctorPage? 
            // Actually doctor status changes in DoctorPage? Yes.
            const savedDoctors = localStorage.getItem('orbit_doctors');

            setQueue(savedQueue ? JSON.parse(savedQueue) : []);

            if (savedDoctors) {
                setDoctors(JSON.parse(savedDoctors));
            } else {
                // If reset, revert to initialDoctors? Or keep empty? 
                // Reset to initial is better for "Reset Test Data" flow
                setDoctors(initialDoctors);
            }
            // Load IPD Admission Requests
            IpdService.init();
            const ipdData = IpdService.getData();
            if (ipdData?.requests) {
                setIpdRequests(ipdData.requests);
            }
        };

        loadData();
        const interval = setInterval(loadData, 2000);
        return () => clearInterval(interval);
    }, []);

    // Helper to save queue
    const saveQueue = (newQueue: QueueItem[]) => {
        localStorage.setItem('orbit_queue', JSON.stringify(newQueue));
        setQueue(newQueue);
    };

    // Helper to save doctors
    const saveDoctors = (newDoctors: Doctor[]) => {
        localStorage.setItem('orbit_doctors', JSON.stringify(newDoctors));
        setDoctors(newDoctors);
    };

    // Get full doctor object from ID
    const selectedDoctor = selectedDoctorId
        ? doctors.find(d => d.id === selectedDoctorId) || null
        : null;

    const handleDoctorSelect = (doctorId: string) => {
        // Toggle selection
        if (selectedDoctorId === doctorId) {
            setSelectedDoctorId(null);
        } else {
            setSelectedDoctorId(doctorId);
        }
        console.log('Doctor selected:', doctorId);
    };

    const handleCategoryChange = (category: string) => {
        setSelectedCategory(category);
        // Clear doctor selection when category changes
        setSelectedDoctorId(null);
        console.log('Category changed:', category);
    };

    // Derived State Helper
    const filterQueue = (qList: QueueItem[], statusFilter: string[] | null) => {
        return qList.filter(q => {
            // 1. Status Filter
            if (statusFilter) {
                if (!q.status) {
                    if (!statusFilter.includes('waiting')) return false;
                } else {
                    if (!statusFilter.includes(q.status)) return false;
                }
            }

            // 2. Doctor Filter
            if (selectedDoctorId) {
                const doc = doctors.find(d => d.id === selectedDoctorId);
                if (doc && q.doctorName !== doc.name) return false;
            }

            return true;
        });
    };

    const handleGenerateToken = (data: RegistrationData) => {
        console.log('Token generated with data:', data);

        // Find the doctor to get real-time stats
        const targetDoctor = doctors.find(d => d.id === data.doctorId);
        if (!targetDoctor) return;

        // Calculate expected wait for THIS patient
        // EFFICIENCY LOGIC: If doctor is BUSY, add ongoing consult duration to wait time
        let waitMultiplier = targetDoctor.queueCount;
        if (targetDoctor.status === 'BUSY') {
            waitMultiplier += 1;
        }
        const currentWaitPoints = waitMultiplier * targetDoctor.consultDuration;

        // 1. Add to Queue
        const newQueueItem: QueueItem = {
            token: `T-${100 + queue.length + 1}`,
            patientName: data.name,
            doctorName: targetDoctor.name,
            waitTime: currentWaitPoints || 5, // Minimum 5m for prep if empty
            isEmergency: false,
            isFollowUp: data.isFollowUp,
            age: data.age,
            gender: data.gender,
            visitReason: data.visitReason,
            mobileNumber: data.phone,
            visitFee: data.fee,
            status: 'waiting',
            checkInTime: Date.now()
        };

        const updatedQueue = [...queue, newQueueItem];
        saveQueue(updatedQueue);

        // 2. Update Doctor Stats (Queue Count, Total Wait, Status)
        const updatedDoctors = doctors.map(doc => {
            if (doc.id === data.doctorId) {
                const newCount = doc.queueCount + 1;
                const newWait = newCount * doc.consultDuration;

                // Determine Status dynamically
                let newStatus = doc.status;
                if (doc.status !== 'BREAK') { // Don't override break manually unless needed
                    if (newCount >= 8) newStatus = 'FULL';
                    else if (newCount > 0) newStatus = 'BUSY';
                    else newStatus = 'READY';
                }

                return {
                    ...doc,
                    queueCount: newCount,
                    estimatedWait: newWait,
                    status: newStatus
                };
            }
            return doc;
        });

        saveDoctors(updatedDoctors);

        // Reset UI state after token generation
        // Note: We do NOT clear selectedDoctorId here anymore, because RegistrationPanel needs it for the success view.
        // The RegistrationPanel will handle resetting via its 'Register Next Patient' button callback or internal logic if needed.
        // Actually, RegistrationPanel has a handleReset that calls onCategoryChange('all') which clears it. 
        // But wait, onCategoryChange DOES clear selectedDoctorId in ReceptionPage.
        // So we just remove the explicit clear here.
        setSelectedCategory('all');
        // setSelectedDoctorId(null); // REMOVED: Let RegistrationPanel handle reset user flow
    };

    const handleEmergencyConfirm = (reason: string) => {
        // Create emergency queue item
        const emergencyItem: QueueItem = {
            token: `EMR-${100 + queue.length + 1}`,
            patientName: 'Emergency Patient',
            doctorName: 'On Call',
            waitTime: 0,
            isEmergency: true
        };

        // Add to TOP of queue (or sort handles it)
        setQueue(prev => [emergencyItem, ...prev]);

        console.log('Emergency registered with reason:', reason);
        alert(`🚨 EMERGENCY TOKEN GENERATED\nReason: ${reason}\nAll doctors have been notified.`);
    };

    const activeQueue = filterQueue(queue, ['waiting', 'in-progress']);
    const completedQueue = filterQueue(queue, ['completed']);

    return (
        <div className="min-h-screen bg-slate-50">
            {/* Doctor Status Strip - Sticky - Filtered by selected category */}
            <DoctorStatusStrip
                doctors={doctors}
                onDoctorSelect={handleDoctorSelect}
                categoryFilter={selectedCategory}
                selectedDoctorId={selectedDoctorId}
            />

            {/* TESTING EXTENSION: Reset Data */}
            <div className="container mx-auto px-4 mt-2 flex justify-end">
                <button
                    onClick={() => {
                        if (confirm('⚠️ NUCLEAR RESET?\nThis will clear ALL browser data for this app.')) {
                            // 1. Clear Storage
                            localStorage.clear();

                            // 2. Clear State Immediately
                            setQueue([]);
                            setDoctors(initialDoctors);

                            // 3. Force Hard Reload
                            window.location.href = window.location.href;
                        }
                    }}
                    className="text-[10px] font-bold text-red-100 hover:text-white bg-red-500 hover:bg-red-600 px-3 py-1 rounded-full transition-colors flex items-center gap-1 shadow-sm"
                >
                    <span>🔥 Hard Reset System</span>
                </button>
            </div>

            {/* Main Content */}
            <div className="container mx-auto px-4 py-6">
                <div className="flex gap-6">
                    {/* LEFT: Registration Panel (60%) */}
                    <div className="w-3/5 space-y-4">
                        <RegistrationPanel
                            selectedDoctor={selectedDoctor}
                            onGenerateToken={handleGenerateToken}
                            selectedCategory={selectedCategory}
                            onCategoryChange={handleCategoryChange}
                        />

                        {/* Emergency Override */}
                        <EmergencyOverride onEmergencyConfirm={handleEmergencyConfirm} />
                    </div>

                    {/* RIGHT: Operational Queue (40%) */}
                    <div className="w-2/5">
                        <div className="sticky top-40 space-y-6">
                            {/* Active Queue */}
                            <OperationalQueue queue={activeQueue} />

                            {/* Completed History */}
                            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-4">
                                <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-50">
                                    <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completed Today</h3>
                                    <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-1 rounded-full">
                                        {completedQueue.length}
                                    </span>
                                </div>
                                <div className="space-y-2 max-h-60 overflow-y-auto custom-scrollbar">
                                    {completedQueue.length > 0 ? (
                                        completedQueue.map(pt => (
                                            <div key={pt.token} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 transition-all hover:bg-emerald-50/50">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
                                                        <CheckCircle2 className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-700 text-sm">{pt.patientName}</div>
                                                        <div className="text-[10px] text-slate-500 font-mono flex items-center gap-2">
                                                            <span>{pt.token}</span>
                                                            <span className="text-slate-300">•</span>
                                                            <span>{pt.doctorName}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-6 text-slate-400 italic text-xs">No completed visits yet</div>
                                    )}
                                </div>
                            </div>

                            {/* SENT TO IPD */}
                            {ipdRequests.length > 0 && (
                                <div className="bg-gradient-to-br from-amber-50 to-amber-100 rounded-2xl border border-amber-200 shadow-sm p-4">
                                    <div className="flex items-center justify-between mb-4 pb-2 border-b border-amber-200">
                                        <h3 className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
                                            <BedDouble className="w-4 h-4" />
                                            Sent to IPD
                                        </h3>
                                        <span className="text-xs font-bold text-amber-700 bg-amber-200 px-2 py-1 rounded-full">
                                            {ipdRequests.length}
                                        </span>
                                    </div>
                                    <div className="space-y-2 max-h-40 overflow-y-auto custom-scrollbar">
                                        {ipdRequests.map(req => (
                                            <div key={req.id} className="flex items-center justify-between p-3 rounded-xl bg-white border border-amber-200 transition-all hover:shadow-md">
                                                <div className="flex items-center gap-3">
                                                    <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-amber-700">
                                                        <BedDouble className="w-4 h-4" />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-slate-700 text-sm">{req.patientName}</div>
                                                        <div className="text-[10px] text-slate-500 font-mono">
                                                            {req.status === 'ASSIGNED' && req.assignedBed ? (
                                                                <span className="text-emerald-600 font-bold flex items-center gap-1">
                                                                    <CheckCircle2 className="w-3 h-3" />
                                                                    Bed {req.assignedBed} Allotted
                                                                </span>
                                                            ) : (
                                                                <span>
                                                                    {req.urgency === 'EMERGENCY' ? '🔴 Emergency' : '🟢 Routine'} • {req.status}
                                                                </span>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}


