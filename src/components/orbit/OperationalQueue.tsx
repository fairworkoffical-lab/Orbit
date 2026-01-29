'use client';

import React, { useState } from 'react';

export interface QueueItem {
    token: string;
    patientName: string;
    doctorName: string;
    waitTime: number;
    isEmergency?: boolean;
    isFollowUp?: boolean;
    age?: number;
    gender?: string;
    visitReason?: string;
    status?: 'waiting' | 'in-progress' | 'completed' | 'cancelled' | 'sent-to-ipd';
    mobileNumber?: string;
    visitDetails?: any;
    visitFee?: number;
    checkInTime?: number;
}

// Queue starts empty - will be populated by real data
const mockQueue: QueueItem[] = [];

function getRiskIndicator(waitTime: number, isEmergency?: boolean): { icon: string; color: string; bg: string } {
    if (isEmergency) return { icon: '🚨', color: 'text-red-700', bg: 'bg-red-100' };
    if (waitTime > 30) return { icon: '🔴', color: 'text-red-600', bg: 'bg-red-50' };
    if (waitTime > 15) return { icon: '🟡', color: 'text-amber-600', bg: 'bg-amber-50' };
    return { icon: '🟢', color: 'text-emerald-600', bg: 'bg-white' };
}

interface OperationalQueueProps {
    queue?: QueueItem[];
}

export function OperationalQueue({ queue = mockQueue }: OperationalQueueProps) {

    // Sort: emergencies first, then by wait time descending
    const sortedQueue = [...queue].sort((a, b) => {
        if (a.isEmergency && !b.isEmergency) return -1;
        if (!a.isEmergency && b.isEmergency) return 1;
        return b.waitTime - a.waitTime;
    });

    const totalWaiting = queue.length;
    const avgWait = queue.length > 0 ? Math.round(queue.reduce((sum, q) => sum + q.waitTime, 0) / queue.length) : 0;
    const delayRisk = queue.filter(q => q.waitTime > 30).length;

    return (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-sm h-full flex flex-col">
            {/* Header */}
            <div className="p-4 border-b border-slate-100">
                <div className="flex items-center justify-between mb-3">
                    <h2 className="text-sm font-bold text-slate-700 uppercase tracking-wider">
                        Operational Queue
                    </h2>
                    <span className="text-xs bg-slate-100 text-slate-600 px-2 py-1 rounded-full font-medium">
                        {totalWaiting} Pending
                    </span>
                </div>

                {/* Summary Stats - only show if queue has items */}
                {totalWaiting > 0 && (
                    <div className="flex gap-4 text-xs">
                        <div className="flex items-center gap-1">
                            <span className="text-slate-500">Avg Wait:</span>
                            <span className={`font-bold ${avgWait > 25 ? 'text-red-600' : 'text-slate-700'}`}>
                                {avgWait}m
                            </span>
                        </div>
                        {delayRisk > 0 && (
                            <div className="flex items-center gap-1 text-red-600">
                                <span>⚠️</span>
                                <span className="font-bold">{delayRisk} at risk</span>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Queue List */}
            <div className="flex-1 overflow-y-auto p-2">
                {sortedQueue.length === 0 ? (
                    /* Empty State */
                    <div className="flex flex-col items-center justify-center h-full py-12 text-center">
                        <div className="w-16 h-16 bg-slate-100 rounded-full flex items-center justify-center mb-4">
                            <span className="text-3xl">📋</span>
                        </div>
                        <p className="text-sm font-medium text-slate-600 mb-1">No patients in queue</p>
                        <p className="text-xs text-slate-400">Patients will appear here after registration</p>
                    </div>
                ) : (
                    <div className="space-y-1">
                        {sortedQueue.map((item) => {
                            const risk = getRiskIndicator(item.waitTime, item.isEmergency);
                            return (
                                <div
                                    key={item.token}
                                    className={`
                                        flex items-center gap-2 p-2 rounded-lg text-xs transition-colors
                                        ${risk.bg}
                                        ${item.isEmergency ? 'border-l-4 border-red-500 animate-pulse' : ''}
                                    `}
                                >
                                    {/* Token */}
                                    <span className={`font-mono font-bold w-16 ${item.isEmergency ? 'text-red-700' : 'text-slate-700'}`}>
                                        {item.token}
                                    </span>

                                    {/* Name */}
                                    <span className="flex-1 font-medium text-slate-700 truncate">
                                        {item.patientName}
                                    </span>

                                    {/* Doctor */}
                                    <span className="text-slate-500 w-20 truncate">
                                        {item.doctorName}
                                    </span>

                                    {/* Wait Time */}
                                    <span className={`font-bold w-10 text-right ${risk.color}`}>
                                        {item.waitTime}m
                                    </span>

                                    {/* Risk Indicator */}
                                    <span className="w-6 text-center">{risk.icon}</span>

                                    {/* Badges */}
                                    <div className="w-16 flex justify-end">
                                        {item.isFollowUp && (
                                            <span className="bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded text-[10px] font-medium">
                                                🔁 F/U
                                            </span>
                                        )}
                                        {item.isEmergency && (
                                            <span className="bg-red-600 text-white px-1.5 py-0.5 rounded text-[10px] font-bold">
                                                EMR
                                            </span>
                                        )}
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Footer Actions */}
            <div className="p-3 border-t border-slate-100 bg-slate-50/50">
                <p className="text-[10px] text-slate-400 text-center">
                    Queue refreshes automatically
                </p>
            </div>
        </div>
    );
}
