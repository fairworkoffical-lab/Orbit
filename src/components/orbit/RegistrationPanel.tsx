'use client';

import React, { useState, useEffect } from 'react';
import { TriageChips, TriageChip } from './TriageChips';

interface PatientRecord {
    id: string;
    name: string;
    age: number;
    gender: 'M' | 'F' | 'O';
    lastVisit?: string;
    lastDoctor?: string;
    lastComplaint?: string;
}

interface RegistrationPanelProps {
    selectedDoctor: { id: string; name: string; specialization: string } | null;
    onGenerateToken: (data: RegistrationData) => void;
    selectedCategory: string;
    onCategoryChange: (category: string) => void;
}

export interface RegistrationData {
    phone: string;
    name: string;
    age: number;
    gender: 'M' | 'F' | 'O';
    triageChip: TriageChip;
    otherComplaintDescription?: string;
    doctorCategory?: string;
    doctorId: string;
    isFollowUp: boolean;
    visitReason?: string;
    fee: number;
}

// Doctor categories / specializations
const doctorCategories = [
    { id: 'all', label: 'All Categories', icon: '🏥' },
    { id: 'general', label: 'General Medicine', icon: '👨‍⚕️' },
    { id: 'pediatrics', label: 'Pediatrics', icon: '👶' },
    { id: 'orthopedics', label: 'Orthopedics', icon: '🦴' },
    { id: 'ent', label: 'ENT', icon: '👂' },
    { id: 'dermatology', label: 'Dermatology', icon: '🩺' },
    { id: 'cardiology', label: 'Cardiology', icon: '❤️' },
    { id: 'gynecology', label: 'Gynecology', icon: '🩷' },
];

// Mock patient database
const mockPatients: Record<string, PatientRecord> = {
    '9876543210': {
        id: 'pat_001',
        name: 'Amit Sharma',
        age: 34,
        gender: 'M',
        lastVisit: '3 days ago',
        lastDoctor: 'Dr. Sarah Smith',
        lastComplaint: 'Fever',
    },
    '9876543211': {
        id: 'pat_002',
        name: 'Priya Das',
        age: 28,
        gender: 'F',
        lastVisit: '2 weeks ago',
        lastDoctor: 'Dr. John Doe',
        lastComplaint: 'General Checkup',
    },
};

type LookupStatus = 'idle' | 'searching' | 'found' | 'new' | 'duplicate';

export function RegistrationPanel({ selectedDoctor, onGenerateToken, selectedCategory, onCategoryChange }: RegistrationPanelProps) {
    // Form state
    const [phone, setPhone] = useState('');
    const [name, setName] = useState('');
    const [age, setAge] = useState('');
    const [gender, setGender] = useState<'M' | 'F' | 'O' | ''>('');
    const [triageChip, setTriageChip] = useState<TriageChip>('GENERAL');
    const [otherDescription, setOtherDescription] = useState('');
    const [visitReason, setVisitReason] = useState('');
    const [isFollowUp, setIsFollowUp] = useState(false);
    const [fee, setFee] = useState('500');

    // System state
    const [lookupStatus, setLookupStatus] = useState<LookupStatus>('idle');
    const [foundPatient, setFoundPatient] = useState<PatientRecord | null>(null);
    const [isGenerating, setIsGenerating] = useState(false);
    const [generatedToken, setGeneratedToken] = useState<string | null>(null);
    const [successDoctorName, setSuccessDoctorName] = useState<string | null>(null);

    // Phone lookup logic
    useEffect(() => {
        if (phone.length === 10) {
            setLookupStatus('searching');

            // Simulate API lookup
            setTimeout(() => {
                const patient = mockPatients[phone];
                if (patient) {
                    setFoundPatient(patient);
                    setName(patient.name);
                    setAge(patient.age.toString());
                    setGender(patient.gender);
                    setLookupStatus('found');
                } else {
                    setFoundPatient(null);
                    setLookupStatus('new');
                }
            }, 500);
        } else {
            setLookupStatus('idle');
            setFoundPatient(null);
        }
    }, [phone]);

    // Check if form is complete
    const isOtherValid = triageChip !== 'OTHER' || (triageChip === 'OTHER' && otherDescription.trim().length > 0);
    const isFormComplete = phone.length === 10 && name && age && gender && triageChip && selectedDoctor && isOtherValid;

    const handleGenerateToken = async () => {
        if (!isFormComplete || !selectedDoctor) return;

        setIsGenerating(true);

        // Simulate token generation
        await new Promise(resolve => setTimeout(resolve, 1500));

        const token = `T-${String(Math.floor(Math.random() * 900) + 100)}`;
        setGeneratedToken(token);
        setSuccessDoctorName(selectedDoctor?.name || null);
        setIsGenerating(false);

        onGenerateToken({
            phone,
            name,
            age: parseInt(age),
            gender: gender as 'M' | 'F' | 'O',
            triageChip,
            otherComplaintDescription: triageChip === 'OTHER' ? otherDescription : undefined,
            doctorCategory: selectedCategory !== 'all' ? selectedCategory : undefined,
            doctorId: selectedDoctor.id,
            visitReason,
            isFollowUp,
            fee: parseInt(fee) || 0,
        });
    };

    const handleReset = () => {
        setPhone('');
        setName('');
        setAge('');
        setGender('');
        setTriageChip('GENERAL');
        setOtherDescription('');
        setVisitReason('');
        onCategoryChange('all');
        setIsFollowUp(false);
        setFee('500');
        setFoundPatient(null);
        setLookupStatus('idle');
        setGeneratedToken(null);
    };

    // Token generated success view
    if (generatedToken) {
        return (
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6">
                <div className="text-center space-y-4">
                    <div className="w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mx-auto">
                        <span className="text-3xl">✅</span>
                    </div>
                    <h2 className="text-lg font-bold text-emerald-700">TOKEN GENERATED SUCCESSFULLY</h2>

                    <div className="bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left space-y-2">
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Token:</span>
                            <span className="text-2xl font-mono font-bold text-emerald-700">{generatedToken}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Patient:</span>
                            <span className="font-medium text-slate-800">{name}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Doctor:</span>
                            <span className="font-medium text-slate-800">{successDoctorName}</span>
                        </div>
                        <div className="flex items-center justify-between">
                            <span className="text-sm text-slate-600">Est. Wait:</span>
                            <span className="font-medium text-slate-800">~18 minutes</span>
                        </div>
                    </div>

                    <div className="flex gap-3 pt-4">
                        <button className="flex-1 py-3 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
                            🖨️ Print Token
                        </button>
                        <button
                            onClick={handleReset}
                            className="flex-1 py-3 bg-blue-600 text-white rounded-xl font-medium hover:bg-blue-700 transition-colors"
                        >
                            Register Next Patient →
                        </button>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 space-y-6">
            <h2 className="text-lg font-bold text-slate-800">New Registration</h2>

            {/* SECTION 1: Identification */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    1. Identification
                </h3>

                <div className="grid grid-cols-2 gap-4">
                    {/* Phone Input */}
                    <div className="relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">📱</span>
                        <input
                            type="tel"
                            placeholder="Mobile Number"
                            value={phone}
                            onChange={(e) => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))}
                            className="w-full pl-10 pr-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors"
                        />
                    </div>

                    {/* Name Input */}
                    <input
                        type="text"
                        placeholder="Patient Name"
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        disabled={lookupStatus === 'found'}
                        className="w-full px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors disabled:bg-slate-50"
                    />
                </div>

                {/* System Feedback */}
                {lookupStatus === 'searching' && (
                    <div className="flex items-center gap-2 text-sm text-blue-600 bg-blue-50 px-3 py-2 rounded-lg">
                        <span className="animate-spin">⏳</span>
                        Searching records...
                    </div>
                )}

                {lookupStatus === 'found' && foundPatient && (
                    <div className="bg-emerald-50 border border-emerald-200 rounded-lg p-3 space-y-2">
                        <div className="flex items-center gap-2 text-emerald-700 font-medium">
                            <span>✅</span>
                            RETURNING PATIENT: {foundPatient.name}
                        </div>
                        <p className="text-sm text-slate-600">
                            Last visit: {foundPatient.lastVisit} ({foundPatient.lastDoctor} - {foundPatient.lastComplaint})
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => { setIsFollowUp(true); setTriageChip('FOLLOWUP'); }}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${isFollowUp
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300'
                                    }`}
                            >
                                This is a Follow-up
                            </button>
                            <button
                                onClick={() => setIsFollowUp(false)}
                                className={`px-3 py-1.5 rounded-full text-sm font-medium transition-colors ${!isFollowUp
                                    ? 'bg-blue-600 text-white'
                                    : 'bg-white border border-slate-200 text-slate-700 hover:border-blue-300'
                                    }`}
                            >
                                New Complaint
                            </button>
                        </div>
                    </div>
                )}

                {lookupStatus === 'new' && (
                    <div className="flex items-center gap-2 text-sm text-slate-600 bg-slate-50 px-3 py-2 rounded-lg">
                        <span>👤</span>
                        New patient. Please enter details.
                    </div>
                )}
            </div>

            {/* SECTION 2: Details */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    2. Details
                </h3>

                <div className="flex items-center gap-4">
                    {/* Age */}
                    <input
                        type="number"
                        placeholder="Age"
                        value={age}
                        onChange={(e) => setAge(e.target.value)}
                        min="1"
                        max="120"
                        disabled={lookupStatus === 'found'}
                        className="w-24 px-4 py-3 border-2 border-slate-200 rounded-xl focus:border-blue-500 focus:outline-none transition-colors disabled:bg-slate-50"
                    />

                    {/* Gender Buttons */}
                    <div className="flex gap-2">
                        {(['M', 'F', 'O'] as const).map((g) => (
                            <button
                                key={g}
                                onClick={() => setGender(g)}
                                disabled={lookupStatus === 'found'}
                                className={`
                                    px-6 py-3 rounded-xl font-medium transition-all
                                    ${gender === g
                                        ? 'bg-blue-600 text-white shadow-lg'
                                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                                    }
                                    disabled:opacity-50
                                `}
                            >
                                {g === 'M' ? 'Male' : g === 'F' ? 'Female' : 'Other'}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* SECTION 3: Triage */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    3. Complaint Type
                </h3>
                <TriageChips
                    selected={triageChip}
                    onSelect={setTriageChip}
                    otherDescription={otherDescription}
                    onOtherDescriptionChange={setOtherDescription}
                />

                {/* Fee Input */}
                <div className="mt-4 p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center gap-3 w-fit">
                    <span className="text-sm font-bold text-amber-800 uppercase">Consultation Fee</span>
                    <div className="relative w-32">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 font-bold">₹</span>
                        <input
                            type="number"
                            value={fee}
                            onChange={(e) => setFee(e.target.value)}
                            className="w-full pl-7 pr-3 py-1.5 rounded-lg border border-amber-300 font-mono font-bold text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
                        />
                    </div>
                </div>
            </div>

            {/* SECTION 3.5: Doctor Category */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    3.5 Doctor Category <span className="text-red-500">*</span>
                </h3>
                <div className="grid grid-cols-4 gap-2">
                    {doctorCategories.map((cat) => (
                        <button
                            key={cat.id}
                            onClick={() => onCategoryChange(cat.id)}
                            className={`
                                flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all duration-200
                                ${selectedCategory === cat.id
                                    ? 'bg-blue-50 border-blue-300 text-blue-700 ring-2 ring-blue-500 ring-offset-1'
                                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300'
                                }
                            `}
                        >
                            <span className="text-xl">{cat.icon}</span>
                            <span className="text-xs font-medium text-center leading-tight">{cat.label}</span>
                        </button>
                    ))}
                </div>
                {selectedCategory !== 'all' && (
                    <p className="text-xs text-blue-600">
                        ✓ Preference noted: {doctorCategories.find(c => c.id === selectedCategory)?.label}
                    </p>
                )}
            </div>

            {/* SECTION 4: Doctor Assignment */}
            <div className="space-y-3">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                    4. Doctor Assignment
                </h3>

                {selectedDoctor ? (
                    <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                        <div className="flex items-center gap-3">
                            <span className="text-2xl">🟢</span>
                            <div>
                                <p className="text-xs text-blue-600 font-medium uppercase">Selected Doctor</p>
                                <p className="font-bold text-slate-800">{selectedDoctor.name}</p>
                                <p className="text-sm text-slate-500">{selectedDoctor.specialization}</p>
                            </div>
                        </div>

                        <div className="mt-3 border-t border-blue-200 pt-3">
                            <label className="text-xs text-blue-800 font-semibold uppercase mb-1 block">
                                Visit Reason / Notes (Optional)
                            </label>
                            <textarea
                                value={visitReason}
                                onChange={(e) => setVisitReason(e.target.value)}
                                placeholder="Enter specific symptoms or notes for the doctor..."
                                className="w-full text-sm p-2 rounded-lg border border-blue-200 bg-white focus:outline-none focus:ring-2 focus:ring-blue-400 placeholder:text-slate-400"
                                rows={2}
                            />
                        </div>
                    </div>
                ) : (
                    <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-center text-amber-700">
                        ⚠️ Please select a doctor from the Doctor Availability strip above
                    </div>
                )}
            </div>

            {/* Generate Token Button */}
            <button
                onClick={handleGenerateToken}
                disabled={!isFormComplete || isGenerating}
                className={`
                    w-full py-4 rounded-xl font-bold text-base uppercase tracking-wider transition-all flex items-center justify-center gap-2
                    ${isFormComplete
                        ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg hover:shadow-xl hover:scale-[1.01]'
                        : 'bg-slate-200 text-slate-500 cursor-not-allowed'
                    }
                `}
            >
                {isGenerating ? (
                    <>
                        <span className="animate-spin">⏳</span>
                        Generating Token...
                    </>
                ) : (
                    <>
                        🎫 Generate Token →
                    </>
                )}
            </button>

            {
                !isFormComplete && (
                    <div className="text-xs text-red-500 text-center font-medium bg-red-50 p-2 rounded-lg">
                        Missing Required Fields: {[
                            phone.length !== 10 && 'Phone (10 digits)',
                            !name && 'Patient Name',
                            !age && 'Age',
                            !gender && 'Gender',
                            !selectedDoctor && 'Doctor'
                        ].filter(Boolean).join(', ')}
                    </div>
                )
            }
        </div >
    );
}
