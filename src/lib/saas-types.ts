export type ModuleType = 'opd' | 'ipd' | 'pharmacy' | 'billing' | 'admin' | 'super-admin' | 'lab';

export interface TenantConfig {
    id: string; // e.g., "hosp_123"
    name: string; // e.g., "City Care Hospital"
    slug: string; // e.g., "city-care"
    modules: Record<ModuleType, boolean>;
    theme?: 'light' | 'dark' | 'system';
    plan: 'free' | 'pro' | 'enterprise';
}

// The "Default" Tenant = The App as it exists today
export const DEFAULT_TENANT: TenantConfig = {
    id: 'default',
    name: 'Orbit General Hospital',
    slug: 'default',
    modules: {
        opd: true,
        ipd: true,
        pharmacy: true,
        billing: true,
        admin: true,
        'super-admin': true,
        lab: false
    },
    plan: 'enterprise'
};
