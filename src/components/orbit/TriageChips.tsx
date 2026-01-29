'use client';

import React from 'react';

type TriageChip = 'FEVER' | 'PAIN' | 'INJURY' | 'FOLLOWUP' | 'REPORT' | 'GENERAL' | 'OTHER';

interface TriageChipsProps {
    selected: TriageChip;
    onSelect: (chip: TriageChip) => void;
    otherDescription?: string;
    onOtherDescriptionChange?: (description: string) => void;
}

const chips: { id: TriageChip; icon: string; label: string; description: string; color: string }[] = [
    { id: 'FEVER', icon: '🔥', label: 'Fever', description: 'Potentially contagious', color: 'bg-red-50 border-red-300 text-red-700 hover:bg-red-100' },
    { id: 'PAIN', icon: '💢', label: 'Pain', description: 'Priority attention', color: 'bg-amber-50 border-amber-300 text-amber-700 hover:bg-amber-100' },
    { id: 'INJURY', icon: '🩹', label: 'Injury', description: 'Visible trauma', color: 'bg-orange-50 border-orange-300 text-orange-700 hover:bg-orange-100' },
    { id: 'FOLLOWUP', icon: '🔁', label: 'Follow-up', description: 'Same doctor preferred', color: 'bg-blue-50 border-blue-300 text-blue-700 hover:bg-blue-100' },
    { id: 'REPORT', icon: '📋', label: 'Report Check', description: 'Quick consult', color: 'bg-purple-50 border-purple-300 text-purple-700 hover:bg-purple-100' },
    { id: 'GENERAL', icon: '📦', label: 'General', description: 'Standard visit', color: 'bg-slate-50 border-slate-300 text-slate-700 hover:bg-slate-100' },
    { id: 'OTHER', icon: '✏️', label: 'Other', description: 'Describe complaint below', color: 'bg-indigo-50 border-indigo-300 text-indigo-700 hover:bg-indigo-100' },
];

export function TriageChips({ selected, onSelect, otherDescription, onOtherDescriptionChange }: TriageChipsProps) {
    return (
        <div className="space-y-3">
            <label className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                Complaint Type <span className="text-red-500">*</span>
            </label>
            <div className="flex flex-wrap gap-2">
                {chips.map((chip) => {
                    const isSelected = selected === chip.id;
                    return (
                        <button
                            key={chip.id}
                            onClick={() => onSelect(chip.id)}
                            className={`
                                flex items-center gap-2 px-3 py-2 rounded-full border-2 transition-all duration-200
                                ${isSelected
                                    ? `${chip.color} ring-2 ring-offset-1 ring-blue-500 font-bold scale-105`
                                    : `bg-white border-slate-200 text-slate-600 hover:border-slate-300`
                                }
                            `}
                        >
                            <span className="text-lg">{chip.icon}</span>
                            <span className="text-sm font-medium">{chip.label}</span>
                        </button>
                    );
                })}
            </div>

            {/* Other complaint description input */}
            {selected === 'OTHER' && (
                <div className="mt-3">
                    <input
                        type="text"
                        placeholder="Describe the complaint..."
                        value={otherDescription || ''}
                        onChange={(e) => onOtherDescriptionChange?.(e.target.value)}
                        className="w-full px-4 py-3 border-2 border-indigo-200 rounded-xl focus:border-indigo-500 focus:outline-none bg-indigo-50/50 placeholder-indigo-300"
                    />
                </div>
            )}

            {/* Selected chip description */}
            {selected !== 'OTHER' && (
                <p className="text-xs text-slate-500 mt-1">
                    {chips.find(c => c.id === selected)?.description}
                </p>
            )}
        </div>
    );
}

export type { TriageChip };
