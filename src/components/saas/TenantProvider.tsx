'use client';

import React, { createContext, useContext, useState, useEffect } from 'react';
import { TenantConfig, DEFAULT_TENANT, ModuleType } from '@/lib/saas-types';

interface TenantContextType {
    tenant: TenantConfig;
    setTenant: (tenant: TenantConfig) => void;
    hasModule: (module: ModuleType) => boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

export function TenantProvider({ children }: { children: React.ReactNode }) {
    // Initialize state properly
    const [tenant, setTenant] = useState<TenantConfig>(DEFAULT_TENANT);
    const [mounted, setMounted] = useState(false);

    // Hydrate from localStorage on mount
    useEffect(() => {
        const stored = localStorage.getItem('orbit_tenant');
        if (stored) {
            try {
                setTenant(JSON.parse(stored));
            } catch (e) {
                console.error("Failed to parse tenant config", e);
            }
        }
        setMounted(true);
    }, []);

    // Persist changes
    useEffect(() => {
        if (mounted) {
            localStorage.setItem('orbit_tenant', JSON.stringify(tenant));
        }
    }, [tenant, mounted]);

    const hasModule = (module: ModuleType) => {
        return !!tenant.modules[module];
    };

    // Return default or null during SSR to avoid mismatch, but for this client-app we just render
    if (!mounted) {
        return null; // Or a loading spinner to prevent flash of default content
    }

    return (
        <TenantContext.Provider value={{ tenant, setTenant, hasModule }}>
            {children}
        </TenantContext.Provider>
    );
}

export const useTenant = () => {
    const context = useContext(TenantContext);
    if (!context) {
        throw new Error('useTenant must be used within a TenantProvider');
    }
    return context;
};
