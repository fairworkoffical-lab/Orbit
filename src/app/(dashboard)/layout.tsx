import { Header } from '@/components/orbit/Header';

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return (
        <div className="flex min-h-screen flex-col bg-slate-50/50">
            <Header />
            <main className="flex-1 space-y-4 p-8 pt-6">
                <div className="container mx-auto max-w-7xl">
                    {children}
                </div>
            </main>
        </div>
    );
}
