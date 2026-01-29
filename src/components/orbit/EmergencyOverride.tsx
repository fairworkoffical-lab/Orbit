'use client';

import React, { useState } from 'react';

interface EmergencyOverrideProps {
    onEmergencyConfirm: (reason: string) => void;
}

const emergencyReasons = [
    'Chest Pain',
    'Breathing Difficulty',
    'Severe Bleeding',
    'Unconscious',
    'Seizure',
    'Other (specify)',
];

export function EmergencyOverride({ onEmergencyConfirm }: EmergencyOverrideProps) {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedReason, setSelectedReason] = useState('');
    const [otherReason, setOtherReason] = useState('');
    const [isHolding, setIsHolding] = useState(false);
    const [holdProgress, setHoldProgress] = useState(0);

    const handleHoldStart = () => {
        if (!selectedReason) return;

        setIsHolding(true);
        let progress = 0;
        const interval = setInterval(() => {
            progress += 5;
            setHoldProgress(progress);

            if (progress >= 100) {
                clearInterval(interval);
                const reason = selectedReason === 'Other (specify)' ? otherReason : selectedReason;
                onEmergencyConfirm(reason);
                setIsModalOpen(false);
                setIsHolding(false);
                setHoldProgress(0);
                setSelectedReason('');
                setOtherReason('');
            }
        }, 100); // 2 seconds total (20 intervals * 100ms)

        // Store interval ID for cleanup
        (window as any).__emergencyHoldInterval = interval;
    };

    const handleHoldEnd = () => {
        setIsHolding(false);
        setHoldProgress(0);
        if ((window as any).__emergencyHoldInterval) {
            clearInterval((window as any).__emergencyHoldInterval);
        }
    };

    return (
        <>
            {/* Emergency Button */}
            <button
                onClick={() => setIsModalOpen(true)}
                className="w-full py-4 rounded-xl border-2 border-red-300 bg-red-50 text-red-700 font-bold text-sm uppercase tracking-wider transition-all duration-200 hover:bg-red-100 hover:border-red-400 hover:shadow-lg hover:shadow-red-100 flex items-center justify-center gap-2"
            >
                <span className="text-xl">🚨</span>
                Emergency Override
            </button>

            {/* Emergency Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md mx-4 overflow-hidden">
                        {/* Header */}
                        <div className="bg-red-600 text-white p-4">
                            <div className="flex items-center gap-3">
                                <span className="text-3xl animate-pulse">🚨</span>
                                <div>
                                    <h2 className="font-bold text-lg">EMERGENCY REGISTRATION</h2>
                                    <p className="text-red-100 text-sm">This will bypass the queue immediately</p>
                                </div>
                            </div>
                        </div>

                        {/* Body */}
                        <div className="p-6 space-y-4">
                            <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                                <strong>⚠️ Warning:</strong> All available doctors will be notified. This action is logged and audited.
                            </div>

                            {/* Reason Selection */}
                            <div>
                                <label className="text-xs font-bold text-slate-500 uppercase tracking-wider block mb-2">
                                    Emergency Reason <span className="text-red-500">*</span>
                                </label>
                                <div className="grid grid-cols-2 gap-2">
                                    {emergencyReasons.map((reason) => (
                                        <button
                                            key={reason}
                                            onClick={() => setSelectedReason(reason)}
                                            className={`
                                                p-3 rounded-lg border-2 text-sm font-medium text-left transition-all
                                                ${selectedReason === reason
                                                    ? 'border-red-500 bg-red-50 text-red-700'
                                                    : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                                                }
                                            `}
                                        >
                                            {reason}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Other reason input */}
                            {selectedReason === 'Other (specify)' && (
                                <input
                                    type="text"
                                    value={otherReason}
                                    onChange={(e) => setOtherReason(e.target.value)}
                                    placeholder="Describe the emergency..."
                                    className="w-full px-4 py-3 border-2 border-slate-200 rounded-lg focus:border-red-500 focus:outline-none"
                                />
                            )}
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 space-y-3">
                            {/* Hold to Confirm Button */}
                            <button
                                onMouseDown={handleHoldStart}
                                onMouseUp={handleHoldEnd}
                                onMouseLeave={handleHoldEnd}
                                onTouchStart={handleHoldStart}
                                onTouchEnd={handleHoldEnd}
                                disabled={!selectedReason || (selectedReason === 'Other (specify)' && !otherReason)}
                                className={`
                                    relative w-full py-4 rounded-xl font-bold text-sm uppercase tracking-wider transition-all overflow-hidden
                                    ${selectedReason && (selectedReason !== 'Other (specify)' || otherReason)
                                        ? 'bg-red-600 text-white hover:bg-red-700 cursor-pointer'
                                        : 'bg-slate-300 text-slate-500 cursor-not-allowed'
                                    }
                                `}
                            >
                                {/* Progress bar */}
                                {isHolding && (
                                    <div
                                        className="absolute inset-0 bg-red-800 transition-all duration-100"
                                        style={{ width: `${holdProgress}%` }}
                                    />
                                )}
                                <span className="relative z-10">
                                    {isHolding ? 'HOLD TO CONFIRM...' : '🔒 HOLD TO CONFIRM EMERGENCY'}
                                </span>
                            </button>

                            {/* Cancel */}
                            <button
                                onClick={() => {
                                    setIsModalOpen(false);
                                    setSelectedReason('');
                                    setOtherReason('');
                                }}
                                className="w-full py-3 text-slate-500 font-medium text-sm hover:text-slate-700"
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
