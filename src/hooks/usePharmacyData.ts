import { useState, useEffect } from 'react';
import { QueueItem } from '@/components/orbit/OperationalQueue';
import { PrescriptionItem } from '@/components/orbit/PrescriptionTemplate';

export interface PharmacyOrder {
    id: string; // Unique Order ID
    visitId: string;
    patientName: string;
    doctorName: string;
    age: number;
    gender: string;
    timestamp: number;
    items: PharmacyItem[];
    status: 'PENDING' | 'COMPLETED';
    totalAmount: number;
    paidAmount: number;
}

export interface PharmacyItem extends PrescriptionItem {
    price: number;
    isSelected: boolean; // For partial fulfillment
}

export interface PharmacyMetrics {
    dailyRevenue: number;
    pendingOrders: number;
    completedOrders: number;
    inventoryAlerts: string[];
}

export const usePharmacyData = () => {
    const [queue, setQueue] = useState<PharmacyOrder[]>([]);
    const [metrics, setMetrics] = useState<PharmacyMetrics>({
        dailyRevenue: 0,
        pendingOrders: 0,
        completedOrders: 0,
        inventoryAlerts: []
    });

    useEffect(() => {
        const loadData = () => {
            // 1. Fetch OPD Queue (Completed visits often have prescriptions)
            const opdQueueRaw = localStorage.getItem('orbit_queue');
            const opdQueue: QueueItem[] = opdQueueRaw ? JSON.parse(opdQueueRaw) : [];

            // 2. Fetch Existing Pharmacy Orders (Persisted state)
            const pharmacyRaw = localStorage.getItem('orbit_pharmacy_orders');
            const pharmacyHistory: PharmacyOrder[] = pharmacyRaw ? JSON.parse(pharmacyRaw) : [];

            // 3. IDENTIFY NEW ORDERS
            // Find visits that are COMPLETED or SENT-TO-IPD and have prescriptions
            // AND are not already in the pharmacy history (by visit ID)
            const newCandidates = opdQueue.filter(visit =>
                (visit.status === 'completed' || visit.status === 'sent-to-ipd') &&
                visit.visitDetails?.prescriptions?.length > 0
            );

            // Determine if these candidates are already processed or waiting
            // We need a stable ID. We'll use visit.token (Display ID) + timestamp or just visit ID if available. 
            // In QueueItem, we have `id` (UUID) or `token` (Display ID). 
            // Let's use `id` if available, or fallback to `token`.

            const activeOrders: PharmacyOrder[] = [];

            newCandidates.forEach(visit => {
                const visitId = visit.id || visit.token;
                const existingOrder = pharmacyHistory.find(o => o.visitId === visitId);

                if (existingOrder) {
                    // It's already been processed/saved. If it's PENDING, add to queue.
                    if (existingOrder.status === 'PENDING') {
                        activeOrders.push(existingOrder);
                    }
                } else {
                    // IT IS NEW! Auto-generate a pending order
                    const newOrder: PharmacyOrder = {
                        id: `PH-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
                        visitId: visitId,
                        patientName: visit.patientName,
                        doctorName: (visit as any).doctorName || 'Unknown',
                        age: parseInt(visit.age) || 0,
                        gender: visit.gender || 'O',
                        timestamp: visit.checkInTime || Date.now(),
                        status: 'PENDING',
                        totalAmount: 0,
                        paidAmount: 0,
                        items: (visit.visitDetails?.prescriptions || []).map((p: any) => ({
                            ...p,
                            price: Math.floor(Math.random() * 200) + 50, // Mock Price: ₹50 - ₹250
                            isSelected: true
                        }))
                    };

                    // Add to history immediately so we don't re-generate prices every poll
                    pharmacyHistory.push(newOrder);
                    localStorage.setItem('orbit_pharmacy_orders', JSON.stringify(pharmacyHistory));
                    activeOrders.push(newOrder);
                }
            });

            // 4. Calculate Metrics
            const today = new Date().toDateString();
            const todaysOrders = pharmacyHistory.filter(o => new Date(o.timestamp).toDateString() === today);

            const revenue = todaysOrders
                .filter(o => o.status === 'COMPLETED')
                .reduce((sum, o) => sum + o.paidAmount, 0);

            const completedCount = todaysOrders.filter(o => o.status === 'COMPLETED').length;

            setQueue(activeOrders);
            setMetrics({
                dailyRevenue: revenue,
                pendingOrders: activeOrders.length,
                completedOrders: completedCount,
                inventoryAlerts: activeOrders.length > 5 ? ['High Demand: Paracetamol', 'Stock Low: Amoxicillin'] : []
            });
        };

        loadData();
        const interval = setInterval(loadData, 3000); // Poll every 3s
        return () => clearInterval(interval);
    }, []);

    const processOrder = (order: PharmacyOrder, paidAmount: number) => {
        // 1. Update status to COMPLETED
        const completedOrder: PharmacyOrder = {
            ...order,
            status: 'COMPLETED',
            paidAmount: paidAmount,
            timestamp: Date.now() // Update timestamp to checkout time
        };

        // 2. Save to Storage
        const pharmacyRaw = localStorage.getItem('orbit_pharmacy_orders');
        const history: PharmacyOrder[] = pharmacyRaw ? JSON.parse(pharmacyRaw) : [];

        // Remove old pending, add new completed
        const updatedHistory = history.filter(o => o.id !== order.id);
        updatedHistory.push(completedOrder);

        localStorage.setItem('orbit_pharmacy_orders', JSON.stringify(updatedHistory));

        // 3. Force Refresh logic will pick this up on next poll or we updating state locally
        setQueue(prev => prev.filter(o => o.id !== order.id));
    };

    return { queue, metrics, processOrder };
};
