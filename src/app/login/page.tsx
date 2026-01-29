'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAppStore } from '@/lib/store';
import { Building2, ArrowRight, ShieldCheck, Stethoscope, Lock, Mail } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const { login, addUser } = useAppStore();
    const [isLoading, setIsLoading] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isSignUp, setIsSignUp] = useState(false);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        // Simulate Network Request
        setTimeout(() => {
            // Mock Login Logic
            if (email) {
                // In a real app, this returns a JWT. 
                // Here we simulate a Super Admin login for the "Owner" flow.
                login('ADMIN', 'admin-123'); // Default to Admin for onboarding flow

                // If Sign Up, we assume they need to onboard
                if (isSignUp) {
                    router.push('/onboarding');
                } else {
                    router.push('/');
                }
            }
            setIsLoading(false);
        }, 1500);
    };

    return (
        <div className="min-h-screen grid grid-cols-1 lg:grid-cols-2 bg-white">

            {/* LEFT: Branding Section */}
            <div className="hidden lg:flex flex-col justify-between bg-zinc-900 p-12 text-white relative overflow-hidden">
                <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1519494026892-80bbd2d6fd0d?q=80&w=2053&auto=format&fit=crop')] bg-cover bg-center opacity-20 mix-blend-overlay"></div>
                <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/90 to-zinc-900/90"></div>

                <div className="relative z-10">
                    <div className="flex items-center gap-3 mb-8">
                        <div className="h-10 w-10 bg-indigo-500 rounded-xl flex items-center justify-center font-black text-xl shadow-lg shadow-indigo-500/20">O</div>
                        <span className="text-2xl font-bold tracking-tight">ORBIT</span>
                    </div>
                </div>

                <div className="relative z-10 max-w-lg">
                    <h1 className="text-5xl font-black mb-6 leading-tight">The Operating System for High-Performance Hospitals.</h1>
                    <p className="text-zinc-400 text-lg mb-8 leading-relaxed">
                        Stop managing chaos. Start orchestrating care. Join 10,000+ forward-thinking hospitals running on Orbit.
                    </p>

                    <div className="flex gap-4 text-sm font-bold text-zinc-500">
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                            <ShieldCheck className="w-4 h-4 text-emerald-400" /> HIPAA Compliant
                        </div>
                        <div className="flex items-center gap-2 bg-white/5 px-4 py-2 rounded-full border border-white/10">
                            <Stethoscope className="w-4 h-4 text-indigo-400" /> Clinical AI Ready
                        </div>
                    </div>
                </div>

                <div className="relative z-10 text-xs text-zinc-600 font-mono">
                    © 2026 Orbit Health Systems Inc.
                </div>
            </div>

            {/* RIGHT: Auth Form */}
            <div className="flex items-center justify-center p-8 bg-zinc-50">
                <div className="w-full max-w-md bg-white p-10 rounded-3xl shadow-xl shadow-zinc-200/50 border border-zinc-100">
                    <div className="mb-10 text-center">
                        <h2 className="text-3xl font-black text-zinc-900 tracking-tight mb-2">
                            {isSignUp ? "Deploy Protocol" : "Welcome Back"}
                        </h2>
                        <p className="text-zinc-500 font-medium">
                            {isSignUp ? "Initialize your Hospital OS workspace." : "Enter your credentials to access the console."}
                        </p>
                    </div>

                    <form onSubmit={handleAuth} className="space-y-6">
                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Work Email</label>
                            <div className="relative">
                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    type="email"
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-zinc-50 border-2 border-zinc-100 focus:border-indigo-500 focus:bg-white focus:outline-none font-bold text-zinc-700 transition-all placeholder:font-medium"
                                    placeholder="doctor@hospital.com"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-bold text-zinc-400 uppercase tracking-wider ml-1">Passkey</label>
                            <div className="relative">
                                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-400" />
                                <input
                                    type="password"
                                    required
                                    className="w-full pl-12 pr-4 py-4 rounded-xl bg-zinc-50 border-2 border-zinc-100 focus:border-indigo-500 focus:bg-white focus:outline-none font-bold text-zinc-700 transition-all placeholder:font-medium text-lg tracking-widest"
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full py-4 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-lg shadow-lg shadow-indigo-500/30 transition-all active:scale-[0.98] disabled:opacity-70 disabled:cursor-not-allowed flex items-center justify-center gap-2 group"
                        >
                            {isLoading ? (
                                <span className="animate-pulse">Authenticating...</span>
                            ) : (
                                <>
                                    {isSignUp ? "Initialize Workspace" : "Access Console"}
                                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </>
                            )}
                        </button>
                    </form>

                    <div className="mt-8 text-center">
                        <button
                            onClick={() => setIsSignUp(!isSignUp)}
                            className="text-sm font-bold text-zinc-500 hover:text-indigo-600 transition-colors"
                        >
                            {isSignUp ? "Already have a workspace? Log in" : "New to Orbit? Initialize System"}
                        </button>
                    </div>
                </div>
            </div>

        </div>
    );
}
