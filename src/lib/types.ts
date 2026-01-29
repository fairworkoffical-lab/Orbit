export type VisitStatus =
    | 'BOOKED'
    | 'ARRIVED'
    | 'WAITING'
    | 'IN_CONSULT'
    | 'COMPLETED'
    | 'SKIPPED'
    | 'NO_SHOW'
    | 'DROPPED_OUT';

export type VisitType = 'WALK_IN' | 'APPOINTMENT' | 'EMERGENCY' | 'FOLLOW_UP';

export type TriageCategory = 'GREEN' | 'YELLOW' | 'RED';

export interface Visit {
    id: string; // UUID
    hospital_id: string;
    patient_id: string;
    doctor_id: string;

    status: VisitStatus;
    type: VisitType;
    triage_category?: TriageCategory;

    // Scoring & Queue
    priority_score: number;
    check_in_time: string; // ISO Timestamp

    // Identification
    token_display_id: string; // e.g. "OPD-101"
    contact_number?: string;
    patient_age?: number;
    patient_gender?: 'M' | 'F' | 'O';
    triage_reason?: string[];

    // Dispositions
    diagnosis?: string;
    consult_start_time?: string;
    consult_end_time?: string;

    // Overrides
    override_flag?: boolean;
    override_flag?: boolean;
    override_weight?: number;
    visitFee?: number;
}

export interface Patient {
    id: string;
    name: string;
    phone: string;
    age: number;
    gender: 'M' | 'F' | 'O';
    history_summary?: string;
}

export type DoctorStatusType = 'READY' | 'BUSY' | 'FULL' | 'BREAK' | 'LATE' | 'UNAVAILABLE' | 'AVAILABLE'; // Added AVAILABLE for store compat

export interface Doctor {
    id: string;
    name: string;
    specialization: string; // Formerly specialty
    categoryId: string; // System ID for filtering
    status: DoctorStatusType;
    queueCount: number;
    estimatedWait: number; // in minutes
    consultDuration: number; // Avg time in minutes per patient

    // Advanced Props
    isRecommended?: boolean;
    breakReturnTime?: number;
    statusReason?: string;
    availability?: {
        start: string;
        end: string;
    };

    // Legacy support (optional)
    avg_consult_duration_min?: number;
}

export interface AuditLog {
    id: string;
    timestamp: number;
    actor: 'ADMIN' | 'DOCTOR' | 'RECEPTION' | 'SYSTEM';
    action: string; // e.g., "DOC_ADDED", "BILL_FINALIZED"
    details: string;
    severity: 'INFO' | 'WARN' | 'CRITICAL';
}

export interface AppUser {
    id: string;
    name: string;
    role: 'RECEPTION' | 'PHARMACY' | 'ADMIN' | 'SUPER_ADMIN' | 'NURSE';
    accessLevel: 'READ' | 'WRITE' | 'FULL';
    assignedBranchId?: string;
    status: 'ACTIVE' | 'SUSPENDED';
    lastLogin?: number;
}
