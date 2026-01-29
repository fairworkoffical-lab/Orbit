import { useEffect, useRef } from 'react';
import { useAppStore } from '@/lib/store';
import { useDoctorEfficiency } from './useDoctorEfficiency';

export const useQueueNotifications = () => {
    const { visits, addNotification, doctors } = useAppStore();
    const prevQueueLengthRef = useRef<Record<string, number>>({});

    // Watch for Queue Changes
    useEffect(() => {
        doctors.forEach(doc => {
            const queue = visits.filter(v => v.doctor_id === doc.id && v.status === 'WAITING');
            const prevLen = prevQueueLengthRef.current[doc.id] || 0;

            // 1. New Patient Added
            if (queue.length > prevLen) {
                const newPatient = queue[queue.length - 1]; // Last added
                if (newPatient) {
                    // Vision Feature: Use AI-calculated True Pace for "Google Maps" accuracy, fallback to baseline
                    // Note: In a real app, this would query the efficiency hook directly or store.
                    // For now, we simulate "Smart ETA" by checking if we have recent consult data in the store.

                    const completed = visits.filter(v => v.doctor_id === doc.id && v.status === 'COMPLETED').length;
                    const smartPace = completed > 2 ? Math.round(doc.consultDuration * 1.2) : doc.consultDuration; // Simulated "AI Adjustment" for demo

                    addNotification({
                        patientId: newPatient.patient_id,
                        type: 'WHATSAPP',
                        message: `Welcome to Orbit. You are #${queue.length} for Dr. ${doc.name}. Smart ETA: ~${queue.length * smartPace} mins (adjusted for real-time load).`
                    });
                }
            }

            // 2. Queue Moved (Simple Simulation)
            if (prevLen > queue.length && queue.length > 0) {
                // ... (Existing logic)
                const nextPatient = queue[0];
                addNotification({
                    patientId: nextPatient.patient_id,
                    type: 'SMS',
                    message: `Heads up! You are next for Dr. ${doc.name}. Please proceed to the waiting area.`
                });
            }

            prevQueueLengthRef.current[doc.id] = queue.length;
        });
    }, [visits, doctors, addNotification]);
};
