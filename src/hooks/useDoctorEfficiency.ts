import { useMemo } from 'react';
import { useAppStore } from '@/lib/store';
import { Doctor } from '@/lib/types';
import { differenceInMinutes, parseISO, addMinutes, isAfter, format } from 'date-fns';

export interface EfficiencyMetrics {
    doctorId: string;
    truePace: number; // Actual avg minutes per patient
    efficiencyScore: number; // 100 = on time, <100 = slow, >100 = fast
    expectedFinishTime: Date;
    isOverloaded: boolean; // If finish time > availability
    overflowCount: number; // How many patients need to move to tomorrow
}

export const useDoctorEfficiency = (doctorId: string) => {
    const { visits, doctors } = useAppStore();
    const doctor = doctors.find(d => d.id === doctorId);

    const metrics: EfficiencyMetrics | null = useMemo(() => {
        if (!doctor) return null;

        // 1. Calculate TRUE PACE based on past data
        const completedVisits = visits.filter(v =>
            v.doctor_id === doctorId &&
            v.status === 'COMPLETED' &&
            v.consult_start_time &&
            v.consult_end_time
        );

        let totalDuration = 0;
        let count = 0;
        completedVisits.forEach(v => {
            const start = parseISO(v.consult_start_time!);
            const end = parseISO(v.consult_end_time!);
            const duration = differenceInMinutes(end, start);
            if (duration > 0 && duration < 60) { // Filter outliers
                totalDuration += duration;
                count++;
            }
        });

        const truePace = count > 2 ? Math.round(totalDuration / count) : doctor.consultDuration; // Fallback to baseline
        const efficiencyScore = Math.round((doctor.consultDuration / truePace) * 100);

        // 2. Predict Future (Constraint Check)
        const pendingQueue = visits.filter(v =>
            v.doctor_id === doctorId &&
            ['WAITING', 'IN_CONSULT'].includes(v.status)
        );

        const now = new Date();
        const minutesRemaining = pendingQueue.length * truePace;
        const expectedFinishTime = addMinutes(now, minutesRemaining);

        // 3. Check Constraint (Availability)
        let isOverloaded = false;
        let overflowCount = 0;

        if (doctor.availability) {
            // Parse "17:00" to today's date
            const [endHour, endMinute] = doctor.availability.end.split(':').map(Number);
            const endTime = new Date();
            endTime.setHours(endHour, endMinute, 0);

            if (isAfter(expectedFinishTime, endTime)) {
                isOverloaded = true;
                const minutesOver = differenceInMinutes(expectedFinishTime, endTime);
                overflowCount = Math.ceil(minutesOver / truePace);
            }
        }

        return {
            doctorId,
            truePace,
            efficiencyScore,
            expectedFinishTime,
            isOverloaded,
            overflowCount
        };

    }, [visits, doctorId, doctor]);

    return metrics;
};
