'use client';

import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

export function Header() {
    const pathname = usePathname();

    // Determine Role based on path
    const isDoctor = pathname.includes('/doctor');
    const roleLabel = isDoctor ? "Doctor (Consultant)" : "Reception (Front Desk)";
    const roleColor = isDoctor ? "bg-indigo-500 shadow-indigo-200" : "bg-emerald-500 shadow-emerald-200";

    return (
        <header className="sticky top-0 z-50 w-full border-b border-slate-200 bg-white/95 backdrop-blur-md shadow-sm">
            <div className="container mx-auto px-4 flex h-16 items-center justify-between">

                {/* LEFT: Logo & Version */}
                <Link href="/" className="flex items-center gap-3 group">
                    {/* Logo Image - 200% larger */}
                    <div className="relative h-[168px] w-[864px]">
                        <Image
                            src="/orbit-logo-root-source.png"
                            alt="ORBIT Logo"
                            fill
                            className="object-contain object-left"
                            unoptimized
                            priority
                        />
                    </div>
                </Link>

                {/* RIGHT: Role Badge & Utilities (Hidden on IPD) */}
                {!pathname.includes('/ipd') && (
                    <div className="flex items-center gap-4">

                        {/* Role Badge */}
                        <div className="flex items-center gap-2 bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 rounded-full px-4 py-2 shadow-sm">
                            <span className={cn(
                                "w-2.5 h-2.5 rounded-full animate-pulse shadow-lg",
                                roleColor
                            )}></span>
                            <span className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                                Role: {roleLabel}
                            </span>
                        </div>

                        {/* User Avatar Placeholder */}
                        <div className={cn(
                            "h-10 w-10 rounded-full flex items-center justify-center text-white font-bold text-sm shadow-lg cursor-pointer hover:scale-105 transition-transform",
                            pathname.includes('/doctor') ? "bg-gradient-to-br from-indigo-400 to-indigo-600" : "bg-gradient-to-br from-emerald-400 to-emerald-600"
                        )}>
                            {pathname.includes('/doctor') ? "DR" : "RX"}
                        </div>
                    </div>
                )}
            </div>
        </header>
    );
}
