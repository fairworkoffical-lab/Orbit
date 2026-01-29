import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { Visit, Doctor, Patient } from './types';
import { calculatePriorityScore, sortQueue } from './queue-engine';

interface AppState {
    visits: Visit[];
    doctors: Doctor[];
    patients: Patient[];
    // Notifications
    notifications: { id: string; patientId: string; message: string; timestamp: number; type: 'SMS' | 'WHATSAPP' }[];
    addNotification: (n: { patientId: string; message: string; type: 'SMS' | 'WHATSAPP' }) => void;

    // Auth
    currentUser: { role: 'DOCTOR' | 'RECEPTION' | 'ADMIN'; id: string } | null;
    login: (role: 'DOCTOR' | 'RECEPTION' | 'ADMIN', id: string) => void;
    logout: () => void;

    // RBAC
    users: any[]; // Using any for now to match implementation quickly, ideally typed
    addUser: (user: any) => void;
    removeUser: (id: string) => void;
    updateUserStatus: (id: string, status: string) => void;

    // Super Admin & Logs
    auditLogs: any[];
    logAction: (actor: string, action: string, details: string, severity?: string) => void;
    addDoctor: (doc: Doctor) => void;
    updateDoctor: (id: string, updates: Partial<Doctor>) => void;
    removeDoctor: (id: string) => void;
}

export const useAppStore = create<AppState>()(
    persist(
        (set, get) => ({
            visits: [],
            // Initial doctors with availability for AI constraints
            doctors: [
                {
                    id: 'doc-1',
                    name: 'Dr. Sarah Smith',
                    specialization: 'General Medicine',
                    categoryId: 'general',
                    status: 'READY',
                    queueCount: 0,
                    estimatedWait: 0,
                    consultDuration: 12, // Baseline
                    availability: { start: '09:00', end: '17:00' }
                },
                {
                    id: 'doc-2',
                    name: 'Dr. John Doe',
                    specialization: 'Pediatrics',
                    categoryId: 'pediatrics',
                    status: 'READY',
                    queueCount: 0,
                    estimatedWait: 0,
                    consultDuration: 15, // Baseline
                    availability: { start: '10:00', end: '16:00' }
                },
            ],
            patients: [],
            currentUser: null,
            auditLogs: [],
            notifications: [],
            users: [], // RBAC

            addVisit: (visit: Visit) => set((state) => {
                const scoredVisit = {
                    ...visit,
                    priority_score: calculatePriorityScore(visit)
                };
                const newVisits = sortQueue([...state.visits, scoredVisit]);
                return { visits: newVisits };
            }),

            updateVisitStatus: (id: string, status: import('./types').VisitStatus) => set((state) => {
                const now = new Date().toISOString();
                const newVisits = state.visits.map(v => {
                    if (v.id !== id) return v;

                    // TIMESTAMP LOGIC
                    const updates: Partial<Visit> = { status };
                    if (status === 'IN_CONSULT') updates.consult_start_time = now;
                    if (status === 'COMPLETED') updates.consult_end_time = now;

                    return { ...v, ...updates };
                });
                return { visits: sortQueue(newVisits) };
            }),

            findPatientByPhone: (phone: string) => {
                return get().visits.find(v => v.contact_number === phone && v.status !== 'COMPLETED' && v.status !== 'DROPPED_OUT');
            },

            addNotification: (n) => set(state => ({
                notifications: [{ ...n, id: `notif-${Date.now()}`, timestamp: Date.now() }, ...state.notifications].slice(0, 50)
            })),

            login: (role, id) => set({ currentUser: { role, id } }),
            logout: () => set({ currentUser: null }),

            // --- SUPER ADMIN ACTIONS ---
            addDoctor: (doc) => set((state) => ({
                doctors: [...state.doctors, doc],
                auditLogs: [{
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    actor: 'ADMIN',
                    action: 'DOC_ADDED',
                    details: `Added Dr. ${doc.name}`,
                    severity: 'WARN'
                }, ...state.auditLogs]
            })),

            updateDoctor: (id, updates) => set((state) => ({
                doctors: state.doctors.map(d => d.id === id ? { ...d, ...updates } : d)
            })),

            removeDoctor: (id) => set((state) => ({
                doctors: state.doctors.filter(d => d.id !== id),
                auditLogs: [{
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    actor: 'ADMIN',
                    action: 'DOC_REMOVED',
                    details: `Removed Doctor ID: ${id}`,
                    severity: 'CRITICAL'
                }, ...state.auditLogs]
            })),

            // --- RBAC IMPLEMENTATION ---
            users: [], // Initial empty list

            addUser: (user) => set((state) => ({
                users: [...state.users, user],
                auditLogs: [{
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    actor: 'ADMIN',
                    action: 'USER_ADDED',
                    details: `Created User ${user.name} (${user.role})`,
                    severity: 'WARN'
                }, ...state.auditLogs]
            })),

            removeUser: (id) => set((state) => ({
                users: state.users.filter(u => u.id !== id),
                auditLogs: [{
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    actor: 'ADMIN',
                    action: 'USER_REMOVED',
                    details: `Removed User ID: ${id}`,
                    severity: 'CRITICAL'
                }, ...state.auditLogs]
            })),

            updateUserStatus: (id, status) => set((state) => ({
                users: state.users.map(u => u.id === id ? { ...u, status } : u),
                auditLogs: [{
                    id: Date.now().toString(),
                    timestamp: Date.now(),
                    actor: 'ADMIN',
                    action: 'USER_STATUS_CHANGE',
                    details: `User ${id} set to ${status}`,
                    severity: 'WARN'
                }, ...state.auditLogs]
            })),

            logAction: (actor, action, details, severity = 'INFO') => set((state) => ({
                auditLogs: [{
                    id: `log-${Date.now()}-${Math.random()}`,
                    timestamp: Date.now(),
                    actor,
                    action,
                    details,
                    severity
                }, ...state.auditLogs].slice(0, 100) // Keep last 100
            }))
        }),
        {
            name: 'orbit-storage', // Perist to LocalStorage for Phase 1 Crash Recovery
        }
    )
);
