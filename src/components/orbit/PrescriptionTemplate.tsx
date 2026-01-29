import React from 'react';
import { Doctor } from './DoctorStatusStrip';
import { QueueItem } from './OperationalQueue';

export interface PrescriptionItem {
    id: number;
    name: string;
    dosage: { m: string; a: string; n: string };
    timing: string;
    duration: string;
    qty?: string;
    instruction?: string;
}

interface PrescriptionProps {
    doctor: Doctor;
    patient: QueueItem;
    diagnosis: string;
    prescriptions: PrescriptionItem[];
    followUp: string | null;
    date: string;
    instructions?: string;
    admitPatient?: boolean;
}

export const PrescriptionTemplate = ({ doctor, patient, diagnosis, prescriptions, followUp, date, instructions, admitPatient }: PrescriptionProps) => {
    return (
        <div className="bg-white text-black p-8 max-w-[210mm] mx-auto min-h-[297mm] font-serif">
            {/* HEADER */}
            <div className="flex justify-between items-start border-b-2 border-slate-800 pb-6 mb-8">
                <div>
                    <h1 className="text-3xl font-bold uppercase tracking-wide mb-1">Orbit City Hospital</h1>
                    <p className="text-sm text-slate-600">123, Health Tech Park, Koramangala, Bangalore - 560034</p>
                    <p className="text-sm text-slate-600">Ph: +91 80 1234 5678 | Emergency: 108</p>
                </div>
                <div className="text-right">
                    <h2 className="text-xl font-bold">{doctor.name}</h2>
                    <p className="text-sm text-slate-600">{doctor.specialization.toUpperCase()}</p>
                    <p className="text-xs text-slate-500 mt-1">Reg: MCI-2026-XYZ | MBBS, MD</p>
                </div>
            </div>

            {/* PATIENT INFO */}
            <div className="flex justify-between items-start mb-8 bg-slate-50 p-4 rounded-none border border-slate-200">
                <div className="space-y-1">
                    <p className="text-sm"><span className="font-bold w-20 inline-block">Patient:</span> {patient.patientName}</p>
                    <p className="text-sm"><span className="font-bold w-20 inline-block">Age/Sex:</span> {patient.age} Yrs / {patient.gender}</p>
                    <p className="text-sm"><span className="font-bold w-20 inline-block">Mobile:</span> {patient.mobileNumber || '+91 -'}</p>
                </div>
                <div className="space-y-1 text-right">
                    <p className="text-sm"><span className="font-bold">Date:</span> {date}</p>
                    <p className="text-sm"><span className="font-bold">Visit ID:</span> {patient.token}</p>
                    {patient.visitFee && <p className="text-sm"><span className="font-bold">Consultation Fee:</span> ₹{patient.visitFee}</p>}
                </div>
            </div>

            {/* DIAGNOSIS */}
            <div className="mb-8">
                <h3 className="font-bold uppercase text-sm border-b border-slate-400 mb-2 pb-1">Diagnosis</h3>
                <div className="whitespace-pre-wrap text-base leading-relaxed pl-2 break-words">
                    {diagnosis || 'General Consultation'}
                </div>
            </div>

            {/* PRESCRIPTION TABLE */}
            <div className="mb-8">
                <h3 className="font-bold uppercase text-sm border-b border-slate-400 mb-4 pb-1">Rx (Medicines)</h3>
                <table className="w-full text-left text-sm border-collapse">
                    <thead>
                        <tr className="border-b border-slate-300">
                            <th className="py-2 w-[35%]">Medicine Name</th>
                            <th className="py-2 text-center w-[20%]">Dosage</th>
                            <th className="py-2 text-center">Timing - Frequency - Duration</th>
                            <th className="py-2 text-right">Qty</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        {prescriptions.map((px, i) => (
                            <tr key={i} className="border-b border-slate-100">
                                <td className="py-3 font-medium align-top">
                                    {i + 1}. {px.name}
                                </td>
                                <td className="py-3 text-center align-top font-mono font-bold whitespace-nowrap">
                                    {px.dosage.m}&nbsp;-&nbsp;{px.dosage.a}&nbsp;-&nbsp;{px.dosage.n}
                                </td>
                                <td className="py-3 text-center align-top">
                                    {px.timing} &mdash; Daily &mdash; {px.duration}
                                </td>
                                <td className="py-3 text-right align-top text-slate-800 font-bold">
                                    {px.qty || '--'}
                                </td>
                            </tr>
                        ))}
                        {prescriptions.length === 0 && (
                            <tr>
                                <td colSpan={4} className="py-4 text-center text-slate-400 italic">No medicines prescribed.</td>
                            </tr>
                        )}
                    </tbody>
                </table>
            </div>

            {/* ADMISSION REQ BANNER */}
            {admitPatient && (
                <div className="mb-8 p-4 border-2 border-red-800 bg-red-50 text-red-900 rounded-lg text-center print:border-red-800 print:text-red-900">
                    <h3 className="text-xl font-bold uppercase mb-1">⚠️ Admission Recommended</h3>
                    <p className="font-bold">Doctor has advised immediate hospital admission.</p>
                </div>
            )}

            {/* SPECIAL INSTRUCTIONS */}
            <div className="mb-8">
                <h3 className="font-bold uppercase text-sm border-b border-slate-400 mb-2 pb-1">Advice / Instructions</h3>
                <div className="whitespace-pre-wrap text-sm leading-relaxed pl-2 min-h-[40px] break-words max-w-full">
                    {instructions ? (
                        instructions
                    ) : (
                        <div className="text-slate-400 italic text-xs">No specific instructions.</div>
                    )}
                </div>
            </div>

            {/* FOLLOW UP */}
            {followUp && followUp !== 'None' && (
                <div className="mb-12 p-3 border border-slate-800 inline-block">
                    <p className="font-bold text-sm uppercase">Follow Up</p>
                    <p className="text-base">Review after {followUp}.</p>
                </div>
            )}

            {/* FOOTER */}
            <div className="mt-auto pt-12 flex justify-between items-end">
                <div className="text-xs text-slate-500 max-w-sm">
                    <p className="italic">"Health is Wealth"</p>
                    <p className="mt-2">Disclaimer: This prescription is valid for 30 days unless specified otherwise. Not valid for medico-legal purposes without physical seal.</p>
                </div>
                <div className="text-center">
                    {/* Placeholder Signature */}
                    <div className="h-12 w-32 mb-2 mx-auto ">
                        <span className="font-cursive text-2xl text-slate-400">Varma..</span>
                    </div>
                    <p className="font-bold border-t border-slate-800 pt-1 w-48">{doctor.name}</p>
                    <p className="text-xs">Signature</p>
                </div>
            </div>

            {/* Timestamp Footer */}
            <div className="border-t mt-4 pt-2 flex justify-between text-[10px] text-slate-400">
                <span>Printed on: {new Date().toLocaleString()}</span>
                <span>Powered by ORBIT OS</span>
            </div>
        </div>
    );
};
