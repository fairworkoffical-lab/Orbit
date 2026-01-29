'use client';

import React from 'react';

import { Doctor, DoctorStatusType } from '@/lib/types';
export type { Doctor, DoctorStatusType };

// Initial state - All queues empty, calculated based on efficiency
/* 
   NOTE: `initialDoctors` is now managed in `store.ts` for dynamic updates. 
   Keeping this here ONLY for fallback or static demos if store is empty, 
   but ideally we rely on store.
*/

// Initial state - All queues empty, calculated based on efficiency
export const initialDoctors: Doctor[] = [
    {
        id: 'dr_sarah_smith',
        name: 'Dr. Sarah Smith',
        specialization: 'General Medicine',
        categoryId: 'general',
        status: 'READY',
        queueCount: 0,
        estimatedWait: 0,
        consultDuration: 10, // Fast
        isRecommended: true,
        availability: { start: '09:00', end: '17:00' },
    },
    {
        id: 'dr_john_doe',
        name: 'Dr. John Doe',
        specialization: 'Pediatrics',
        categoryId: 'pediatrics',
        status: 'READY',
        queueCount: 0,
        estimatedWait: 0,
        consultDuration: 15, // Avg
        isRecommended: false,
    },
    {
        id: 'dr_priya_sharma',
        name: 'Dr. Priya Sharma',
        specialization: 'Orthopedics',
        categoryId: 'orthopedics',
        status: 'READY',
        queueCount: 0,
        estimatedWait: 0,
        consultDuration: 20, // Slow/Complex
        isRecommended: false,
    },
    {
        id: 'dr_amit_kumar',
        name: 'Dr. Amit Kumar',
        specialization: 'ENT',
        categoryId: 'ent',
        status: 'BREAK',
        queueCount: 0,
        estimatedWait: 0,
        consultDuration: 12,
        breakReturnTime: 15,
        isRecommended: false,
    },
    {
        id: 'dr_meera_gupta',
        name: 'Dr. Meera Gupta',
        specialization: 'Dermatology',
        categoryId: 'dermatology',
        status: 'READY',
        queueCount: 0,
        estimatedWait: 0,
        consultDuration: 15,
        isRecommended: false,
    },
    {
        id: 'dr_rajesh_verma',
        name: 'Dr. Rajesh Verma',
        specialization: 'Cardiology',
        categoryId: 'cardiology',
        status: 'READY',
        queueCount: 0,
        estimatedWait: 0,
        consultDuration: 25, // Complex
        isRecommended: false,
    },
    {
        id: 'dr_anita_singh',
        name: 'Dr. Anita Singh',
        specialization: 'Gynecology',
        categoryId: 'gynecology',
        status: 'READY',
        queueCount: 0,
        estimatedWait: 0,
        consultDuration: 18,
        isRecommended: false,
    },
];



const statusConfig: Record<DoctorStatusType, { color: string; bg: string; label: string; icon: string }> = {
    READY: { color: 'text-emerald-700', bg: 'bg-emerald-50 border-emerald-200', label: 'Ready', icon: '🟢' },
    BUSY: { color: 'text-amber-700', bg: 'bg-amber-50 border-amber-200', label: 'Busy', icon: '🟡' },
    FULL: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'Full', icon: '🔴' },
    BREAK: { color: 'text-slate-500', bg: 'bg-slate-100 border-slate-200', label: 'Break', icon: '☕' },
    LATE: { color: 'text-orange-700', bg: 'bg-orange-50 border-orange-200', label: 'Late', icon: '⚠️' },
    UNAVAILABLE: { color: 'text-red-700', bg: 'bg-red-50 border-red-200', label: 'N/A', icon: '⛔' },
};

function DoctorCard({ doctor, onSelect, isSelected }: { doctor: Doctor; onSelect?: (id: string) => void; isSelected?: boolean }) {
    const config = statusConfig[doctor.status];
    const isClickable = doctor.status !== 'BREAK' && doctor.status !== 'FULL' && doctor.status !== 'UNAVAILABLE';

    const handleClick = () => {
        if (doctor.status === 'UNAVAILABLE') {
            alert(`⛔ Doctor Not Available\nReason: ${doctor.statusReason || 'Unspecified'}`);
            return;
        }
        if (isClickable) onSelect?.(doctor.id);
    };

    return (
        <div
            onClick={handleClick}
            className={`
                relative flex-shrink-0 w-56 p-3 rounded-xl border-2 transition-all duration-200
                ${config.bg}
                ${isClickable ? 'cursor-pointer hover:scale-[1.02] hover:shadow-md' : 'opacity-60 cursor-not-allowed'}
                ${isSelected ? 'ring-2 ring-blue-500 ring-offset-2' : ''}
            `}
        >
            {/* Selected Badge */}
            {isSelected && (
                <div className="absolute -top-2 -right-2 bg-blue-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-lg">
                    ✓ SELECTED
                </div>
            )}

            {/* Status & Name */}
            <div className="flex items-center gap-2 mb-2">
                <span className="text-lg">{config.icon}</span>
                <div className="flex-1 min-w-0">
                    <h3 className={`font-bold text-sm truncate ${config.color}`}>{doctor.name}</h3>
                    <div className="flex items-center gap-2">
                        <p className="text-xs text-slate-500 truncate">{doctor.specialization}</p>
                        {doctor.availability && (
                            <span className="text-[10px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono">
                                {doctor.availability.start}-{doctor.availability.end}
                            </span>
                        )}
                    </div>
                </div>
            </div>

            {/* Stats */}
            {doctor.status !== 'BREAK' && doctor.status !== 'UNAVAILABLE' ? (
                <div className="flex items-center justify-between text-xs border-t border-slate-200/50 pt-2 mt-2">
                    <span className="text-slate-600">
                        <strong className="text-slate-800">{doctor.queueCount}</strong> in queue
                    </span>
                    <span className="text-slate-600">
                        ~<strong className="text-slate-800">{doctor.estimatedWait}</strong>m wait
                    </span>
                </div>
            ) : (
                <div className="text-xs text-slate-500 border-t border-slate-200/50 pt-2 mt-2">
                    {doctor.status === 'UNAVAILABLE' ? (
                        <span className="text-red-600 font-bold truncate block" title={doctor.statusReason}>
                            Reason: {doctor.statusReason || 'N/A'}
                        </span>
                    ) : (
                        <span>☕ Back in ~{doctor.breakReturnTime}m</span>
                    )}
                </div>
            )}
        </div>
    );
}

interface DoctorStatusStripProps {
    onDoctorSelect?: (id: string) => void;
    categoryFilter?: string;
    selectedDoctorId?: string | null;
    doctors: Doctor[];
}

export function DoctorStatusStrip({ onDoctorSelect, categoryFilter, selectedDoctorId, doctors }: DoctorStatusStripProps) {
    // Filter doctors by category
    const filteredDoctors = categoryFilter && categoryFilter !== 'all'
        ? doctors.filter(d => d.specialty.toLowerCase() === categoryFilter) // Changed from categoryId to specialty
        : doctors;

    // Get category label for display
    const categoryLabels: Record<string, string> = {
        all: 'All Doctors',
        general: 'General Medicine',
        pediatrics: 'Pediatrics',
        orthopedics: 'Orthopedics',
        ent: 'ENT',
        dermatology: 'Dermatology',
        cardiology: 'Cardiology',
        gynecology: 'Gynecology',
    };

    return (
        <div className="sticky top-16 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-sm">
            <div className="container mx-auto px-4 py-3">
                {/* Header */}
                <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                        <h2 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                            Doctor Availability
                        </h2>
                        {categoryFilter && categoryFilter !== 'all' && (
                            <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                {categoryLabels[categoryFilter] || categoryFilter}
                            </span>
                        )}
                    </div>
                    <div className="flex items-center gap-4 text-xs text-slate-500">
                        <span>🟢 Ready</span>
                        <span>🟡 Busy</span>
                        <span>🔴 Full</span>
                        <span>🔴 Full</span>
                        <span>☕ Break</span>
                        <span>⛔ N/A</span>
                    </div>
                </div>

                {/* Doctor Cards - Horizontal Scroll */}
                <div className="flex gap-3 overflow-x-auto overflow-y-visible pt-3 pb-2 -mx-4 px-4 scrollbar-thin scrollbar-thumb-slate-300">
                    {filteredDoctors.length > 0 ? (
                        filteredDoctors.map((doctor) => (
                            <DoctorCard
                                key={doctor.id}
                                doctor={doctor}
                                onSelect={onDoctorSelect}
                                isSelected={selectedDoctorId === doctor.id}
                            />
                        ))
                    ) : (
                        <div className="flex items-center justify-center w-full py-4 text-sm text-slate-500">
                            No doctors available for this category
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

