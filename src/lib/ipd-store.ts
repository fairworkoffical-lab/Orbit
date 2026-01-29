// Removed uuid import to avoid dependency issues
const generateId = () => Math.random().toString(36).substr(2, 9);


// --- TYPES ---

export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'RESERVED' | 'CLEANING' | 'BLOCKED';

// Building & Floor Management
export interface Building {
    id: string;
    name: string; // e.g., "Main Block", "East Wing"
    code: string; // e.g., "MB", "EW"
    floors: FloorInfo[];
}

export interface FloorInfo {
    number: number;
    name: string; // e.g., "Ground", "1st Floor"
}

// Room Types
export interface RoomType {
    id: string;
    name: string; // e.g., "Single Room", "6-Bed Ward"
    maxBeds: number;
    isIsolation: boolean;
    isSuite: boolean;
    surcharge: number; // Additional charge per day
}

// Amenities
export interface Amenity {
    id: string;
    name: string;
    icon: string; // Emoji or icon name
    isDefault: boolean;
}

// Medical Equipment
export interface Equipment {
    id: string;
    name: string;
    code: string; // e.g., "OXY", "VENT"
    dailyCharge: number;
    totalQuantity: number;
    icon?: string; // Emoji
}

// Enhanced Bed Category
export interface BedCategory {
    id: string;
    name: string;
    displayCode: string; // e.g., "GEN", "ICU"
    baseCharge: number;
    nursingCharge: number;
    depositRequired: number;
    colorCode: string;
    icon: string; // Emoji
    description: string;
    minStayHours: number;
    insuranceCovered: boolean;

    features: string[];
    roomTypeId?: string; // Link to RoomType for capacity constraints
}


export interface ClinicalNote {
    id: string;
    date: string;
    text: string;
    type: 'ROUND' | 'DIAGNOSIS' | 'INSTRUCTION' | 'COMPLAINT';
    doctorId: string;
    doctorName: string;
}

export interface Prescription {
    id: string;
    name: string;
    dosage: { m: string; a: string; n: string };
    duration: string;
    qty: string;
    instruction: string;
    dateAdded: string;
    doctorId: string;
    doctorName: string;
    status?: 'ACTIVE' | 'STOPPED';
}

export interface Ward {
    id: string;
    name: string;
    wardCode: string; // Short code e.g., "MGW"
    type: string; // BedCategory ID
    buildingId?: string; // Optional building reference
    genderPolicy: 'Any' | 'Male' | 'Female';
    totalBeds: number;
    floor: number;
    visitingHours?: string; // e.g., "10:00 AM - 12:00 PM"
    nurseStation?: string;
    bedNamingPattern: string; // e.g., "B-{FLOOR}0{SEQ}"
    notes?: string;
}

export interface Bed {
    id: string;
    wardId: string;
    roomId?: string; // Optional room reference
    bedNumber: string;
    bedType: 'standard' | 'electric' | 'bariatric';
    status: BedStatus;
    equipment?: string[]; // IDs of assigned equipment
    position?: string; // e.g., "Window Side"
    notes?: string;
    clinicalNotes?: ClinicalNote[];
    prescriptions?: Prescription[];
    patientId?: string;
    patientName?: string;
    admissionId?: string;
}

export interface AdmissionRequest {
    id: string;
    patientId: string;
    patientName: string;
    patientAge: string;
    patientGender: string;
    doctorId: string;
    doctorName: string;
    recommendedCategory: string;
    urgency: 'ROUTINE' | 'EMERGENCY';
    reason: string;
    timestamp: number;
    status: 'PENDING' | 'PATIENT_SELECTED' | 'ASSIGNED' | 'CANCELLED';
    patientSelection?: string;
    assignedBed?: string;
}

// --- INITIAL DATA ---

export const INITIAL_BUILDINGS: Building[] = [
    {
        id: 'main',
        name: 'Main Block',
        code: 'MB',
        floors: [
            { number: 1, name: 'Ground Floor' },
            { number: 2, name: '1st Floor' },
            { number: 3, name: '2nd Floor' }
        ]
    }
];

export const INITIAL_ROOM_TYPES: RoomType[] = [
    { id: 'ward', name: '6-Bed Ward', maxBeds: 6, isIsolation: false, isSuite: false, surcharge: 0 },
    { id: 'double', name: 'Double Sharing', maxBeds: 2, isIsolation: false, isSuite: false, surcharge: 200 },
    { id: 'single', name: 'Single Room', maxBeds: 1, isIsolation: false, isSuite: false, surcharge: 500 },
    { id: 'suite', name: 'Deluxe Suite', maxBeds: 1, isIsolation: false, isSuite: true, surcharge: 2000 },
    { id: 'isolation', name: 'Isolation Room', maxBeds: 1, isIsolation: true, isSuite: false, surcharge: 1000 }
];

export const INITIAL_AMENITIES: Amenity[] = [
    { id: 'ac', name: 'Air Conditioning', icon: '❄️', isDefault: false },
    { id: 'tv', name: 'Television', icon: '📺', isDefault: false },
    { id: 'wifi', name: 'WiFi', icon: '📶', isDefault: true },
    { id: 'fridge', name: 'Mini Fridge', icon: '🧊', isDefault: false },
    { id: 'bath', name: 'Attached Bathroom', icon: '🚿', isDefault: false },
    { id: 'attendant', name: 'Attendant Bed', icon: '🛋️', isDefault: false },
    { id: 'intercom', name: 'Intercom', icon: '📞', isDefault: true },
    { id: 'locker', name: 'Locker', icon: '🔐', isDefault: true }
];

export const INITIAL_EQUIPMENT: Equipment[] = [
    { id: 'oxy', name: 'Oxygen Concentrator', code: 'OXY', dailyCharge: 500, totalQuantity: 10, icon: '🫧' },
    { id: 'mon', name: 'Cardiac Monitor', code: 'MON', dailyCharge: 1000, totalQuantity: 8, icon: '📟' },
    { id: 'vent', name: 'Ventilator', code: 'VENT', dailyCharge: 5000, totalQuantity: 3, icon: '🫁' },
    { id: 'suc', name: 'Suction Machine', code: 'SUC', dailyCharge: 300, totalQuantity: 15, icon: '🔌' },
    { id: 'ivp', name: 'IV Pump', code: 'IVP', dailyCharge: 200, totalQuantity: 20, icon: '💉' },
    { id: 'neb', name: 'Nebulizer', code: 'NEB', dailyCharge: 150, totalQuantity: 12, icon: '💨' }
];

export const INITIAL_CATEGORIES: BedCategory[] = [
    {
        id: 'gen',
        name: 'General Ward',
        displayCode: 'GEN',
        baseCharge: 500,
        nursingCharge: 200,
        depositRequired: 5000,
        colorCode: 'bg-emerald-100 text-emerald-800',
        icon: '🛏️',
        description: 'Standard shared ward with basic amenities',
        minStayHours: 24,
        insuranceCovered: true,
        features: ['Common Washroom', 'Standard Diet', 'Shared Space'],
        roomTypeId: 'ward'
    },
    {
        id: 'semi',
        name: 'Semi-Private',
        displayCode: 'SEMI',
        baseCharge: 1200,
        nursingCharge: 400,
        depositRequired: 10000,
        colorCode: 'bg-blue-100 text-blue-800',
        icon: '🏥',
        description: 'Semi-private room shared with one other patient',
        minStayHours: 24,
        insuranceCovered: true,
        features: ['Shared Washroom (2 pax)', 'TV', 'Sofa', 'AC'],
        roomTypeId: 'double'
    },
    {
        id: 'pvt',
        name: 'Private Room',
        displayCode: 'PVT',
        baseCharge: 2500,
        nursingCharge: 800,
        depositRequired: 25000,
        colorCode: 'bg-indigo-100 text-indigo-800',
        icon: '🌟',
        description: 'Private room with attached bathroom and attendant bed',
        minStayHours: 24,
        insuranceCovered: true,
        features: ['Attached Washroom', 'AC', 'Extra Bed', 'TV', 'WiFi', 'Fridge'],
        roomTypeId: 'single'
    },
    {
        id: 'icu',
        name: 'ICU',
        displayCode: 'ICU',
        baseCharge: 5000,
        nursingCharge: 2000,
        depositRequired: 50000,
        colorCode: 'bg-rose-100 text-rose-800',
        icon: '🚨',
        description: 'Intensive Care Unit with 24x7 monitoring',
        minStayHours: 12,
        insuranceCovered: true,
        features: ['Ventilator Support', '1:1 Nursing', 'Monitor', 'Central Oxygen']
    }
];

export const INITIAL_WARDS: Ward[] = [
    { id: 'w1', name: 'Male General Ward', wardCode: 'MGW', type: 'gen', buildingId: 'main', genderPolicy: 'Male', totalBeds: 10, floor: 1, bedNamingPattern: 'B-{FLOOR}0{SEQ}', visitingHours: '10:00 AM - 6:00 PM', nurseStation: 'Station A' },
    { id: 'w2', name: 'Female General Ward', wardCode: 'FGW', type: 'gen', buildingId: 'main', genderPolicy: 'Female', totalBeds: 10, floor: 1, bedNamingPattern: 'B-{FLOOR}0{SEQ}', visitingHours: '10:00 AM - 6:00 PM', nurseStation: 'Station A' },
    { id: 'w3', name: 'Private Wing A', wardCode: 'PWA', type: 'pvt', buildingId: 'main', genderPolicy: 'Any', totalBeds: 5, floor: 2, bedNamingPattern: 'P-{FLOOR}0{SEQ}', visitingHours: '8:00 AM - 8:00 PM', nurseStation: 'Station B' },
    { id: 'icu1', name: 'Central ICU', wardCode: 'ICU', type: 'icu', buildingId: 'main', genderPolicy: 'Any', totalBeds: 4, floor: 2, bedNamingPattern: 'ICU-{SEQ}', visitingHours: '4:00 PM - 5:00 PM', nurseStation: 'ICU Station' },
];

// --- SERVICE ---

const STORAGE_KEYS = {
    CONFIG: 'orbit_ipd_config_v2', // Full configuration (Categories, Wards, Buildings, RoomTypes, Amenities, Equipment)
    BEDS: 'orbit_ipd_beds',     // Real-time Bed Status
    ADMISSIONS: 'orbit_ipd_admissions' // Audit log
};

// Helper: Generate Bed Number from Pattern
const generateBedNumber = (pattern: string, floor: number, seq: number): string => {
    return pattern
        .replace('{FLOOR}', String(floor))
        .replace('{SEQ}', String(seq).padStart(2, '0'));
};

// Helper: Generate Beds for a Ward
const generateBedsForWard = (ward: Ward): Bed[] => {
    const beds: Bed[] = [];
    for (let i = 1; i <= ward.totalBeds; i++) {
        beds.push({
            id: `${ward.id}-b${i}`,
            wardId: ward.id,
            bedNumber: generateBedNumber(ward.bedNamingPattern, ward.floor, i),
            bedType: 'standard',
            status: 'AVAILABLE'
        });
    }
    return beds;
};

export const IpdService = {
    // 1. INITIALIZE
    init: () => {
        if (typeof window === 'undefined') return;

        if (!localStorage.getItem(STORAGE_KEYS.CONFIG)) {
            const config = {
                categories: INITIAL_CATEGORIES,
                wards: INITIAL_WARDS,
                buildings: INITIAL_BUILDINGS,
                roomTypes: INITIAL_ROOM_TYPES,
                amenities: INITIAL_AMENITIES,
                equipment: INITIAL_EQUIPMENT
            };
            localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(config));

            // Auto-generate beds based on wards
            const beds: Bed[] = [];
            INITIAL_WARDS.forEach(ward => {
                beds.push(...generateBedsForWard(ward));
            });
            localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(beds));
        }
    },

    // 2. GETTERS
    getData: () => {
        if (typeof window === 'undefined') return {
            categories: [] as BedCategory[],
            wards: [] as Ward[],
            beds: [] as Bed[],
            requests: [] as AdmissionRequest[],
            buildings: [] as Building[],
            roomTypes: [] as RoomType[],
            amenities: [] as Amenity[],
            equipment: [] as Equipment[]
        };

        const configRaw = localStorage.getItem(STORAGE_KEYS.CONFIG);
        const bedsRaw = localStorage.getItem(STORAGE_KEYS.BEDS);
        const requestsRaw = localStorage.getItem('orbit_admission_requests');

        const config = configRaw ? JSON.parse(configRaw) : {
            categories: INITIAL_CATEGORIES,
            wards: [],
            buildings: INITIAL_BUILDINGS,
            roomTypes: INITIAL_ROOM_TYPES,
            amenities: INITIAL_AMENITIES,
            equipment: INITIAL_EQUIPMENT
        };

        // Ensure defaults if empty (for existing dirty state)
        if (!config.categories || config.categories.length === 0) config.categories = INITIAL_CATEGORIES;
        if (!config.buildings || config.buildings.length === 0) config.buildings = INITIAL_BUILDINGS;
        if (!config.roomTypes || config.roomTypes.length === 0) config.roomTypes = INITIAL_ROOM_TYPES;
        if (!config.amenities || config.amenities.length === 0) config.amenities = INITIAL_AMENITIES;
        if (!config.equipment || config.equipment.length === 0) config.equipment = INITIAL_EQUIPMENT;

        // Sanitize Categories (Backwards Compatibility)
        if (config.categories) {
            config.categories = config.categories.map((c: any) => ({
                ...c,
                baseCharge: c.baseCharge || 0,
                nursingCharge: c.nursingCharge || 0,
                depositRequired: c.depositRequired || 0,
                minStayHours: c.minStayHours || 24,
                features: c.features || []
            }));
        }

        // Sanitize Wards (Ensure valid Category link)
        if (config.wards) {
            config.wards = config.wards.map((w: any) => {
                const catExists = config.categories.find((c: any) => c.id === w.type);
                if (!catExists && config.categories.length > 0) {
                    // Try to match by exact name
                    const nameMatch = config.categories.find((c: any) => c.name === w.name);
                    if (nameMatch) return { ...w, type: nameMatch.id };
                    // Fallback to first category to prevent "Unknown" error state
                    return { ...w, type: config.categories[0].id };
                }
                return w;
            });
        }
        const beds: Bed[] = bedsRaw ? JSON.parse(bedsRaw) : [];
        const requests: AdmissionRequest[] = requestsRaw ? JSON.parse(requestsRaw) : [];

        return { ...config, beds, requests };
    },

    // 3. CONFIG CRUD
    saveConfig: (config: {
        categories?: BedCategory[];
        wards?: Ward[];
        buildings?: Building[];
        roomTypes?: RoomType[];
        amenities?: Amenity[];
        equipment?: Equipment[];
    }) => {
        const current = IpdService.getData();
        const updated = { ...current, ...config };
        // Remove runtime data before saving config
        delete (updated as any).beds;
        delete (updated as any).requests;
        localStorage.setItem(STORAGE_KEYS.CONFIG, JSON.stringify(updated));
        window.dispatchEvent(new Event('storage'));
    },

    // Category CRUD
    addCategory: (category: Omit<BedCategory, 'id'>) => {
        const data = IpdService.getData();
        const newCat = { ...category, id: generateId() };
        data.categories.push(newCat);
        IpdService.saveConfig({ categories: data.categories });
        return newCat;
    },
    updateCategory: (id: string, updates: Partial<BedCategory>) => {
        const data = IpdService.getData();
        const idx = data.categories.findIndex(c => c.id === id);
        if (idx !== -1) {
            data.categories[idx] = { ...data.categories[idx], ...updates };
            IpdService.saveConfig({ categories: data.categories });
        }
    },
    deleteCategory: (id: string) => {
        const data = IpdService.getData();
        // Check if any ward uses this category
        const usedByWard = data.wards.some(w => w.type === id);
        if (usedByWard) {
            alert('Cannot delete: Category is in use by one or more wards.');
            return false;
        }
        data.categories = data.categories.filter((c: BedCategory) => c.id !== id);
        IpdService.saveConfig({ categories: data.categories });
        return true;
    },

    // Ward CRUD
    addWard: (ward: Omit<Ward, 'id'>) => {
        const data = IpdService.getData();
        const newWard = { ...ward, id: generateId() } as Ward;
        data.wards.push(newWard);
        IpdService.saveConfig({ wards: data.wards });

        // Generate beds for the new ward
        const newBeds = generateBedsForWard(newWard);
        const bedsRaw = localStorage.getItem(STORAGE_KEYS.BEDS);
        const beds: Bed[] = bedsRaw ? JSON.parse(bedsRaw) : [];
        beds.push(...newBeds);
        localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(beds));
        window.dispatchEvent(new Event('storage'));

        return newWard;
    },
    updateWard: (id: string, updates: Partial<Ward>) => {
        const data = IpdService.getData();
        const idx = data.wards.findIndex(w => w.id === id);
        if (idx !== -1) {
            const oldWard = data.wards[idx];
            const newWard = { ...oldWard, ...updates };
            data.wards[idx] = newWard;
            IpdService.saveConfig({ wards: data.wards });

            // If bed count or naming pattern changed, regenerate beds
            if (updates.totalBeds !== undefined || updates.bedNamingPattern !== undefined || updates.floor !== undefined) {
                IpdService.regenerateWardbeds(id);
            }
        }
    },
    deleteWard: (id: string) => {
        const data = IpdService.getData();
        // Check for active patients in this ward
        const bedsRaw = localStorage.getItem(STORAGE_KEYS.BEDS);
        const beds: Bed[] = bedsRaw ? JSON.parse(bedsRaw) : [];
        const hasOccupied = beds.some(b => b.wardId === id && b.status === 'OCCUPIED');
        if (hasOccupied) {
            alert('Cannot delete: Ward has occupied beds.');
            return false;
        }

        data.wards = data.wards.filter((w: Ward) => w.id !== id);
        IpdService.saveConfig({ wards: data.wards });

        // Remove beds for this ward
        const remainingBeds = beds.filter(b => b.wardId !== id);
        localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(remainingBeds));
        window.dispatchEvent(new Event('storage'));
        return true;
    },
    regenerateWardbeds: (wardId: string) => {
        const data = IpdService.getData();
        const ward = data.wards.find(w => w.id === wardId);
        if (!ward) return;

        const bedsRaw = localStorage.getItem(STORAGE_KEYS.BEDS);
        let beds: Bed[] = bedsRaw ? JSON.parse(bedsRaw) : [];

        // Remove old beds (only if not occupied)
        const oldBeds = beds.filter((b: Bed) => b.wardId === wardId);
        const occupiedBeds = oldBeds.filter((b: Bed) => b.status === 'OCCUPIED');
        if (occupiedBeds.length > 0) {
            alert('Cannot regenerate: Some beds are occupied.');
            return;
        }

        beds = beds.filter(b => b.wardId !== wardId);
        const newBeds = generateBedsForWard(ward);
        beds.push(...newBeds);
        localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(beds));
        window.dispatchEvent(new Event('storage'));
    },

    // Building, RoomType, Amenity, Equipment CRUD
    addBuilding: (building: Omit<Building, 'id'>) => {
        const data = IpdService.getData();
        const newItem = { ...building, id: generateId() };
        data.buildings.push(newItem);
        IpdService.saveConfig({ buildings: data.buildings });
        return newItem;
    },
    updateBuilding: (id: string, updates: Partial<Building>) => {
        const data = IpdService.getData();
        const idx = data.buildings.findIndex(b => b.id === id);
        if (idx !== -1) {
            data.buildings[idx] = { ...data.buildings[idx], ...updates };
            IpdService.saveConfig({ buildings: data.buildings });
        }
    },
    deleteBuilding: (id: string) => {
        const data = IpdService.getData();
        const usedByWard = data.wards.some(w => w.buildingId === id);
        if (usedByWard) {
            alert('Cannot delete: Building is in use by one or more wards.');
            return false;
        }
        data.buildings = data.buildings.filter((b: Building) => b.id !== id);
        IpdService.saveConfig({ buildings: data.buildings });
        return true;
    },

    addRoomType: (roomType: Omit<RoomType, 'id'>) => {
        const data = IpdService.getData();
        const newItem = { ...roomType, id: generateId() };
        data.roomTypes.push(newItem);
        IpdService.saveConfig({ roomTypes: data.roomTypes });
        return newItem;
    },
    updateRoomType: (id: string, updates: Partial<RoomType>) => {
        const data = IpdService.getData();
        const idx = data.roomTypes.findIndex(r => r.id === id);
        if (idx !== -1) {
            data.roomTypes[idx] = { ...data.roomTypes[idx], ...updates };
            IpdService.saveConfig({ roomTypes: data.roomTypes });
        }
    },
    deleteRoomType: (id: string) => {
        const data = IpdService.getData();
        data.roomTypes = data.roomTypes.filter((r: RoomType) => r.id !== id);
        IpdService.saveConfig({ roomTypes: data.roomTypes });
        return true;
    },

    addAmenity: (amenity: Omit<Amenity, 'id'>) => {
        const data = IpdService.getData();
        const newItem = { ...amenity, id: generateId() };
        data.amenities.push(newItem);
        IpdService.saveConfig({ amenities: data.amenities });
        return newItem;
    },
    updateAmenity: (id: string, updates: Partial<Amenity>) => {
        const data = IpdService.getData();
        const idx = data.amenities.findIndex(a => a.id === id);
        if (idx !== -1) {
            data.amenities[idx] = { ...data.amenities[idx], ...updates };
            IpdService.saveConfig({ amenities: data.amenities });
        }
    },
    deleteAmenity: (id: string) => {
        const data = IpdService.getData();
        data.amenities = data.amenities.filter((a: Amenity) => a.id !== id);
        IpdService.saveConfig({ amenities: data.amenities });
        return true;
    },

    addEquipment: (equipment: Omit<Equipment, 'id'>) => {
        const data = IpdService.getData();
        const newItem = { ...equipment, id: generateId() };
        data.equipment.push(newItem);
        IpdService.saveConfig({ equipment: data.equipment });
        return newItem;
    },
    updateEquipment: (id: string, updates: Partial<Equipment>) => {
        const data = IpdService.getData();
        const idx = data.equipment.findIndex(e => e.id === id);
        if (idx !== -1) {
            data.equipment[idx] = { ...data.equipment[idx], ...updates };
            IpdService.saveConfig({ equipment: data.equipment });
        }
    },
    deleteEquipment: (id: string) => {
        const data = IpdService.getData();
        data.equipment = data.equipment.filter((e: Equipment) => e.id !== id);
        IpdService.saveConfig({ equipment: data.equipment });
        return true;
    },

    // 4. BED ACTIONS
    updateBedStatus: (bedId: string, status: BedStatus, patientDetails?: { id: string, name: string }) => {
        const bedsRaw = localStorage.getItem(STORAGE_KEYS.BEDS);
        if (!bedsRaw) return;

        let beds: Bed[] = JSON.parse(bedsRaw);
        beds = beds.map(b => {
            if (b.id === bedId) {
                return {
                    ...b,
                    status,
                    patientId: patientDetails?.id || (status === 'AVAILABLE' ? undefined : b.patientId),
                    patientName: patientDetails?.name || (status === 'AVAILABLE' ? undefined : b.patientName)
                };
            }
            return b;
        });

        localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(beds));
        window.dispatchEvent(new Event('storage'));
    },

    updateBed: (bedId: string, updates: Partial<Bed>) => {
        const bedsRaw = localStorage.getItem(STORAGE_KEYS.BEDS);
        if (!bedsRaw) return;

        let beds: Bed[] = JSON.parse(bedsRaw);
        const idx = beds.findIndex(b => b.id === bedId);
        if (idx !== -1) {
            beds[idx] = { ...beds[idx], ...updates };
            localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(beds));
            window.dispatchEvent(new Event('storage'));
        }
    },

    // 5. ADMISSION ACTIONS
    createAdmissionRequest: (req: Omit<AdmissionRequest, 'id' | 'timestamp' | 'status'>) => {
        const newRequest: AdmissionRequest = {
            ...req,
            id: generateId(),
            timestamp: Date.now(),
            status: 'PENDING'
        };

        const existingRaw = localStorage.getItem('orbit_admission_requests');
        const existing = existingRaw ? JSON.parse(existingRaw) : [];
        existing.push(newRequest);
        localStorage.setItem('orbit_admission_requests', JSON.stringify(existing));
        window.dispatchEvent(new Event('storage'));
        return newRequest;
    },

    processAdmission: (requestId: string, bedId: string) => {
        const bedsRaw = localStorage.getItem(STORAGE_KEYS.BEDS);
        const requestsRaw = localStorage.getItem('orbit_admission_requests');
        if (!bedsRaw || !requestsRaw) return;

        let beds: Bed[] = JSON.parse(bedsRaw);
        let requests: AdmissionRequest[] = JSON.parse(requestsRaw);

        const requestIndex = requests.findIndex(r => r.id === requestId);
        if (requestIndex === -1) return;
        const request = requests[requestIndex];

        let assignedBedNumber = '';
        beds = beds.map(b => {
            if (b.id === bedId) {
                assignedBedNumber = b.bedNumber;
                return {
                    ...b,
                    status: 'OCCUPIED' as BedStatus,
                    patientId: request.patientId,
                    patientName: request.patientName,
                    admissionId: request.id
                };
            }
            return b;
        });

        requests[requestIndex] = {
            ...request,
            status: 'ASSIGNED',
            assignedBed: assignedBedNumber
        };

        localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(beds));
        localStorage.setItem('orbit_admission_requests', JSON.stringify(requests));
        window.dispatchEvent(new Event('storage'));
    },

    addClinicalNote: (bedId: string, note: Omit<ClinicalNote, 'id' | 'date'>) => {
        const bedsRaw = localStorage.getItem(STORAGE_KEYS.BEDS);
        if (!bedsRaw) return;

        let beds: Bed[] = JSON.parse(bedsRaw);
        const bedIndex = beds.findIndex(b => b.id === bedId);

        if (bedIndex !== -1) {
            const newNote: ClinicalNote = {
                ...note,
                id: generateId(),
                date: new Date().toISOString()
            };
            const currentNotes = beds[bedIndex].clinicalNotes || [];
            beds[bedIndex] = {
                ...beds[bedIndex],
                clinicalNotes: [newNote, ...currentNotes] // Add new note to the beginning
            };
            localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(beds));
            window.dispatchEvent(new Event('storage'));
        }
    },

    addPrescription: (bedId: string, prescription: Omit<Prescription, 'id' | 'dateAdded'>) => {
        const bedsRaw = localStorage.getItem(STORAGE_KEYS.BEDS);
        if (!bedsRaw) return;

        let beds: Bed[] = JSON.parse(bedsRaw);
        const bedIndex = beds.findIndex(b => b.id === bedId);

        if (bedIndex !== -1) {
            const newRx: Prescription = {
                ...prescription,
                id: generateId(),
                dateAdded: new Date().toISOString(),
                status: 'ACTIVE'
            };
            const currentRx = beds[bedIndex].prescriptions || [];
            beds[bedIndex] = {
                ...beds[bedIndex],
                prescriptions: [newRx, ...currentRx]
            };
            localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(beds));
            window.dispatchEvent(new Event('storage'));
        }
    },

    stopPrescription: (bedId: string, prescriptionId: string) => {
        const bedsRaw = localStorage.getItem(STORAGE_KEYS.BEDS);
        if (!bedsRaw) return;

        let beds: Bed[] = JSON.parse(bedsRaw);
        const bedIndex = beds.findIndex(b => b.id === bedId);

        if (bedIndex !== -1) {
            const currentRx = beds[bedIndex].prescriptions || [];
            beds[bedIndex] = {
                ...beds[bedIndex],
                prescriptions: currentRx.map(p =>
                    p.id === prescriptionId ? { ...p, status: 'STOPPED', stoppedAt: new Date().toISOString() } : p
                )
            };
            localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(beds));
            window.dispatchEvent(new Event('storage'));
        }
    },

    restartPrescription: (bedId: string, prescriptionId: string) => {
        const bedsRaw = localStorage.getItem(STORAGE_KEYS.BEDS);
        if (!bedsRaw) return;

        let beds: Bed[] = JSON.parse(bedsRaw);
        const bedIndex = beds.findIndex(b => b.id === bedId);

        if (bedIndex !== -1) {
            const currentRx = beds[bedIndex].prescriptions || [];
            beds[bedIndex] = {
                ...beds[bedIndex],
                prescriptions: currentRx.map(p =>
                    p.id === prescriptionId ? { ...p, status: 'ACTIVE', stoppedAt: undefined, dateAdded: new Date().toISOString() } : p
                )
            };
            localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(beds));
            window.dispatchEvent(new Event('storage'));
        }
    },

    removePrescription: (bedId: string, prescriptionId: string) => {
        const bedsRaw = localStorage.getItem(STORAGE_KEYS.BEDS);
        if (!bedsRaw) return;

        let beds: Bed[] = JSON.parse(bedsRaw);
        const bedIndex = beds.findIndex(b => b.id === bedId);

        if (bedIndex !== -1) {
            const currentRx = beds[bedIndex].prescriptions || [];
            beds[bedIndex] = {
                ...beds[bedIndex],
                prescriptions: currentRx.filter(p => p.id !== prescriptionId)
            };
            localStorage.setItem(STORAGE_KEYS.BEDS, JSON.stringify(beds));
            window.dispatchEvent(new Event('storage'));
        }
    },



    // 6. RESET
    reset: () => {
        localStorage.removeItem(STORAGE_KEYS.CONFIG);
        localStorage.removeItem(STORAGE_KEYS.BEDS);
        localStorage.removeItem(STORAGE_KEYS.ADMISSIONS);
        localStorage.removeItem('orbit_admission_requests');
        window.location.reload();
    }
};

