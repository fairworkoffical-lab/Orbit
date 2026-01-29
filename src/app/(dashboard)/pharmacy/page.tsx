'use client';

import React, { useState } from 'react';
import { usePharmacyData, PharmacyOrder, PharmacyItem } from '@/hooks/usePharmacyData';
import { Search, User, Clock, CheckCircle2, DollarSign, Printer, ShoppingBag, Pill, XSquare, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { QueueItem } from '@/components/orbit/OperationalQueue'; // Reusing for consistency if needed, or just types

export default function PharmacyPage() {
    const { queue, metrics, processOrder } = usePharmacyData();
    const [selectedOrder, setSelectedOrder] = useState<PharmacyOrder | null>(null);
    const [items, setItems] = useState<PharmacyItem[]>([]);
    const [searchTerm, setSearchTerm] = useState('');

    // When an order is selected, load its items into local state for checkbox manipulation
    const handleSelectOrder = (order: PharmacyOrder) => {
        setSelectedOrder(order);
        setItems(order.items); // Deep copy handled by hook usually, but spread to be safe?Hook returns simple objects.
    };

    const toggleItem = (index: number) => {
        const newItems = [...items];
        newItems[index].isSelected = !newItems[index].isSelected;
        setItems(newItems);
    };

    const calculateTotal = () => {
        return items.filter(i => i.isSelected).reduce((sum, i) => sum + (i.price), 0);
    };

    const handleComplete = () => {
        if (!selectedOrder) return;

        const total = calculateTotal();
        const finalOrder: PharmacyOrder = {
            ...selectedOrder,
            items: items, // Save the selection state
            totalAmount: total
        };

        if (confirm(`Confirm payment of ₹${total}?`)) {
            processOrder(finalOrder, total);
            setSelectedOrder(null);
            setItems([]);
        }
    };

    const filteredQueue = queue.filter(q =>
        q.patientName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.id.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-slate-50 text-slate-900 font-sans flex flex-col">
            {/* TOP BAR */}
            <div className="bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between sticky top-0 z-10">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-emerald-100 rounded-lg text-emerald-700">
                        <ShoppingBag className="w-6 h-6" />
                    </div>
                    <div>
                        <h1 className="text-xl font-black text-slate-800 tracking-tight">PHARMACY DISPENSARY</h1>
                        <p className="text-xs text-slate-500 font-bold uppercase tracking-wider">Live Orders & Billing</p>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
                        <DollarSign className="w-4 h-4 text-emerald-600" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Today's Revenue</span>
                            <span className="text-base font-black text-slate-900">₹{metrics.dailyRevenue.toLocaleString()}</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-100 rounded-lg border border-slate-200">
                        <Clock className="w-4 h-4 text-blue-600" />
                        <div className="flex flex-col">
                            <span className="text-[10px] uppercase font-bold text-slate-400">Pending</span>
                            <span className="text-base font-black text-slate-900">{metrics.pendingOrders} Orders</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* MAIN CONTENT */}
            <div className="flex-1 flex overflow-hidden">

                {/* LEFT: QUEUE LIST */}
                <div className="w-1/3 border-r border-slate-200 bg-white flex flex-col">
                    <div className="p-4 border-b border-slate-100">
                        <div className="relative">
                            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                placeholder="Search Patient..."
                                className="w-full pl-9 pr-4 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-emerald-500 font-medium"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="flex-1 overflow-y-auto custom-scrollbar">
                        {filteredQueue.length === 0 ? (
                            <div className="p-8 text-center text-slate-400 text-sm italic">
                                No pending prescriptions.
                                <br />
                                Good job!
                            </div>
                        ) : (
                            filteredQueue.map(order => (
                                <div
                                    key={order.id}
                                    onClick={() => handleSelectOrder(order)}
                                    className={cn(
                                        "p-4 border-b border-slate-100 cursor-pointer transition-all hover:bg-slate-50",
                                        selectedOrder?.id === order.id ? "bg-emerald-50 border-l-4 border-l-emerald-500" : "border-l-4 border-l-transparent"
                                    )}
                                >
                                    <div className="flex justify-between items-start mb-1">
                                        <h3 className="font-bold text-slate-800">{order.patientName}</h3>
                                        <span className="text-xs font-mono text-slate-400 bg-slate-100 px-1.5 py-0.5 rounded">
                                            {new Date(order.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                    <div className="text-xs text-slate-500 mb-2 flex flex-col gap-0.5">
                                        <span>{order.age} Y / {order.gender}</span>
                                        <span className="text-slate-400">Dr. {order.doctorName}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <span className="text-xs font-bold bg-blue-50 text-blue-700 px-2 py-1 rounded-md border border-blue-100">
                                            {order.items.length} Items
                                        </span>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>

                {/* RIGHT: BILLING COUNTER */}
                <div className="flex-1 bg-slate-50 p-6 flex flex-col overflow-y-auto">
                    {selectedOrder ? (
                        <div className="max-w-3xl mx-auto w-full">
                            {/* BILL HEADER */}
                            <div className="bg-white rounded-t-2xl border border-slate-200 p-6 flex justify-between items-start shadow-sm relative overflow-hidden">
                                <div>
                                    <h2 className="text-2xl font-black text-slate-800 mb-1">{selectedOrder.patientName}</h2>
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <span className="flex items-center gap-1"><User className="w-4 h-4" /> {selectedOrder.age} Yrs / {selectedOrder.gender}</span>
                                        <span className="flex items-center gap-1"><Pill className="w-4 h-4" /> Rx by {selectedOrder.doctorName}</span>
                                    </div>
                                </div>
                                <div className="text-right">
                                    <div className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-1">Order ID</div>
                                    <div className="font-mono font-bold text-slate-700">{selectedOrder.id}</div>
                                </div>
                                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-emerald-400 to-blue-500" />
                            </div>

                            {/* LINE ITEMS */}
                            <div className="bg-white border-x border-slate-200 p-0 shadow-sm">
                                <table className="w-full text-sm text-left">
                                    <thead className="bg-slate-50 text-slate-500 font-bold uppercase text-xs border-b border-slate-200">
                                        <tr>
                                            <th className="px-6 py-3 w-10">Use</th>
                                            <th className="px-6 py-3">Medicine Info</th>
                                            <th className="px-6 py-3">Dosage</th>
                                            <th className="px-6 py-3 text-right">Price</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-100">
                                        {items.map((item, idx) => (
                                            <tr key={idx} className={cn("hover:bg-slate-50 transition-colors", !item.isSelected && "opacity-50 grayscale")}>
                                                <td className="px-6 py-4">
                                                    <input
                                                        type="checkbox"
                                                        checked={item.isSelected}
                                                        onChange={() => toggleItem(idx)}
                                                        className="w-5 h-5 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                                                    />
                                                </td>
                                                <td className="px-6 py-4">
                                                    <div className="font-bold text-slate-800 text-lg">{item.name}</div>
                                                    <div className="text-slate-500 text-xs">{item.instruction}</div>
                                                </td>
                                                <td className="px-6 py-4 font-mono text-slate-600">
                                                    {item.duration} Days
                                                </td>
                                                <td className="px-6 py-4 text-right font-bold text-slate-800">
                                                    ₹{item.price}
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            {/* BILL FOOTER */}
                            <div className="bg-slate-900 text-white rounded-b-2xl p-6 shadow-lg">
                                <div className="flex justify-between items-center mb-6">
                                    <div className="text-sm text-slate-400">
                                        Items Selected: <span className="font-bold text-white ml-2">{items.filter(i => i.isSelected).length}</span> / {items.length}
                                    </div>
                                    <div className="flex flex-col items-end">
                                        <span className="text-xs font-bold text-emerald-400 uppercase tracking-widest">Total Amount</span>
                                        <span className="text-4xl font-black">₹{calculateTotal().toLocaleString()}</span>
                                    </div>
                                </div>

                                <div className="flex gap-3">
                                    <button
                                        onClick={() => setSelectedOrder(null)}
                                        className="flex-1 py-3.5 rounded-xl border border-slate-700 text-slate-300 font-bold hover:bg-slate-800 transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleComplete}
                                        className="flex-[2] py-3.5 rounded-xl bg-emerald-500 text-white font-bold hover:bg-emerald-600 hover:scale-[1.02] transition-all shadow-lg shadow-emerald-900/20 flex items-center justify-center gap-2"
                                    >
                                        <CheckCircle2 className="w-5 h-5" />
                                        Complete & Pay
                                    </button>
                                </div>
                            </div>

                        </div>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center text-slate-400 opacity-60">
                            <ShoppingBag className="w-24 h-24 mb-4 text-slate-300" />
                            <h3 className="text-xl font-bold text-slate-500">No Order Selected</h3>
                            <p className="text-sm">Select a patient from the queue to start billing.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
