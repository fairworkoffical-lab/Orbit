'use client';

import React, { useState, useEffect, useRef } from 'react';
import { QueueItem } from '@/components/orbit/OperationalQueue';
import { Doctor, DoctorStatusType, initialDoctors } from '@/components/orbit/DoctorStatusStrip';
import { Stethoscope, CheckCircle2, Clock, Play, UserCircle, Coffee, AlertTriangle, Calendar, Printer, Send, X, Plus, BedDouble, Activity } from 'lucide-react';
import Link from 'next/link';
import { IpdService, AdmissionRequest, Bed, ClinicalNote, Prescription } from '@/lib/ipd-store';
import { cn } from '@/lib/utils';
import { PrescriptionTemplate, PrescriptionItem } from '@/components/orbit/PrescriptionTemplate';

// --- COMPONENTS ---

function ElapsedTimer({ startTime }: { startTime: number }) {
    const [elapsed, setElapsed] = useState(0);

    useEffect(() => {
        const interval = setInterval(() => {
            setElapsed(Math.floor((Date.now() - startTime) / 1000));
        }, 1000);
        return () => clearInterval(interval);
    }, [startTime]);

    const minutes = Math.floor(elapsed / 60);
    const seconds = elapsed % 60;

    // Color logic: <10m Green, >10m Amber
    const colorClass = minutes < 10 ? 'text-emerald-600 bg-emerald-50' : 'text-amber-600 bg-amber-50';

    return (
        <div className={cn("px-3 py-1 rounded-full font-mono font-bold text-sm flex items-center gap-2", colorClass)}>
            <Clock className="w-4 h-4" />
            {String(minutes).padStart(2, '0')}:{String(seconds).padStart(2, '0')}

        </div>
    );
}



// --- MAIN PAGE ---

export default function DoctorPage() {
    // Data State
    const [queue, setQueue] = useState<QueueItem[]>([]);
    const [doctors, setDoctors] = useState<Doctor[]>(initialDoctors);
    const [ipdRequests, setIpdRequests] = useState<AdmissionRequest[]>([]);
    const [admittedPatients, setAdmittedPatients] = useState<Bed[]>([]);

    // HISTORY VIEW STATE
    const [viewHistoryItem, setViewHistoryItem] = useState<any | null>(null);
    const [showRoundsModal, setShowRoundsModal] = useState(false);
    const [selectedAdmittedPatient, setSelectedAdmittedPatient] = useState<Bed | null>(null);
    const [roundsTab, setRoundsTab] = useState<'notes' | 'prescriptions'>('notes');
    const [newRoundNote, setNewRoundNote] = useState<{ text: string; type: 'ROUND' | 'DIAGNOSIS' | 'INSTRUCTION' | 'COMPLAINT' }>({ text: '', type: 'ROUND' });
    const [newRx, setNewRx] = useState({ name: '', dosage: { m: '0', a: '0', n: '0' }, duration: '3', instruction: 'After Food' });

    // Session State
    const [currentDoctorId, setCurrentDoctorId] = useState<string>('dr_sarah_smith');
    const [currentPatient, setCurrentPatient] = useState<QueueItem | null>(null);
    const [consultStartTime, setConsultStartTime] = useState<number | null>(null);

    // Clinical Input State
    const [diagnosis, setDiagnosis] = useState('');
    const [prescriptions, setPrescriptions] = useState<PrescriptionItem[]>([]);
    const [medicine, setMedicine] = useState('');
    const [followUp, setFollowUp] = useState<string | null>(null); // '3d', '7d', etc.

    const [showPreview, setShowPreview] = useState(false);
    const [savedVisitData, setSavedVisitData] = useState<any>(null);
    const [instructions, setInstructions] = useState('');

    // Unavailable Modal State
    const [showUnavailableModal, setShowUnavailableModal] = useState(false);
    const [unavailableReasonText, setUnavailableReasonText] = useState('');

    // Availability Schedule State
    const [showScheduleModal, setShowScheduleModal] = useState(false);
    const [tempSchedule, setTempSchedule] = useState({ start: '09:00', end: '17:00' });
    const [admitPatient, setAdmitPatient] = useState(false); // Used for toggle
    const [showAdmissionModal, setShowAdmissionModal] = useState(false); // NEW MODAL
    const [admissionDetails, setAdmissionDetails] = useState({ type: 'gen', urgency: 'ROUTINE', reason: '' });

    // Imports for IPD Service
    // Note: We need to import IpdService but replace_file_content can't add top-level imports easily if not contiguous.
    // I will add the logic assuming IpdService is available or import it via a separate edit.
    // Helper for active prescription
    const colIsActive = (p: Prescription) => p.status !== 'STOPPED';

    // Completion Modal State
    const [showFinishModal, setShowFinishModal] = useState(false);

    const calculateQty = (dosage: { m: string, a: string, n: string }, duration: string) => {
        const parse = (v: string) => (v === '1' ? 1 : v === '1/2' || v === '½' ? 0.5 : 0);
        const perDay = parse(dosage.m) + parse(dosage.a) + parse(dosage.n);
        const days = parseInt(duration) || 0;
        const total = Math.ceil(perDay * days);
        return total > 0 ? total + ' Tabs' : '';
    };

    const addPrescription = () => {
        if (!medicine) return;
        setPrescriptions([...prescriptions, {
            id: Date.now(),
            name: medicine,
            dosage: { m: '1', a: '0', n: '1' },
            timing: 'After Food',
            duration: '3',
            qty: calculateQty({ m: '1', a: '0', n: '1' }, '3'),
            instruction: 'After Food'
        }]);
        setMedicine('');
    };



    // Load Ipd Requests
    useEffect(() => {
        IpdService.init();
        const loadRequests = () => {
            const data = IpdService.getData();
            setIpdRequests(data.requests || []);
        };
        loadRequests();
        window.addEventListener('storage', loadRequests);
        const interval = setInterval(loadRequests, 3000);
        return () => {
            window.removeEventListener('storage', loadRequests);
            clearInterval(interval);
        };
    }, []);


    const saveQueue = (newQueue: QueueItem[]) => {
        setQueue(newQueue);
        localStorage.setItem('orbit_queue', JSON.stringify(newQueue));
    };

    const saveDoctors = (newDoctors: Doctor[]) => {
        setDoctors(newDoctors);
        localStorage.setItem('orbit_doctors', JSON.stringify(newDoctors));
    };

    const currentDoctor = doctors.find(d => d.id === currentDoctorId);

    // Load Data
    useEffect(() => {
        const loadData = () => {
            // ... existing logic ...
            const savedQueue = localStorage.getItem('orbit_queue');
            setQueue(savedQueue ? JSON.parse(savedQueue) : []);

            const savedDoctors = localStorage.getItem('orbit_doctors');
            if (savedDoctors) {
                setDoctors(JSON.parse(savedDoctors));
            } else {
                setDoctors(initialDoctors);
            }
            // Load IPD Requests
            IpdService.init();
            const ipdData = IpdService.getData();
            if (ipdData?.requests) {
                // Filter to only show this doctor's requests
                const myReqs = ipdData.requests.filter((r: AdmissionRequest) => r.doctorId === currentDoctorId);
                setIpdRequests(myReqs);

                // Load Admitted Patients (Global for now, ideally filtered by Doctor)
                // Filter beds that are OCCUPIED
                const allBeds = ipdData.beds || [];
                const myPatients = allBeds.filter((b: Bed) => b.status === 'OCCUPIED');
                setAdmittedPatients(myPatients);
            }
        };
        loadData();
        const interval = setInterval(loadData, 2000);
        return () => clearInterval(interval);
    }, [currentDoctorId]); // Added dependency

    const handleRecommendAdmission = () => {
        if (!currentPatient) return;

        // 1. Create Request using already imported IpdService
        IpdService.init();
        IpdService.createAdmissionRequest({
            patientId: currentPatient.token,
            patientName: currentPatient.patientName,
            patientAge: String(currentPatient.age || 'N/A'),
            patientGender: currentPatient.gender || 'Unknown',
            doctorId: currentDoctorId,
            doctorName: currentDoctor?.name || 'Unknown',
            recommendedCategory: admissionDetails.type,
            urgency: admissionDetails.urgency as 'ROUTINE' | 'EMERGENCY',
            reason: admissionDetails.reason || diagnosis
        });

        alert(`✅ Admission Recommended!\n\nPatient will appear in the IPD Console.`);
        setShowAdmissionModal(false);
        setAdmitPatient(true); // Toggle the switch visually

        // Update Queue Status IMMEDIATELY to 'sent-to-ipd'
        // SAFETY: Read from LS first to avoid stale state
        const freshQueueRaw = localStorage.getItem('orbit_queue');
        const freshQueue: QueueItem[] = freshQueueRaw ? JSON.parse(freshQueueRaw) : [];

        const updatedQueue = freshQueue.map(p =>
            p.token === currentPatient.token
                ? { ...p, status: 'sent-to-ipd' as const }
                : p
        );
        saveQueue(updatedQueue);
    };

    // 1. Restore Session (Current Patient) on Mount
    useEffect(() => {
        const savedSession = localStorage.getItem('orbit_doctor_session_v2');
        if (savedSession) {
            try {
                const session = JSON.parse(savedSession);
                if (session.patient) {
                    console.log("Restoring session:", session.patient.patientName);
                    setCurrentPatient(session.patient);
                    setConsultStartTime(session.startTime || Date.now());
                }
            } catch (e) {
                console.error("Failed to restore session", e);
            }
        }
    }, []);

    // 2. Save Session (Current Patient)
    useEffect(() => {
        if (currentPatient) {
            localStorage.setItem('orbit_doctor_session_v2', JSON.stringify({
                patient: currentPatient,
                startTime: consultStartTime
            }));
        } else {
            localStorage.removeItem('orbit_doctor_session_v2');
        }
    }, [currentPatient, consultStartTime]);

    // 3. Autosave Draft (Clinical Data)
    useEffect(() => {
        if (!currentPatient) return;
        const key = `orbit_draft_${currentPatient.token}`;
        const draft = { diagnosis, prescriptions, instructions, followUp };
        localStorage.setItem(key, JSON.stringify(draft));
    }, [currentPatient, diagnosis, prescriptions, instructions, followUp]);

    // 4. Restore Draft when Patient Changes
    useEffect(() => {
        if (!currentPatient) return;

        // Reset first (important if switching patients directly)
        // Actually handleCallNext does reset.

        const key = `orbit_draft_${currentPatient.token}`;
        const savedDraft = localStorage.getItem(key);
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                if (draft.diagnosis) setDiagnosis(draft.diagnosis);
                if (draft.prescriptions) setPrescriptions(draft.prescriptions);
                if (draft.instructions) setInstructions(draft.instructions);
                if (draft.followUp) setFollowUp(draft.followUp);
                console.log("Draft restored for", currentPatient.token);
            } catch (e) {
                console.error("Failed to restore draft", e);
            }
        }
    }, [currentPatient]);

    // Filter Queue
    const myQueue = queue.filter(q => q.doctorName === currentDoctor?.name);
    const waitingPatients = myQueue.filter(q => (!q.status || q.status === 'waiting') && q.token !== currentPatient?.token);
    const completedPatients = myQueue.filter(q => q.status === 'completed');
    const nextPatient = waitingPatients[0];

    // Actions
    const handleCallNext = () => {
        if (nextPatient) {
            setCurrentPatient(nextPatient);
            setConsultStartTime(Date.now());

            // Sync: Mark as in-progress instead of deleting
            const newQueue = queue.map(q => q.token === nextPatient.token ? { ...q, status: 'in-progress' as const } : q);
            saveQueue(newQueue as QueueItem[]);

            // Reset inputs
            setDiagnosis('');
            setPrescriptions([]);
            setMedicine('');
            setFollowUp(null);
        }
    };

    const handleComplete = () => {
        if (!diagnosis && prescriptions.length === 0) {
            if (!confirm("No diagnosis or prescriptions entered. Complete visit anyway?")) return;
        }

        const visitData = {
            patient: currentPatient,
            doctor: currentDoctor,
            diagnosis,
            prescriptions: [...prescriptions],
            followUp,
            instructions,
            admitPatient,
            date: new Date().toLocaleDateString('en-GB')
        };

        setSavedVisitData(visitData);
        setShowPreview(true);
    };

    const handleFinalizeVisit = () => {
        const visitData = savedVisitData || {
            patient: currentPatient,
            doctor: currentDoctor,
            diagnosis,
            prescriptions: [...prescriptions],
            followUp,
            instructions,
            admitPatient,
            date: new Date().toLocaleDateString('en-GB')
        };

        console.log('COMPLETED:', visitData);

        // Check if this patient is being admitted to IPD
        const isAdmitting = visitData.admitPatient || admitPatient;

        // If admitting, create the IPD admission request (if not exists)
        if (isAdmitting && visitData.patient) {
            IpdService.init();
            const existing = IpdService.getData().requests || [];
            const alreadyRequested = existing.some((r: AdmissionRequest) => r.patientId === visitData.patient?.token);

            if (!alreadyRequested) {
                IpdService.createAdmissionRequest({
                    patientId: visitData.patient.token,
                    patientName: visitData.patient.patientName,
                    patientAge: String(visitData.patient.age || 'N/A'),
                    patientGender: visitData.patient.gender || 'Unknown',
                    doctorId: currentDoctorId,
                    doctorName: currentDoctor?.name || 'Unknown',
                    recommendedCategory: admissionDetails.type || 'gen',
                    urgency: (admissionDetails.urgency as 'ROUTINE' | 'EMERGENCY') || 'ROUTINE',
                    reason: visitData.diagnosis || 'Admission recommended by doctor'
                });
                console.log('IPD Admission Request Created!');
            }
        }

        // Update Queue Status and Persist Data
        if (visitData.patient) {
            const newStatus = isAdmitting ? 'sent-to-ipd' as const : 'completed' as const;

            // SAFETY: Read from LS
            const freshQueueRaw = localStorage.getItem('orbit_queue');
            const freshQueue: QueueItem[] = freshQueueRaw ? JSON.parse(freshQueueRaw) : [];

            const upQueue = freshQueue.map(q =>
                q.token === visitData.patient.token
                    ? { ...q, status: newStatus, visitDetails: visitData }
                    : q
            );
            saveQueue(upQueue);
        }

        // Reset inputs
        setCurrentPatient(null);
        setConsultStartTime(null);
        setDiagnosis('');
        setPrescriptions([]);
        setMedicine('');
        setInstructions('');
        setFollowUp(null);
        setAdmitPatient(false);

        // Clear Draft & Session
        localStorage.removeItem(`orbit_draft_${currentPatient?.token}`);
        localStorage.removeItem('orbit_doctor_session_v2');

        // Hide Preview
        setShowPreview(false);
        setSavedVisitData(null);
    };

    /* 
    // REMOVED as per user request
    const handleBreak = () => { ... }
    const handleLate = () => { ... }
    */

    const handleUnavailableClick = () => {
        if ((currentDoctor?.status as string) === 'UNAVAILABLE') {
            // If already unavailable, clicking means "Mark as Available"
            const newDoctors = doctors.map(d =>
                d.id === currentDoctorId
                    ? { ...d, status: 'READY' as DoctorStatusType, statusReason: '' }
                    : d
            );
            saveDoctors(newDoctors);
        } else {
            // Open modal to set reason
            setUnavailableReasonText('');
            setShowUnavailableModal(true);
        }
    };

    const confirmUnavailable = (reason: string) => {
        const newDoctors = doctors.map(d =>
            d.id === currentDoctorId
                ? { ...d, status: 'UNAVAILABLE' as DoctorStatusType, statusReason: reason }
                : d
        );
        saveDoctors(newDoctors);
        setShowUnavailableModal(false);
    };

    const handleUpdateSchedule = () => {
        const newDoctors = doctors.map(d =>
            d.id === currentDoctorId
                ? { ...d, availability: tempSchedule }
                : d
        );
        saveDoctors(newDoctors);
        setShowScheduleModal(false);
    };

    const handleCancelVisit = () => {
        if (confirm("Are you sure you want to cancel this visit?")) {
            setCurrentPatient(null);
            setConsultStartTime(null);
            setDiagnosis('');
            setPrescriptions([]);
            setMedicine('');
            setInstructions('');
            setFollowUp(null);
        }
    };

    const handleOpenFinishModal = () => {
        // 1. Prepare Data
        const visitData = {
            patient: currentPatient,
            doctor: currentDoctor,
            diagnosis,
            prescriptions: [...prescriptions],
            followUp,
            instructions,
            admitPatient,
            date: new Date().toLocaleDateString('en-GB')
        };
        setSavedVisitData(visitData);
        setShowFinishModal(true);
    };

    const handlePrintAction = () => {
        // Close modal first
        setShowFinishModal(false);

        // Schedule Print after Render
        setTimeout(() => {
            window.print();

            // Cleanup on AfterPrint
            const cleanup = () => {
                handleFinalizeVisit();
                window.removeEventListener('afterprint', cleanup);
                setSavedVisitData(null);
            };
            window.addEventListener('afterprint', cleanup);
        }, 100);
    };

    const handleWhatsAppAction = () => {
        if (!currentPatient?.mobileNumber) {
            alert("No mobile number found for this patient.");
            return;
        }

        const lines = [
            `*PRESCRIPTION FROM ${currentDoctor?.name.toUpperCase()}*`,
            `Patient: ${currentPatient.patientName}`,
            `Date: ${new Date().toLocaleDateString('en-GB')}`,
            "",
            `*DIAGNOSIS:*`,
            diagnosis || "N/A",
            "",
            `*MEDICINES:*`,
            ...prescriptions.map(p => `- ${p.name} (${p.qty}): ${p.instruction}`),
            "",
            instructions ? `*INSTRUCTIONS:* ${instructions}` : "",
            "",
            "Get Well Soon! - Orbit Hospital"
        ];

        const text = lines.join('\n');
        const url = `https://wa.me/${currentPatient.mobileNumber}?text=${encodeURIComponent(text)}`;

        // Open WhatsApp
        window.open(url, '_blank');

        // Finalize immediately
        setShowFinishModal(false);
        handleFinalizeVisit();
    };

    const handleCallPatient = (p: QueueItem) => {
        setCurrentPatient(p);
        setConsultStartTime(Date.now());
        const newQueue = queue.map(q => q.token === p.token ? { ...q, status: 'in-progress' as const } : q);
        saveQueue(newQueue);
    };

    const loadCompletedVisit = (p: QueueItem) => {
        if (p.visitDetails) {
            setSavedVisitData(p.visitDetails);
        }
    };

    const toggleAvailability = (available: boolean) => {
        if (available) {
            const newDoctors = doctors.map(d =>
                d.id === currentDoctorId
                    ? { ...d, status: 'READY' as DoctorStatusType, statusReason: undefined }
                    : d
            );
            saveDoctors(newDoctors);
        } else {
            setShowUnavailableModal(true);
        }
    };


    return (
        <>
            <div className="relative">
                <div className="min-h-screen bg-slate-50/50 p-6 flex flex-col items-center print:hidden">
                    {/* TOP BAR: Doctor Identity & Status (Subtle) */}
                    <div className="w-full max-w-6xl flex items-center justify-between mb-8 opacity-80 hover:opacity-100 transition-opacity">
                        <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 font-bold">
                                {currentDoctor?.name.charAt(0)}
                            </div>
                            <div>
                                <h2 className="text-sm font-bold text-slate-700 leading-none">{currentDoctor?.name}</h2>
                                <span className="text-xs text-slate-500">{currentDoctor?.specialization}</span>
                            </div>
                        </div>

                        {/* Doctor Switcher (Dev only) */}
                        <select
                            value={currentDoctorId}
                            onChange={(e) => setCurrentDoctorId(e.target.value)}
                            className="text-xs border-none bg-transparent text-slate-400 focus:ring-0 cursor-pointer"
                        >
                            {doctors.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                        </select>
                    </div>


                    {/* MAIN STAGE */}
                    <div className="w-full max-w-6xl flex gap-8 items-start">
                        <div className="flex-1 flex flex-col">

                            {currentPatient ? (
                                /* CONSULTATION VIEW */
                                <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col md:flex-row min-h-[500px]">

                                    {/* LEFT: Patient Context (Fixed) */}
                                    <div className="w-full md:w-1/3 bg-slate-50 p-6 border-b md:border-b-0 md:border-r border-slate-100 flex flex-col">
                                        <div className="mb-6">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="px-2.5 py-1 rounded-md bg-white border text-xs font-bold text-slate-500 uppercase tracking-wider shadow-sm">
                                                    Token #{currentPatient.token}
                                                </span>
                                                <ElapsedTimer startTime={consultStartTime || Date.now()} />
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-800 leading-tight mb-1">{currentPatient.patientName}</h2>
                                            <div className="flex items-center gap-2 text-sm font-bold text-slate-400">
                                                <UserCircle className="w-4 h-4" />
                                                <span>{currentPatient.age}Y • {currentPatient.gender}</span>
                                            </div>
                                        </div>

                                        {/* VITALS & ALLERGIES HIDDEN AS PER REQUEST */}
                                        {/*
                                    <div className="space-y-4 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                                        <label className="text-xs font-bold text-slate-400 uppercase mb-2 block">Vitals</label>
                                        <div className="grid grid-cols-2 gap-3 opacity-50">
                                            <div className="p-2 bg-slate-50 rounded-lg text-center">
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">BP</div>
                                                <div className="text-sm font-black text-slate-400">--/--</div>
                                            </div>
                                            <div className="p-2 bg-slate-50 rounded-lg text-center">
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">Temp</div>
                                                <div className="text-sm font-black text-slate-400">--°F</div>
                                            </div>
                                            <div className="p-2 bg-slate-50 rounded-lg text-center">
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">Weight</div>
                                                <div className="text-sm font-black text-slate-400">--kg</div>
                                            </div>
                                            <div className="p-2 bg-slate-50 rounded-lg text-center">
                                                <div className="text-[10px] text-slate-400 font-bold uppercase">SpO2</div>
                                                <div className="text-sm font-black text-slate-400">--%</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-amber-50 p-4 rounded-2xl border border-amber-100">
                                        <label className="text-xs font-bold text-amber-400 uppercase mb-2 block">Allergies</label>
                                        <div className="flex flex-wrap gap-2">
                                            <span className="text-xs text-amber-600/50 italic px-2">No known allergies</span>
                                        </div>
                                    </div>
                                    */}
                                    </div>

                                    {/* RIGHT: Clinical Notes (Scrollable) */}
                                    <div className="flex-1 flex flex-col h-[500px] md:h-auto relative">
                                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar pb-24">

                                            {/* Diagnosis */}
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                                                        <Stethoscope className="w-4 h-4" /> Diagnosis & Symptoms
                                                    </h3>
                                                </div>
                                                <textarea
                                                    className="w-full p-4 rounded-xl border-2 border-slate-100 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all font-medium text-slate-700 resize-none min-h-[120px] text-base"
                                                    placeholder="Enter clinical findings and diagnosis..."
                                                    value={diagnosis}
                                                    onChange={(e) => setDiagnosis(e.target.value)}
                                                />
                                            </div>

                                            {/* Medications */}
                                            <div className="space-y-4">
                                                <label className="text-sm font-bold text-slate-400 uppercase tracking-wider block">Prescription</label>

                                                {/* Medicine Input */}
                                                <div className="bg-slate-50 p-4 rounded-xl border border-slate-200 flex gap-2 items-center">
                                                    <input
                                                        type="text"
                                                        className="flex-1 p-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:outline-none font-bold text-slate-700"
                                                        placeholder="Search medicine (e.g., Paracetamol 500mg)"
                                                        value={medicine}
                                                        onChange={(e) => setMedicine(e.target.value)}
                                                        onKeyDown={(e) => {
                                                            if (e.key === 'Enter' && medicine) {
                                                                addPrescription();
                                                            }
                                                        }}
                                                    />
                                                    <button
                                                        onClick={addPrescription}
                                                        disabled={!medicine}
                                                        className="h-12 w-12 bg-blue-600 rounded-lg flex items-center justify-center text-white hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                    >
                                                        <Plus className="w-6 h-6" />
                                                    </button>
                                                </div>

                                                {/* Medicine List */}
                                                <div className="space-y-2">
                                                    {prescriptions.map((script, idx) => (
                                                        <div key={idx} className="flex flex-col gap-3 p-4 bg-white rounded-xl border border-slate-200 shadow-sm group hover:border-blue-300 transition-all">
                                                            <div className="flex items-center justify-between">
                                                                <div className="font-bold text-slate-800">{script.name}</div>
                                                                <button
                                                                    onClick={() => setPrescriptions(prescriptions.filter((_, i) => i !== idx))}
                                                                    className="text-slate-300 hover:text-red-500 transition-colors p-1"
                                                                >
                                                                    <X className="w-4 h-4" />
                                                                </button>
                                                            </div>

                                                            <div className="flex flex-wrap items-end gap-3">
                                                                {/* Dosage Inputs (M-A-N) - Click to toggle */}
                                                                <div className="flex items-center gap-1 bg-slate-50 p-1.5 rounded-lg border border-slate-200">
                                                                    {['m', 'a', 'n'].map((period) => (
                                                                        <div key={period} className="flex flex-col items-center w-8">
                                                                            <label className="text-[9px] font-bold text-slate-400 uppercase mb-0.5">{period}</label>
                                                                            <button
                                                                                onClick={() => {
                                                                                    const currentVal = (script.dosage as any)[period];
                                                                                    const nextVal = currentVal === '0' ? '1' : currentVal === '1' ? '1/2' : '0';

                                                                                    const newDosage = { ...script.dosage, [period]: nextVal };
                                                                                    const newScripts = [...prescriptions];
                                                                                    newScripts[idx] = {
                                                                                        ...script,
                                                                                        dosage: newDosage,
                                                                                        qty: calculateQty(newDosage, script.duration)
                                                                                    };
                                                                                    setPrescriptions(newScripts);
                                                                                }}
                                                                                className="w-full text-center bg-white border border-slate-200 rounded text-sm font-bold text-slate-700 hover:border-blue-400 hover:text-blue-600 py-0.5 transition-colors"
                                                                            >
                                                                                {(script.dosage as any)[period] === '1/2' ? '½' : (script.dosage as any)[period]}
                                                                            </button>
                                                                        </div>
                                                                    ))}
                                                                </div>

                                                                <div className="flex flex-col w-16">
                                                                    <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 px-1">Days</label>
                                                                    <div className="relative">
                                                                        <input
                                                                            type="text"
                                                                            className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-center focus:border-blue-500 focus:outline-none"
                                                                            value={script.duration}
                                                                            onChange={(e) => {
                                                                                const newDuration = e.target.value;
                                                                                const newScripts = [...prescriptions];
                                                                                newScripts[idx] = {
                                                                                    ...script,
                                                                                    duration: newDuration,
                                                                                    qty: calculateQty(script.dosage, newDuration) // Recalculate Qty
                                                                                };
                                                                                setPrescriptions(newScripts);
                                                                            }}
                                                                        />
                                                                    </div>
                                                                </div>

                                                                <div className="flex flex-col w-20">
                                                                    <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 px-1">Qty</label>
                                                                    <input
                                                                        type="text"
                                                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-bold text-center text-slate-500 focus:border-blue-500 focus:outline-none"
                                                                        value={script.qty || ''}
                                                                        readOnly // Auto-calculated
                                                                    />
                                                                </div>

                                                                <div className="flex flex-col flex-1 min-w-[100px]">
                                                                    <label className="text-[9px] font-bold text-slate-400 uppercase mb-1 px-1">Instruction</label>
                                                                    <select
                                                                        className="w-full p-2 bg-slate-50 border border-slate-200 rounded-lg text-sm font-medium text-slate-600 focus:border-blue-500 focus:outline-none appearance-none"
                                                                        value={script.instruction}
                                                                        onChange={(e) => {
                                                                            const newScripts = [...prescriptions];
                                                                            newScripts[idx] = { ...script, instruction: e.target.value };
                                                                            setPrescriptions(newScripts);
                                                                        }}
                                                                    >
                                                                        <option value="After Food">After Food</option>
                                                                        <option value="Before Food">Before Food</option>
                                                                        <option value="With Food">With Food</option>
                                                                        <option value="Empty Stomach">Empty Stomach</option>
                                                                    </select>
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))}

                                                    {prescriptions.length === 0 && (
                                                        <div className="text-center p-8 bg-slate-50 rounded-xl border-2 border-dashed border-slate-200 text-slate-400 font-medium">
                                                            No medicines added yet
                                                        </div>
                                                    )}
                                                </div>
                                            </div>

                                            {/* INSTRUCTIONS & FOLLOW UP */}
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                {/* Advice / Instructions */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Advice / Instructions</label>
                                                    <textarea
                                                        className="w-full p-3 rounded-xl border border-slate-200 focus:border-blue-500 focus:outline-none font-medium text-slate-700 min-h-[100px] text-sm resize-none"
                                                        placeholder="Drink plenty of water..."
                                                        value={instructions}
                                                        onChange={(e) => setInstructions(e.target.value)}
                                                    />
                                                </div>

                                                {/* Follow Up */}
                                                <div className="space-y-2">
                                                    <label className="text-xs font-bold text-slate-400 uppercase tracking-wider block">Follow Up</label>
                                                    <div className="grid grid-cols-2 gap-2">
                                                        {['3 Days', '5 Days', '1 Week', '2 Weeks'].map(time => (
                                                            <button
                                                                key={time}
                                                                onClick={() => setFollowUp(time === followUp ? null : time)}
                                                                className={cn(
                                                                    "px-3 py-2 rounded-lg text-xs font-bold border transition-all",
                                                                    followUp === time
                                                                        ? "bg-slate-800 text-white border-slate-800"
                                                                        : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                                                )}
                                                            >
                                                                {time}
                                                            </button>
                                                        ))}
                                                    </div>
                                                    <input
                                                        type="text"
                                                        className="w-full p-2.5 rounded-lg border border-slate-200 text-sm font-bold text-slate-700 focus:border-blue-500 focus:outline-none"
                                                        placeholder="Custom date..."
                                                        value={followUp || ''}
                                                        onChange={(e) => setFollowUp(e.target.value)}
                                                    />
                                                </div>
                                            </div>



                                            {/* ADMIT PATIENT TOGGLE */}
                                            <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                                                <label className="text-sm font-bold text-red-600 uppercase tracking-wider">Require Admission?</label>
                                                <button
                                                    onClick={() => setAdmitPatient(!admitPatient)}
                                                    className={cn(
                                                        "px-4 py-2 rounded-full font-bold text-sm transition-all border",
                                                        admitPatient
                                                            ? "bg-red-600 text-white border-red-600 shadow-md"
                                                            : "bg-white text-slate-400 border-slate-200 hover:border-red-200"
                                                    )}
                                                >
                                                    {admitPatient ? "Yes, Admit Patient" : "No, OPD Only"}
                                                </button>
                                            </div>
                                        </div>

                                        {/* Action Bar (Sticky Bottom) */}
                                        <div className="absolute bottom-0 left-0 right-0 p-4 bg-white/80 backdrop-blur border-t border-slate-100 flex items-center justify-between">
                                            <button
                                                onClick={handleCancelVisit}
                                                className="px-6 py-3 rounded-xl font-bold text-slate-400 hover:text-slate-600 hover:bg-slate-50 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleOpenFinishModal}
                                                className="px-8 py-3 rounded-xl bg-slate-900 text-white font-bold shadow-lg shadow-slate-200 hover:bg-slate-800 hover:scale-[1.02] active:scale-[0.98] transition-all flex items-center gap-2"
                                            >
                                                <Printer className="w-5 h-5" />
                                                Complete & Print
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                /* EMPTY STATE */
                                <div className="flex-1 bg-white rounded-3xl border border-slate-100 flex flex-col items-center justify-center p-12 text-center min-h-[500px]">
                                    {currentDoctor?.status === ('UNAVAILABLE' as DoctorStatusType) ? (
                                        <div className="max-w-md w-full bg-red-50 p-8 rounded-3xl border-2 border-red-100 flex flex-col items-center animate-in fade-in zoom-in duration-300">
                                            <div className="h-20 w-20 bg-red-100 rounded-full flex items-center justify-center mb-6 shadow-md shadow-red-100">
                                                <Coffee className="w-10 h-10 text-red-500" />
                                            </div>
                                            <h2 className="text-2xl font-black text-red-900 mb-2">You are marked Unavailable</h2>
                                            <p className="text-red-700 font-medium mb-6">
                                                Reason: <span className="font-bold">{currentDoctor.statusReason || "Unspecified"}</span>
                                            </p>

                                            <button
                                                onClick={() => {
                                                    const newDoctors = doctors.map(d =>
                                                        d.id === currentDoctorId
                                                            ? { ...d, status: 'READY' as DoctorStatusType, statusReason: undefined }
                                                            : d
                                                    );
                                                    saveDoctors(newDoctors);
                                                }}
                                                className="px-8 py-3 rounded-xl bg-red-600 text-white font-bold hover:bg-red-700 shadow-lg shadow-red-200 transition-all w-full"
                                            >
                                                Resume Duty
                                            </button>
                                        </div>
                                    ) : (
                                        <>
                                            <div className="h-24 w-24 bg-slate-50 rounded-full flex items-center justify-center mb-6">
                                                <UserCircle className="w-12 h-12 text-slate-300" />
                                            </div>
                                            <h2 className="text-2xl font-black text-slate-800 mb-2">Ready for Patients</h2>
                                            <p className="text-slate-400 max-w-xs mx-auto mb-8 font-medium">Select a patient from the queue to start consultation</p>

                                            {/* Quick Actions */}
                                            <div className="flex gap-4">
                                                <button
                                                    onClick={() => {
                                                        const nextPatient = queue.find(p => p.status === 'waiting' && p.doctorName === currentDoctor?.name);
                                                        if (nextPatient) handleCallPatient(nextPatient);
                                                        else alert("No patients waiting in your queue");
                                                    }}
                                                    className="px-6 py-3 rounded-xl bg-blue-50 text-blue-600 font-bold hover:bg-blue-100 transition-colors flex items-center gap-2"
                                                >
                                                    <Play className="w-4 h-4" /> Call Next Patient
                                                </button>

                                                {/* Not Available Button (Now toggles modal) */}
                                                <button
                                                    onClick={() => toggleAvailability(currentDoctor?.status === ('UNAVAILABLE' as DoctorStatusType))}
                                                    className={cn(
                                                        "px-6 py-3 rounded-xl font-bold border transition-colors flex items-center gap-2",
                                                        currentDoctor?.status === ('UNAVAILABLE' as DoctorStatusType)
                                                            ? "bg-slate-800 text-white border-slate-800 hover:bg-slate-700 shadow-lg"
                                                            : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                                                    )}
                                                >
                                                    <Coffee className="w-4 h-4" />
                                                    {currentDoctor?.status === ('UNAVAILABLE' as DoctorStatusType) ? "Resume Duty" : "Not Available"}
                                                </button>
                                            </div>
                                        </>
                                    )}
                                </div>
                            )}

                        </div>

                        {/* RIGHT SIDEBAR: Queue & Stats */}
                        <div className="w-80 flex-shrink-0 flex flex-col gap-6">

                            {/* ADMITTED PATIENTS (ROUNDS) */}
                            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col max-h-[300px] shrink-0">
                                <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                        <BedDouble className="w-5 h-5 text-indigo-500" />
                                        In-Patients
                                    </h3>
                                    <span className="text-xs font-bold px-2 py-1 bg-indigo-100 text-indigo-600 rounded-full">
                                        {admittedPatients.length}
                                    </span>
                                </div>
                                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                                    {admittedPatients.length === 0 ? (
                                        <div className="text-center py-8 text-slate-400 text-xs italic">No admitted patients</div>
                                    ) : (
                                        admittedPatients.map((bed: Bed) => (
                                            <div
                                                key={bed.id}
                                                onClick={() => {
                                                    setSelectedAdmittedPatient(bed);
                                                    setShowRoundsModal(true);
                                                }}
                                                className="p-3 bg-slate-50 hover:bg-indigo-50 border border-slate-100 rounded-xl cursor-pointer group transition-all"
                                            >
                                                <div className="flex justify-between items-start mb-1">
                                                    <span className="font-bold text-slate-800 text-sm">{bed.patientName || 'Unknown'}</span>
                                                    <span className="text-[10px] font-bold bg-indigo-100 text-indigo-700 px-1.5 py-0.5 rounded">
                                                        Bed {bed.bedNumber}
                                                    </span>
                                                </div>
                                                <div className="text-xs text-slate-500 flex items-center justify-between">
                                                    <span>{(bed.clinicalNotes || []).length} Notes</span>
                                                    <span className="text-indigo-500 opacity-0 group-hover:opacity-100 font-bold text-[10px] uppercase tracking-wider transition-opacity">
                                                        View Rounds →
                                                    </span>
                                                </div>
                                            </div>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* QUEUE LIST */}
                            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 overflow-hidden flex flex-col max-h-[calc(100vh-140px)] h-fit sticky top-6">
                                <div className="p-5 border-b border-slate-100 bg-slate-50 flex items-center justify-between">
                                    <h3 className="font-bold text-slate-700 flex items-center gap-2">
                                        <UserCircle className="w-5 h-5 text-blue-500" />
                                        Your Queue
                                    </h3>
                                    <span className="text-xs font-bold px-2 py-1 bg-blue-100 text-blue-600 rounded-full">
                                        {queue.filter(p => p.doctorName === currentDoctor?.name && p.status === 'waiting').length}
                                    </span>
                                </div>

                                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                                    {queue.filter(p => p.doctorName === currentDoctor?.name && p.status === 'waiting').length === 0 ? (
                                        <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                                            <Coffee className="w-8 h-8 opacity-20" />
                                            <span className="text-xs font-bold uppercase tracking-wider opacity-50">No Patients Waiting</span>
                                        </div>
                                    ) : (
                                        queue
                                            .filter(p => p.doctorName === currentDoctor?.name && p.status === 'waiting')
                                            .map((patient) => (
                                                <div key={patient.token} className="p-4 bg-slate-50 hover:bg-blue-50 border border-slate-100 rounded-2xl transition-all group cursor-pointer" onClick={() => handleCallPatient(patient)}>
                                                    <div className="flex justify-between items-start mb-2">
                                                        <span className="font-bold text-slate-800">{patient.patientName}</span>
                                                        <span className="text-xs font-bold text-blue-600 bg-blue-100 px-2 py-1 rounded-md">#{patient.token}</span>
                                                    </div>
                                                    <div className="flex items-center gap-3 text-xs text-slate-500 font-medium">
                                                        <span>{patient.age}Y • {patient.gender}</span>
                                                        <span>•</span>
                                                        <span className="flex items-center gap-1">
                                                            <Clock className="w-3 h-3" />
                                                            {Math.floor((Date.now() - (patient.checkInTime || Date.now())) / 60000)}m wait
                                                        </span>
                                                    </div>
                                                    <div className="mt-3 pt-3 border-t border-slate-200/50 flex items-center justify-between opacity-50 group-hover:opacity-100 transition-opacity">
                                                        <span className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Call Patient</span>
                                                        <Play className="w-4 h-4 text-blue-600" />
                                                    </div>
                                                </div>
                                            ))
                                    )}
                                </div>

                                {/* SENT TO IPD (Queue-based) */}
                                {queue.filter(p => p.doctorName === currentDoctor?.name && p.status === 'sent-to-ipd').length > 0 && (
                                    <div className="bg-gradient-to-br from-amber-50 to-amber-100 border-t border-amber-200">
                                        <div className="p-4 flex items-center justify-between">
                                            <span className="text-xs font-bold text-amber-700 uppercase tracking-wider flex items-center gap-2">
                                                <BedDouble className="w-4 h-4" />
                                                Sent to IPD
                                            </span>
                                            <span className="bg-amber-200 text-amber-700 px-2 py-0.5 rounded-full text-xs font-bold">
                                                {queue.filter(p => p.doctorName === currentDoctor?.name && p.status === 'sent-to-ipd').length}
                                            </span>
                                        </div>
                                        <div className="max-h-32 overflow-y-auto px-3 pb-3 space-y-2">
                                            {queue
                                                .filter(p => p.doctorName === currentDoctor?.name && p.status === 'sent-to-ipd')
                                                .slice(-3)
                                                .reverse()
                                                .map(p => {
                                                    const req = ipdRequests.find((r: AdmissionRequest) => r.patientName === p.patientName && (r.status === 'ASSIGNED' || r.status === 'PENDING' || r.status === 'PATIENT_SELECTED'));
                                                    return (
                                                        <div key={p.token} className="p-2 bg-white border border-amber-200 rounded-lg flex justify-between items-center cursor-pointer hover:shadow-md transition-all" onClick={() => setViewHistoryItem(p)}>
                                                            <div className="flex flex-col">
                                                                <span className="font-bold text-slate-700 text-xs">{p.patientName}</span>
                                                                {req?.status === 'ASSIGNED' && req.assignedBed ? (
                                                                    <span className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                                                                        <CheckCircle2 className="w-3 h-3" />
                                                                        Bed {req.assignedBed} Allotted
                                                                    </span>
                                                                ) : (
                                                                    <span className="text-[10px] text-amber-600">🏥 Awaiting Bed Assignment</span>
                                                                )}
                                                            </div>
                                                            <BedDouble className={cn("w-3 h-3", req?.status === 'ASSIGNED' ? "text-emerald-500" : "text-amber-500")} />
                                                        </div>
                                                    );
                                                })}
                                        </div>
                                    </div>
                                )}

                                {/* COMPLETED HISTORY */}
                                <div className="bg-slate-50 border-t border-slate-100">
                                    <button
                                        className="w-full p-4 flex items-center justify-between text-xs font-bold text-slate-500 uppercase tracking-wider hover:bg-slate-100 transition-colors"
                                        onClick={() => {
                                            const completed = queue.filter(p => p.doctorName === currentDoctor?.name && p.status === 'completed');
                                            if (completed.length) {
                                                const last = completed[completed.length - 1];
                                                setViewHistoryItem(last);
                                            }
                                        }}
                                    >
                                        <span>Recent Completed</span>
                                        <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full">
                                            {queue.filter(p => p.doctorName === currentDoctor?.name && p.status === 'completed').length}
                                        </span>
                                    </button>
                                    <div className="max-h-32 overflow-y-auto px-3 pb-3 space-y-2">
                                        {queue
                                            .filter(p => p.doctorName === currentDoctor?.name && p.status === 'completed')
                                            .slice(-3) // Show last 3
                                            .reverse()
                                            .map(p => (
                                                <div key={p.token} className="p-2 bg-white border border-slate-100 rounded-lg flex justify-between items-center opacity-75 hover:opacity-100 cursor-pointer" onClick={() => setViewHistoryItem(p)}>
                                                    <div className="flex flex-col">
                                                        <span className="font-bold text-slate-700 text-xs">{p.patientName}</span>
                                                        <span className="text-[10px] text-slate-400">Token #{p.token}</span>
                                                    </div>
                                                    <CheckCircle2 className="w-3 h-3 text-emerald-500" />
                                                </div>
                                            ))}
                                    </div>
                                </div>
                            </div>

                            {/* Availability Widget (New) */}
                            <div className="bg-white rounded-3xl shadow-xl shadow-slate-200/50 border border-slate-100 p-5">
                                <h3 className="font-bold text-slate-700 flex items-center gap-2 mb-4">
                                    <Calendar className="w-5 h-5 text-blue-500" />
                                    Availability
                                </h3>
                                <div className="flex items-center justify-between bg-slate-50 p-3 rounded-xl mb-3">
                                    <div>
                                        <div className="text-xs font-bold text-slate-400 uppercase">Today</div>
                                        <div className="font-black text-slate-700">
                                            {currentDoctor?.availability
                                                ? `${currentDoctor.availability.start} - ${currentDoctor.availability.end}`
                                                : "09:00 - 17:00"}
                                        </div>
                                    </div>
                                    <div className={`h-2.5 w-2.5 rounded-full ${currentDoctor?.status === 'UNAVAILABLE' ? 'bg-red-500 animate-pulse' : 'bg-emerald-500'}`} />
                                </div>
                                <button
                                    onClick={() => {
                                        setTempSchedule(currentDoctor?.availability || { start: '09:00', end: '17:00' });
                                        setShowScheduleModal(true);
                                    }}
                                    className="w-full py-2 bg-blue-50 rounded-lg text-xs font-bold text-blue-600 hover:bg-blue-100 transition-colors"
                                >
                                    Edit Schedule
                                </button>
                            </div>
                        </div>
                    </div>
                </div>

                {/* MODALS */}

                {/* UNAVAILABLE REASON MODAL */}
                {showUnavailableModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden transform transition-all scale-100">
                            <div className="p-6 border-b border-slate-100 bg-slate-50">
                                <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                    <AlertTriangle className="w-5 h-5 text-amber-500" />
                                    Set Unavailable Status
                                </h3>
                            </div>

                            <div className="p-6">
                                <label className="block text-sm font-bold text-slate-600 mb-2">Reason for Unavailability</label>

                                {/* Quick Options */}
                                <div className="flex flex-wrap gap-2 mb-4">
                                    {['Emergency', 'Lunch', 'Meeting', 'Personal'].map(opt => (
                                        <button
                                            key={opt}
                                            onClick={() => setUnavailableReasonText(opt)}
                                            className={cn(
                                                "px-3 py-1.5 rounded-lg text-xs font-bold border transition-all",
                                                unavailableReasonText === opt
                                                    ? "bg-slate-800 text-white border-slate-800"
                                                    : "bg-white text-slate-500 border-slate-200 hover:border-slate-300"
                                            )}
                                        >
                                            {opt}
                                        </button>
                                    ))}
                                </div>

                                <input
                                    type="text"
                                    className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-slate-800 focus:outline-none font-medium text-slate-700"
                                    placeholder="Or type a specific reason..."
                                    value={unavailableReasonText}
                                    onChange={(e) => setUnavailableReasonText(e.target.value)}
                                    autoFocus
                                />
                            </div>

                            <div className="p-4 bg-slate-50 flex justify-end gap-3">
                                <button
                                    onClick={() => setShowUnavailableModal(false)}
                                    className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => confirmUnavailable(unavailableReasonText)}
                                    disabled={!unavailableReasonText}
                                    className="px-6 py-2.5 rounded-xl bg-slate-900 text-white font-bold hover:bg-slate-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    Confirm Status
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ADMISSION MODAL */}
                {showAdmissionModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                            <div className="bg-amber-50 p-4 border-b border-amber-100 flex justify-between items-center">
                                <h3 className="font-bold text-amber-900 flex items-center gap-2">
                                    🛏️ Recommend Admission
                                </h3>
                                <button onClick={() => setShowAdmissionModal(false)} className="text-amber-400 hover:text-amber-700">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>
                            <div className="p-6 space-y-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Urgency</label>
                                    <div className="grid grid-cols-2 gap-3 mt-1">
                                        <button
                                            onClick={() => setAdmissionDetails({ ...admissionDetails, urgency: 'ROUTINE' })}
                                            className={cn("p-3 rounded-lg border-2 font-bold text-sm", admissionDetails.urgency === 'ROUTINE' ? "border-emerald-500 bg-emerald-50 text-emerald-700" : "border-slate-100")}
                                        >
                                            🟢 Routine
                                        </button>
                                        <button
                                            onClick={() => setAdmissionDetails({ ...admissionDetails, urgency: 'EMERGENCY' })}
                                            className={cn("p-3 rounded-lg border-2 font-bold text-sm", admissionDetails.urgency === 'EMERGENCY' ? "border-red-500 bg-red-50 text-red-700 animate-pulse" : "border-slate-100")}
                                        >
                                            🔴 Emergency
                                        </button>
                                    </div>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Recommended Category</label>
                                    <select
                                        className="w-full mt-1 p-3 border border-slate-200 rounded-lg font-medium"
                                        value={admissionDetails.type}
                                        onChange={(e) => setAdmissionDetails({ ...admissionDetails, type: e.target.value })}
                                    >
                                        <option value="gen">General Ward (₹500/day)</option>
                                        <option value="semi">Semi-Private (₹1200/day)</option>
                                        <option value="pvt">Private Room (₹2500/day)</option>
                                        <option value="icu">ICU (₹5000/day)</option>
                                    </select>
                                </div>

                                <div>
                                    <label className="text-xs font-bold text-slate-500 uppercase">Reason / Notes</label>
                                    <textarea
                                        className="w-full mt-1 p-3 border border-slate-200 rounded-lg text-sm"
                                        rows={3}
                                        placeholder="e.g., Severe Dehydration, Observation..."
                                        value={admissionDetails.reason}
                                        onChange={(e) => setAdmissionDetails({ ...admissionDetails, reason: e.target.value })}
                                    />
                                </div>

                                <button
                                    onClick={handleRecommendAdmission}
                                    className="w-full bg-amber-500 hover:bg-amber-600 text-white p-4 rounded-xl font-bold shadow-lg shadow-amber-200 transition-all"
                                >
                                    Confirm Recommendation
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ROUNDS MODAL */}
                {showRoundsModal && selectedAdmittedPatient && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                        <div className="bg-white w-full max-w-3xl rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                                <div>
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <BedDouble className="w-5 h-5 text-indigo-600" />
                                        In-Patient Rounds
                                    </h3>
                                    <p className="text-xs text-slate-500 font-bold uppercase mt-1">
                                        {selectedAdmittedPatient.patientName} • Bed {selectedAdmittedPatient.bedNumber}
                                    </p>
                                </div>
                                <div className="flex bg-slate-200 p-1 rounded-lg">
                                    <button
                                        onClick={() => setRoundsTab('notes')}
                                        className={cn(
                                            "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                                            roundsTab === 'notes' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        Clinical Notes
                                    </button>
                                    <button
                                        onClick={() => setRoundsTab('prescriptions')}
                                        className={cn(
                                            "px-4 py-1.5 rounded-md text-xs font-bold transition-all",
                                            roundsTab === 'prescriptions' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700"
                                        )}
                                    >
                                        Prescription
                                    </button>
                                </div>
                                <button onClick={() => setShowRoundsModal(false)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                                    <X className="w-5 h-5" />
                                </button>
                            </div>

                            <div className="flex-1 overflow-y-auto p-6 bg-slate-50/50">
                                {roundsTab === 'notes' ? (
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Add Note Section */}
                                        <div className="md:col-span-1 space-y-4">
                                            <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm sticky top-0">
                                                <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Add Clinical Note</label>
                                                <div className="space-y-3">
                                                    <select
                                                        className="w-full text-xs font-bold p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                        value={newRoundNote.type}
                                                        // @ts-ignore
                                                        onChange={e => setNewRoundNote({ ...newRoundNote, type: e.target.value })}
                                                    >
                                                        <option value="ROUND">Round Visit</option>
                                                        <option value="DIAGNOSIS">New Diagnosis</option>
                                                        <option value="INSTRUCTION">Instruction</option>
                                                        <option value="COMPLAINT">Complaint</option>
                                                    </select>
                                                    <textarea
                                                        className="w-full p-3 text-sm border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[120px]"
                                                        placeholder="Enter observations..."
                                                        value={newRoundNote.text}
                                                        onChange={e => setNewRoundNote({ ...newRoundNote, text: e.target.value })}
                                                    />
                                                    <button
                                                        onClick={() => {
                                                            if (!newRoundNote.text.trim()) return;
                                                            IpdService.addClinicalNote(selectedAdmittedPatient.id, {
                                                                ...newRoundNote,
                                                                doctorId: currentDoctorId,
                                                                doctorName: currentDoctor?.name || 'Unknown'
                                                            });
                                                            // Optimistic Update
                                                            const note = {
                                                                ...newRoundNote,
                                                                id: Math.random().toString(),
                                                                date: new Date().toISOString(),
                                                                doctorId: currentDoctorId,
                                                                doctorName: currentDoctor?.name || 'Unknown'
                                                            };
                                                            // @ts-ignore
                                                            const updatedBed = { ...selectedAdmittedPatient, clinicalNotes: [note, ...(selectedAdmittedPatient.clinicalNotes || [])] };
                                                            // @ts-ignore
                                                            setSelectedAdmittedPatient(updatedBed);
                                                            setNewRoundNote({ ...newRoundNote, text: '' });

                                                            // Refresh Global State
                                                            const allBeds = IpdService.getData().beds;
                                                            setAdmittedPatients(allBeds.filter((b: Bed) => b.status === "OCCUPIED"));
                                                        }}
                                                        disabled={!newRoundNote.text.trim()}
                                                        className="w-full bg-indigo-600 text-white py-2 rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                                    >
                                                        Save Note
                                                    </button>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Timeline Section */}
                                        <div className="md:col-span-2">
                                            <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4">Clinical History</h4>
                                            <div className="space-y-4 pl-4 border-l-2 border-indigo-100">
                                                {(selectedAdmittedPatient.clinicalNotes || []).length > 0 ? (selectedAdmittedPatient.clinicalNotes || []).map((note, idx) => (
                                                    <div key={note.id || idx} className="relative animate-in slide-in-from-right-2 duration-300">
                                                        <div className={cn(
                                                            "absolute -left-[21px] top-0 w-3 h-3 rounded-full border-2 border-white shadow-sm",
                                                            note.type === 'DIAGNOSIS' ? "bg-amber-500" :
                                                                note.type === 'INSTRUCTION' ? "bg-emerald-500" :
                                                                    note.type === 'COMPLAINT' ? "bg-red-500" :
                                                                        "bg-indigo-500"
                                                        )} />
                                                        <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm relative group hover:shadow-md transition-all">
                                                            <div className="flex justify-between items-start mb-2">
                                                                <div className="flex items-center gap-2">
                                                                    <span className={cn(
                                                                        "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                                                                        note.type === 'DIAGNOSIS' ? "bg-amber-100 text-amber-700" :
                                                                            note.type === 'INSTRUCTION' ? "bg-emerald-100 text-emerald-700" :
                                                                                note.type === 'COMPLAINT' ? "bg-red-100 text-red-700" :
                                                                                    "bg-indigo-100 text-indigo-700"
                                                                    )}>{note.type}</span>
                                                                    <span className="text-xs font-bold text-slate-700">{note.doctorName}</span>
                                                                </div>
                                                                <span className="text-[10px] text-slate-400 font-mono">
                                                                    {new Date(note.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                </span>
                                                            </div>
                                                            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-wrap">{note.text}</p>
                                                        </div>
                                                    </div>
                                                )) : (
                                                    <div className="text-center py-12 bg-white rounded-xl border border-dashed border-slate-200">
                                                        <p className="text-slate-400 italic text-sm">No clinical notes recorded yet.</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                ) : (
                                    /* PRESCRIPTION TAB */
                                    /* PRESCRIPTION TAB */
                                    /* PRESCRIPTION TAB */
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[500px]">
                                        {/* LEFT COLUMN: PAST PRESCRIPTIONS */}
                                        <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-full overflow-hidden">
                                            <div className="bg-slate-50 px-4 py-3 border-b border-slate-200 flex justify-between items-center shrink-0">
                                                <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-slate-400"></span>
                                                    Past Prescriptions
                                                </h4>
                                                <span className="bg-slate-200 text-slate-600 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                    {(selectedAdmittedPatient.prescriptions || []).filter(p => p.status === 'STOPPED').length}
                                                </span>
                                            </div>

                                            <div className="divide-y divide-slate-100 overflow-y-auto flex-1 p-1">
                                                {(selectedAdmittedPatient.prescriptions || []).filter(p => p.status === 'STOPPED').length > 0 ? (
                                                    (selectedAdmittedPatient.prescriptions || []).filter(p => p.status === 'STOPPED').map((rx) => (
                                                        <div key={rx.id} className="p-3 hover:bg-slate-50 transition-colors group opacity-75 hover:opacity-100">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <div className="font-bold text-slate-700 text-sm line-through decoration-slate-400">{rx.name}</div>
                                                                <button
                                                                    onClick={() => {
                                                                        IpdService.restartPrescription(selectedAdmittedPatient.id, rx.id);
                                                                        // Optimistic
                                                                        const updatedList = (selectedAdmittedPatient.prescriptions || []).map(p =>
                                                                            p.id === rx.id ? { ...p, status: 'ACTIVE' as const, stoppedAt: undefined, dateAdded: new Date().toISOString() } : p
                                                                        );
                                                                        // @ts-ignore
                                                                        setSelectedAdmittedPatient({ ...selectedAdmittedPatient, prescriptions: updatedList });
                                                                    }}
                                                                    className="text-[10px] font-bold text-indigo-600 bg-indigo-50 px-2 py-1 rounded hover:bg-indigo-100 transition-colors"
                                                                >
                                                                    Restart
                                                                </button>
                                                            </div>
                                                            <div className="flex items-center gap-2 text-[10px] text-slate-400 font-bold uppercase mb-2">
                                                                <span>{rx.qty}</span>
                                                                <span>•</span>
                                                                <span>Stopped: {rx.stoppedAt ? new Date(rx.stoppedAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : 'Unknown'}</span>
                                                            </div>
                                                            <div className="flex items-center gap-2">
                                                                <span className="font-mono font-bold text-slate-500 text-[10px] bg-slate-100 px-1.5 py-0.5 rounded">
                                                                    {rx.dosage?.m}-{rx.dosage?.a}-{rx.dosage?.n}
                                                                </span>
                                                                <span className="text-[10px] text-slate-400 font-medium italic">{rx.instruction}</span>
                                                            </div>
                                                        </div>
                                                    ))) : (
                                                    <div className="h-full flex flex-col items-center justify-center text-slate-300 p-8">
                                                        <div className="w-10 h-10 bg-slate-50 rounded-full flex items-center justify-center mb-2">
                                                            <Activity className="w-5 h-5 opacity-20" />
                                                        </div>
                                                        <p className="text-xs font-medium">No past prescriptions</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>

                                        {/* RIGHT COLUMN: ACTIVE PRESCRIPTIONS */}
                                        <div className="bg-white rounded-xl border border-slate-200 flex flex-col h-full overflow-hidden shadow-sm ring-1 ring-slate-100">
                                            <div className="bg-indigo-50/50 px-4 py-3 border-b border-indigo-100 flex justify-between items-center shrink-0">
                                                <h4 className="text-xs font-bold text-indigo-800 uppercase tracking-wider flex items-center gap-2">
                                                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                                                    Active Prescriptions
                                                </h4>
                                                <span className="bg-indigo-100 text-indigo-700 px-2 py-0.5 rounded-full text-[10px] font-bold">
                                                    {(selectedAdmittedPatient.prescriptions || []).filter(p => colIsActive(p)).length}
                                                </span>
                                            </div>

                                            <div className="divide-y divide-slate-100 overflow-y-auto flex-1 p-1">
                                                {(selectedAdmittedPatient.prescriptions || []).filter(p => colIsActive(p)).length > 0 ? (
                                                    (selectedAdmittedPatient.prescriptions || []).filter(p => colIsActive(p)).map((rx) => (
                                                        <div key={rx.id} className="p-3 hover:bg-slate-50 transition-colors group">
                                                            <div className="flex justify-between items-start mb-1">
                                                                <div className="font-bold text-slate-800 text-sm">{rx.name}</div>
                                                                <button
                                                                    onClick={() => {
                                                                        IpdService.stopPrescription(selectedAdmittedPatient.id, rx.id);
                                                                        // Optimistic
                                                                        const updatedList = (selectedAdmittedPatient.prescriptions || []).map(p =>
                                                                            p.id === rx.id ? { ...p, status: 'STOPPED' as const, stoppedAt: new Date().toISOString() } : p
                                                                        );
                                                                        // @ts-ignore
                                                                        setSelectedAdmittedPatient({ ...selectedAdmittedPatient, prescriptions: updatedList });
                                                                    }}
                                                                    className="h-6 w-6 flex items-center justify-center rounded text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                                    title="Stop Prescription"
                                                                >
                                                                    <X className="w-3.5 h-3.5" />
                                                                </button>
                                                            </div>

                                                            <div className="flex items-center gap-2 mb-2">
                                                                <span className="text-[10px] text-slate-400 font-bold uppercase">{rx.qty} • {rx.duration} Days</span>
                                                                <span className="w-1 h-1 rounded-full bg-slate-300"></span>
                                                                <span className="text-[10px] text-slate-400">Added: {new Date(rx.dateAdded).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</span>
                                                            </div>

                                                            <div className="bg-slate-50 p-2 rounded-lg border border-slate-100 flex items-center justify-between">
                                                                <div className="flex items-center gap-2">
                                                                    <span className="font-mono font-bold text-slate-700 text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">
                                                                        {rx.dosage?.m}-{rx.dosage?.a}-{rx.dosage?.n}
                                                                    </span>
                                                                    <span className="text-xs text-slate-500 font-medium italic">{rx.instruction}</span>
                                                                </div>
                                                                <div className="text-[9px] font-bold text-slate-400">
                                                                    By {rx.doctorName}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    ))) : (
                                                    <div className="h-full flex flex-col items-center justify-center text-slate-400 p-12">
                                                        <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mx-auto mb-3">
                                                            <BedDouble className="w-6 h-6 text-slate-300" />
                                                        </div>
                                                        <p className="text-sm font-medium">No active prescriptions</p>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                )}

                {/* COMPLETION MODAL */}
                {showFinishModal && (
                    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4 print:hidden">
                        <div className="bg-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-300">
                            <div className="bg-emerald-50 p-8 flex flex-col items-center border-b border-emerald-100">
                                <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 mb-4 shadow-sm ring-8 ring-emerald-50">
                                    <CheckCircle2 className="w-10 h-10" />
                                </div>
                                <h2 className="text-2xl font-black text-slate-800 mb-1">Consultation Complete!</h2>
                                <p className="text-slate-500 font-medium">Session recorded successfully.</p>
                            </div>

                            <div className="p-8">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 text-center">Deliver Prescription VIA</p>
                                <div className="grid grid-cols-2 gap-4 mb-8">
                                    <button
                                        onClick={handlePrintAction}
                                        className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-slate-100 hover:border-blue-500 hover:bg-blue-50 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 group-hover:scale-110 transition-transform">
                                            <Printer className="w-6 h-6" />
                                        </div>
                                        <div className="text-center">
                                            <span className="block font-bold text-slate-700">Print PDF</span>
                                            <span className="text-xs text-slate-400">Physical Copy</span>
                                        </div>
                                    </button>

                                    <button
                                        onClick={handleWhatsAppAction}
                                        className="flex flex-col items-center gap-3 p-6 rounded-2xl border-2 border-slate-100 hover:border-emerald-500 hover:bg-emerald-50 transition-all group"
                                    >
                                        <div className="w-12 h-12 bg-emerald-100 rounded-full flex items-center justify-center text-emerald-600 group-hover:scale-110 transition-transform">
                                            <Send className="w-6 h-6" />
                                        </div>
                                        <div className="text-center">
                                            <span className="block font-bold text-slate-700">WhatsApp</span>
                                            <span className="text-xs text-slate-400">Digital Copy</span>
                                        </div>
                                    </button>
                                </div>

                                <button
                                    onClick={() => {
                                        if (currentPatient) {
                                            // Handle Manual Admission Case (Create Request if seemingly missing)
                                            if (admitPatient) {
                                                IpdService.init();
                                                const existing = IpdService.getData().requests || [];
                                                const alreadyRequested = existing.some((r: AdmissionRequest) => r.patientId === currentPatient.token);

                                                if (!alreadyRequested) {
                                                    IpdService.createAdmissionRequest({
                                                        patientId: currentPatient.token,
                                                        patientName: currentPatient.patientName,
                                                        patientAge: String(currentPatient.age || 'N/A'),
                                                        patientGender: currentPatient.gender || 'Unknown',
                                                        doctorId: currentDoctorId,
                                                        doctorName: currentDoctor?.name || 'Unknown',
                                                        recommendedCategory: admissionDetails.type || 'gen',
                                                        urgency: (admissionDetails.urgency as 'ROUTINE' | 'EMERGENCY') || 'ROUTINE',
                                                        reason: diagnosis || 'Admission recommended by doctor'
                                                    });
                                                }
                                            }

                                            // Update Queue Status
                                            // SAFETY: Read from LS
                                            const freshQueueRaw = localStorage.getItem('orbit_queue');
                                            const freshQueue: QueueItem[] = freshQueueRaw ? JSON.parse(freshQueueRaw) : [];

                                            // Determine status: 'sent-to-ipd' if admitted, 'completed' otherwise
                                            const newStatus = admitPatient ? 'sent-to-ipd' as const : 'completed' as const;

                                            const updatedQueue = freshQueue.map(p =>
                                                p.token === currentPatient.token
                                                    ? { ...p, status: newStatus, completedTime: Date.now() }
                                                    : p
                                            );
                                            saveQueue(updatedQueue);
                                        }

                                        setShowFinishModal(false);
                                        // Reset Session
                                        setCurrentPatient(null);
                                        setDiagnosis('');
                                        setPrescriptions([]);
                                        setMedicine('');
                                        setAdmissionDetails({ type: 'gen', urgency: 'ROUTINE', reason: '' });
                                        setAdmitPatient(false);
                                        setSavedVisitData(null);
                                    }}
                                    className="w-full bg-slate-900 text-white rounded-2xl py-4 font-bold text-lg hover:bg-slate-800 transition-colors shadow-lg shadow-slate-200"
                                >
                                    Done & Close Session
                                </button>

                            </div>
                        </div>
                    </div>
                )}


                {/* SCHEDULE MODAL */}
                {
                    showScheduleModal && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl overflow-hidden">
                                <div className="p-6 border-b border-slate-100 bg-slate-50">
                                    <h3 className="text-lg font-bold text-slate-800 flex items-center gap-2">
                                        <Calendar className="w-5 h-5 text-blue-600" />
                                        Set Availability
                                    </h3>
                                </div>
                                <div className="p-6 space-y-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Start Time</label>
                                        <input
                                            type="time"
                                            className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none font-bold text-slate-700"
                                            value={tempSchedule?.start || '09:00'}
                                            onChange={(e) => setTempSchedule({ ...tempSchedule, start: e.target.value })}
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-500 uppercase mb-1">End Time</label>
                                        <input
                                            type="time"
                                            className="w-full p-3 rounded-xl border-2 border-slate-200 focus:border-blue-500 focus:outline-none font-bold text-slate-700"
                                            value={tempSchedule?.end || '17:00'}
                                            onChange={(e) => setTempSchedule({ ...tempSchedule, end: e.target.value })}
                                        />
                                    </div>
                                </div>
                                <div className="p-4 bg-slate-50 flex justify-end gap-3">
                                    <button
                                        onClick={() => setShowScheduleModal(false)}
                                        className="px-5 py-2.5 rounded-xl font-bold text-slate-500 hover:bg-slate-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleUpdateSchedule}
                                        className="px-6 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold shadow-lg shadow-blue-200 transition-all"
                                    >
                                        Save Schedule
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }


                {/* HISTORY DETAILS MODAL */}
                {
                    viewHistoryItem && (
                        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                                <div className="bg-slate-50 p-4 border-b border-slate-100 flex justify-between items-center shrink-0">
                                    <div>
                                        <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                            Visit Details
                                        </h3>
                                        <p className="text-xs text-slate-500 font-bold uppercase mt-1">
                                            {viewHistoryItem.patientName} • Token #{viewHistoryItem.token}
                                        </p>
                                    </div>
                                    <button onClick={() => setViewHistoryItem(null)} className="text-slate-400 hover:text-slate-700 p-2 bg-white rounded-full shadow-sm hover:shadow-md transition-all">
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>

                                <div className="p-6 overflow-y-auto custom-scrollbar">
                                    {/* Diagnosis Section */}
                                    <div className="mb-6">
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Diagnosis & Findings</label>
                                        <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 text-slate-700 font-medium whitespace-pre-wrap break-words overflow-hidden">
                                            {viewHistoryItem.visitDetails?.diagnosis || "No diagnosis recorded."}
                                        </div>
                                    </div>

                                    {/* Prescription Section */}
                                    <div>
                                        <label className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-2 block">Prescribed Medication</label>
                                        {viewHistoryItem.visitDetails?.prescriptions?.length > 0 ? (
                                            <div className="space-y-2">
                                                {viewHistoryItem.visitDetails.prescriptions.map((script: any, idx: number) => (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-white rounded-lg border border-slate-100 shadow-sm">
                                                        <div>
                                                            <span className="font-bold text-slate-800 block">{script.name}</span>
                                                            <span className="text-xs text-slate-500 font-mono">
                                                                {script.dosage.m}-{script.dosage.a}-{script.dosage.n} • {script.duration} Days
                                                            </span>
                                                        </div>
                                                        <div className="text-xs font-bold bg-slate-100 px-2 py-1 rounded text-slate-600">
                                                            Qty: {script.qty}
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        ) : (
                                            <div className="text-sm text-slate-400 italic">No medications prescribed.</div>
                                        )}
                                    </div>
                                </div>

                                <div className="p-4 bg-slate-50 border-t border-slate-100 shrink-0 flex justify-end gap-3">
                                    <button
                                        onClick={() => {
                                            // Re-hydrate state to print
                                            setSavedVisitData({
                                                doctor: currentDoctor!,
                                                patient: { ...viewHistoryItem, patientName: viewHistoryItem.patientName, age: viewHistoryItem.age || '--', gender: viewHistoryItem.gender || 'Unknown', id: viewHistoryItem.id || '0' },
                                                diagnosis: viewHistoryItem.visitDetails?.diagnosis || '',
                                                prescriptions: viewHistoryItem.visitDetails?.prescriptions || [],
                                                date: new Date().toLocaleDateString()
                                            });
                                            setTimeout(() => window.print(), 100);
                                        }}
                                        className="flex items-center gap-2 px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 rounded-lg font-bold transition-all"
                                    >
                                        <Printer className="w-4 h-4" /> Print Copy
                                    </button>
                                    <button
                                        onClick={() => setViewHistoryItem(null)}
                                        className="px-6 py-2 bg-slate-800 hover:bg-slate-900 text-white rounded-lg font-bold transition-all"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    )
                }

                {/* HIDDEN PRINT TEMPLATE */}
                {
                    savedVisitData && (
                        <div className="hidden print:block fixed inset-0 bg-white z-[9999]">
                            <PrescriptionTemplate
                                {...savedVisitData}
                            />
                        </div>
                    )
                }
            </div >
        </>
    );
}
