import { useState, useEffect } from 'react';
import { QueueItem } from '@/components/orbit/OperationalQueue';
import { Doctor } from '@/components/orbit/DoctorStatusStrip';
import { Bed, AdmissionRequest } from '@/lib/ipd-store';

export interface AdminMetrics {
    opd: {
        totalVisits: number;
        activeQueue: number;
        completed: number;
        avgWaitTime: number;
        emergencyCount: number;
        doctorLoad: { name: string; queue: number; status: string }[];
        visitsByHour: { hour: string; count: number }[];
        doctorStats: { available: number; busy: number; unavailable: number };
    };
    ipd: {
        totalBeds: number;
        occupiedBeds: number;
        admissionRequests: number;
        pendingRequests: number;
        occupancyRate: number;
    };
    pharmacy: {
        revenue: number;
    };
    chaosScore: number; // 0-100
    alerts: string[];
}

export const useAdminData = (selectedDate: Date = new Date()) => {
    const [metrics, setMetrics] = useState<AdminMetrics | null>(null);

    useEffect(() => {
        const loadData = () => {
            // 1. OPD DATA
            const queueRaw = localStorage.getItem('orbit_queue');
            const doctorsRaw = localStorage.getItem('orbit_doctors');
            const queue: QueueItem[] = queueRaw ? JSON.parse(queueRaw) : [];
            const doctors: Doctor[] = doctorsRaw ? JSON.parse(doctorsRaw) : [];

            // 2. IPD DATA
            const bedsRaw = localStorage.getItem('orbit_ipd_beds');
            const requestsRaw = localStorage.getItem('orbit_admission_requests');
            const beds: Bed[] = bedsRaw ? JSON.parse(bedsRaw) : [];
            const requests: AdmissionRequest[] = requestsRaw ? JSON.parse(requestsRaw) : [];

            // FILTER BY DATE
            const isToday = selectedDate.toDateString() === new Date().toDateString();

            // Helpful helper to check if a timestamp is on the selected date
            const isSameDay = (timestamp?: number) => {
                if (!timestamp) return false;
                const date = new Date(timestamp);
                return date.toDateString() === selectedDate.toDateString();
            };

            const dailyQueue = queue.filter(q => isSameDay(q.checkInTime));
            const dailyRequests = requests.filter(r => isSameDay(r.timestamp));

            // 3. CALCULATIONS
            const activeQueue = isToday ? queue.filter(q => q.status === 'waiting' || q.status === 'in-progress') : [];
            const completed = dailyQueue.filter(q => q.status === 'completed');
            const emergencies = dailyQueue.filter(q => q.isEmergency);

            const totalWaitTime = dailyQueue.reduce((acc, curr) => acc + (curr.waitTime || 0), 0);
            const avgWaitTime = dailyQueue.length > 0 ? Math.round(totalWaitTime / dailyQueue.length) : 0;

            const occupiedBeds = beds.filter(b => b.status === 'OCCUPIED' || b.status === 'CLEANING');
            const occupancyRate = beds.length > 0 ? Math.round((occupiedBeds.length / beds.length) * 100) : 0;

            const pendingRequests = requests.filter(r => r.status === 'PENDING');

            // 4. ADVANCED ANALYTICS: Visits Per Hour
            const visitsByHour = Array(12).fill(0).map((_, i) => ({ hour: `${8 + i}:00`, count: 0 })); // 8 AM to 8 PM
            dailyQueue.forEach(q => {
                if (q.checkInTime) {
                    const hour = new Date(q.checkInTime).getHours();
                    const index = hour - 8;
                    if (index >= 0 && index < 12) {
                        visitsByHour[index].count++;
                    }
                }
            });

            // 4b. Doctor Stats
            const doctorStats = {
                available: doctors.filter(d => d.status === 'AVAILABLE').length,
                busy: doctors.filter(d => d.status === 'BUSY').length,
                unavailable: doctors.filter(d => d.status === 'UNAVAILABLE').length,
            };

            // 5. PHARMACY REVENUE
            const pharmacyRaw = localStorage.getItem('orbit_pharmacy_orders');
            const pharmacyOrders = pharmacyRaw ? JSON.parse(pharmacyRaw) : [];
            const pharmacyRevenue = pharmacyOrders
                .filter((o: any) => o.status === 'COMPLETED' && isSameDay(o.timestamp))
                .reduce((sum: number, o: any) => sum + (o.paidAmount || 0), 0);

            // 6. ALERTS & CHAOS SCORE
            const alerts: string[] = [];
            let chaosScore = 30; // Base baseline

            // Alert: High Wait Time
            if (avgWaitTime > 45) {
                alerts.push(`Avg Wait Time Critical: ${avgWaitTime} mins`);
                chaosScore += 20;
            }

            // Alert: Doctor Bottleneck (Queue > 8)
            const overloadedDocs = doctors.filter(d => d.queueCount > 8);
            if (overloadedDocs.length > 0 && isToday) {
                alerts.push(`${overloadedDocs.length} Doctors Overloaded`);
                chaosScore += 15 * overloadedDocs.length;
            }

            // Alert: IPD Capacity
            if (occupancyRate > 90) {
                alerts.push(`Critical Bed Shortage: ${occupancyRate}% Full`);
                chaosScore += 25;
            }

            // Alert: Pending Admissions
            if (pendingRequests.length > 3 && isToday) {
                alerts.push(`${pendingRequests.length} Patients waiting for Bed`);
                chaosScore += 10;
            }

            // EMERGENCY SPIKE
            if (emergencies.some(e => (Date.now() - (e.checkInTime || 0)) < 1000 * 60 * 60) && isToday) {
                // Recent emergency in last hour
                chaosScore += 10;
            }

            setMetrics({
                opd: {
                    totalVisits: dailyQueue.length,
                    activeQueue: activeQueue.length,
                    completed: completed.length,
                    avgWaitTime,
                    emergencyCount: emergencies.length,
                    doctorLoad: doctors.map(d => ({ name: d.name, queue: d.queueCount, status: d.status })),
                    visitsByHour,
                    doctorStats
                },
                ipd: {
                    totalBeds: beds.length,
                    occupiedBeds: occupiedBeds.length,
                    admissionRequests: dailyRequests.length,
                    pendingRequests: pendingRequests.length,
                    occupancyRate
                },
                pharmacy: {
                    revenue: pharmacyRevenue
                },
                chaosScore: Math.min(100, chaosScore),
                alerts
            });
        };

        loadData();
        const interval = setInterval(loadData, 2000); // 2s Polling
        return () => clearInterval(interval);
    }, [selectedDate.toDateString()]); // Fix: Use primitive string to prevent object reference loop

    return metrics;
};
