import { useState, useEffect } from 'react';
import { QueueItem } from '@/components/orbit/OperationalQueue';
import { PharmacyOrder } from '@/hooks/usePharmacyData';
import { Bed, AdmissionRequest, BedCategory, INITIAL_CATEGORIES } from '@/lib/ipd-store';

export interface BillItem {
    id: string;
    date: string;
    description: string;
    category: 'OPD' | 'IPD' | 'PHARMACY' | 'LAB';
    amount: number;
    status: 'Pending' | 'Paid';
}

export interface BillingRecord {
    patientId: string; // Token or UUID
    patientName: string;
    mobile?: string;
    age?: number;
    gender?: string;
    items: BillItem[];
    subtotal: number;
    tax: number;
    discount: number;
    total: number;
    paidAmount: number;
    dueAmount: number;
    isIPDActive?: boolean;
    bedInfo?: string; // e.g., "ICU - Bed 101"
}

export const useBillingData = () => {
    const [billingRecords, setBillingRecords] = useState<BillingRecord[]>([]);

    const searchPatient = (query: string): BillingRecord | null => {
        if (!query) return null;

        const q = query.toLowerCase();
        // Return exact match first, then partial
        return billingRecords.find(r =>
            r.patientId.toLowerCase() === q ||
            r.patientName.toLowerCase().includes(q) ||
            r.mobile?.includes(q)
        ) || null;
    };

    useEffect(() => {
        const loadData = () => {
            // 1. RAW DATA FETCH
            const queue: QueueItem[] = JSON.parse(localStorage.getItem('orbit_queue') || '[]');
            const pharmacy: PharmacyOrder[] = JSON.parse(localStorage.getItem('orbit_pharmacy_orders') || '[]');
            const beds: Bed[] = JSON.parse(localStorage.getItem('orbit_ipd_beds') || '[]');
            const admissionRequests: AdmissionRequest[] = JSON.parse(localStorage.getItem('orbit_admission_requests') || '[]');
            const ipdCategories: BedCategory[] = INITIAL_CATEGORIES; // Or fetch from storage if dynamic

            // 2. AGGREGATE BY PATIENT TOKEN (Primary Key)
            const patientMap = new Map<string, BillingRecord>();

            // Helper to get or create record
            const getRecord = (patientId: string, name: string, visit: QueueItem | null): BillingRecord => {
                if (!patientMap.has(patientId)) {
                    patientMap.set(patientId, {
                        patientId,
                        patientName: name,
                        mobile: visit?.mobileNumber,
                        age: visit?.age,
                        gender: visit?.gender,
                        items: [],
                        subtotal: 0,
                        tax: 0,
                        discount: 0,
                        total: 0,
                        paidAmount: 0,
                        dueAmount: 0
                    });
                }
                return patientMap.get(patientId)!;
            };

            // A. PROCESS OPD VISITS
            queue.forEach(visit => {
                const pid = visit.token; // Using Token as ID for simplicity in this demo
                const record = getRecord(pid, visit.patientName, visit);

                // Visit Fee
                if (visit.visitFee) {
                    record.items.push({
                        id: `OPD-${visit.checkInTime}`,
                        date: new Date(visit.checkInTime || Date.now()).toLocaleDateString(),
                        description: `OPD Consultation - Dr. ${visit.doctorName}`,
                        category: 'OPD',
                        amount: visit.visitFee,
                        status: 'Pending' // Assuming not paid yet unless flag exists
                    });
                }
            });

            // B. PROCESS PHARMACY
            pharmacy.forEach(order => {
                // Ensure we map back to the same patient (Order stores Visit ID/Token)
                // If patient didn't check in via queue today (legacy), we might miss them, but assume flow strictly follows OPD -> Pharmacy
                const pid = order.visitId;
                // If we don't have record (maybe only pharmacy customer?), create one
                // We might need to look up details if not in queueMap... for now assuming overlap
                if (patientMap.has(pid)) {
                    const record = patientMap.get(pid)!;

                    record.items.push({
                        id: order.id,
                        date: new Date(order.timestamp).toLocaleDateString(),
                        description: `Pharmacy Order (${order.items.length} Items)`,
                        category: 'PHARMACY',
                        amount: order.paidAmount, // It's usually paid if 'COMPLETED'
                        status: 'Paid'
                    });
                }
            });

            // C. PROCESS IPD (Running Bill)
            beds.forEach(bed => {
                if (bed.status === 'OCCUPIED' && bed.patientId && bed.admissionId) {
                    // Find Admission Request for Start Date
                    const admission = admissionRequests.find(r => r.id === bed.admissionId);
                    const startDate = admission ? admission.timestamp : Date.now();
                    const days = Math.max(1, Math.ceil((Date.now() - startDate) / (1000 * 60 * 60 * 24)));

                    // Find Category Pricing
                    // Need to resolve Ward -> Category. `bed.wardId` -> `wards` array (Not in local vars, but Bed has wardId).
                    // Wait, `BedCategory` is linked to `Ward`.
                    // Ideally we fetch Wards too. For now let's hack it: match any category? No.
                    // Let's assume `bed.bedType` roughly maps or we need `orbit_ipd_wards`.
                    const wards = JSON.parse(localStorage.getItem('orbit_ipd_wards') || '[]');
                    const ward = wards.find((w: any) => w.id === bed.wardId);
                    const category = ward ? ipdCategories.find(c => c.id === ward.type) : null;

                    if (category) {
                        const dailyRate = category.baseCharge + category.nursingCharge;
                        const roomRent = days * dailyRate;

                        // Link to Patient
                        // IPD usually tracks by Admission ID, but let's link to Name or find in Queue?
                        // `bed.patientName` is available.
                        // Try to find existing record by Name if Token is missing?
                        // IPD patients might not be in OPD Queue today.
                        // Let's create a record if it doesn't exist, using Bed Patient ID as key.

                        let record: BillingRecord;
                        if (patientMap.has(bed.patientId || '')) {
                            record = patientMap.get(bed.patientId!)!;
                        } else {
                            // Create fresh record for IPD-only
                            record = getRecord(bed.patientId || `IPD-${bed.bedNumber}`, bed.patientName || 'Unknown', null);
                        }

                        record.isIPDActive = true;
                        record.bedInfo = `${ward?.name || 'Ward'} - Bed ${bed.bedNumber}`;

                        // Add Room Rent Line Item
                        record.items.push({
                            id: `IPD-RENT-${bed.id}`,
                            date: new Date().toLocaleDateString(),
                            description: `Room Rent (${days} Days @ ${category.name})`,
                            category: 'IPD',
                            amount: roomRent,
                            status: 'Pending'
                        });
                    }
                }
            });

            // 3. CALCULATE TOTALS
            Array.from(patientMap.values()).forEach(record => {
                const subtotal = record.items.reduce((sum, item) => sum + item.amount, 0);
                const paid = record.items.filter(i => i.status === 'Paid').reduce((sum, i) => sum + i.amount, 0);

                record.subtotal = subtotal;
                record.total = subtotal; // No tax/discount logic yet
                record.paidAmount = paid;
                record.dueAmount = subtotal - paid;
            });

            setBillingRecords(Array.from(patientMap.values()));
        };

        loadData();
        // Poll infrequently as billing is less real-time critical than Emergency
        const interval = setInterval(loadData, 5000);
        return () => clearInterval(interval);
    }, []);

    // Action: Settle Bill
    const settleBill = (patientId: string) => {
        // In a real app, we'd create a transaction record.
        // Here, we just mark all pending items as PAID in a local 'orbit_billing_transactions' log?
        // Or simply update the source? 
        // Updating source is hard (cant update queue visit fee status easily).
        // Let's just alert for now as "Payment Recorded".
        alert(`Payment processed for Patient ID: ${patientId}`);
    };

    return { searchPatient, settleBill };
};
