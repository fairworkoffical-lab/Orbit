'use client';

import React, { useState, useEffect } from 'react';
import { IpdService, Bed, Ward, BedCategory, BedStatus, AdmissionRequest, Building, RoomType, Amenity, Equipment, ClinicalNote, Prescription } from '@/lib/ipd-store';
import { Settings, RefreshCw, Filter, BedDouble, User, Activity, Plus, ArrowRight, CheckCircle2, Trash2, Edit3, DollarSign, Building2, Layers, X, Save } from 'lucide-react';
import { cn } from '@/lib/utils';

// --- TYPES ---
interface IpdData {
    categories: BedCategory[];
    wards: Ward[];
    beds: Bed[];
    requests: AdmissionRequest[];
    buildings: Building[];
    roomTypes: RoomType[];
    amenities: Amenity[];
    equipment: Equipment[];
}

// --- COLOR OPTIONS ---
const COLOR_OPTIONS = [
    { id: 'emerald', label: 'Green', value: 'bg-emerald-100 text-emerald-800' },
    { id: 'blue', label: 'Blue', value: 'bg-blue-100 text-blue-800' },
    { id: 'indigo', label: 'Indigo', value: 'bg-indigo-100 text-indigo-800' },
    { id: 'rose', label: 'Rose', value: 'bg-rose-100 text-rose-800' },
    { id: 'amber', label: 'Amber', value: 'bg-amber-100 text-amber-800' },
    { id: 'purple', label: 'Purple', value: 'bg-purple-100 text-purple-800' },
    { id: 'cyan', label: 'Cyan', value: 'bg-cyan-100 text-cyan-800' },
    { id: 'slate', label: 'Slate', value: 'bg-slate-100 text-slate-800' },
];

// --- CONFIGURATION MODULE ---
function ConfigurationModule({ data }: { data: IpdData }) {
    const [activeTab, setActiveTab] = useState<'pricing' | 'wards' | 'buildings' | 'master'>('pricing');
    const [editingCategory, setEditingCategory] = useState<BedCategory | null>(null);
    const [editingWard, setEditingWard] = useState<Ward | null>(null);
    const [showAddCategory, setShowAddCategory] = useState(false);
    const [showAddWard, setShowAddWard] = useState(false);

    // Building UI State
    const [isAddingBuilding, setIsAddingBuilding] = useState(false);
    const [newBuilding, setNewBuilding] = useState({ name: '', code: '' });
    const [addingFloorTo, setAddingFloorTo] = useState<string | null>(null);
    const [newFloorName, setNewFloorName] = useState('');

    // Master Data UI State
    const [showAddRoomType, setShowAddRoomType] = useState(false);
    const [showAddAmenity, setShowAddAmenity] = useState(false);
    const [showAddEquipment, setShowAddEquipment] = useState(false);

    const tabs = [
        { id: 'pricing', label: '💰 Pricing & Categories', icon: DollarSign },
        { id: 'wards', label: '🏥 Wards', icon: Building2 },
        { id: 'buildings', label: '🏢 Buildings', icon: Layers },
        { id: 'master', label: '⚙️ Master Data', icon: Settings },
    ];

    return (
        <div className="container mx-auto px-4 py-6">
            {/* Tab Navigation */}
            <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id as typeof activeTab)}
                        className={cn(
                            "px-4 py-2.5 rounded-xl font-bold text-sm whitespace-nowrap transition-all",
                            activeTab === tab.id
                                ? "bg-indigo-600 text-white shadow-lg shadow-indigo-200"
                                : "bg-white text-slate-600 border border-slate-200 hover:border-indigo-300"
                        )}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* PRICING TAB */}
            {activeTab === 'pricing' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Bed Categories & Pricing</h2>
                        <button
                            onClick={() => setShowAddCategory(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Category
                        </button>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.categories.map(cat => (
                            <div key={cat.id} className={cn("rounded-2xl border-2 overflow-hidden", cat.colorCode.split(' ')[0], "border-" + cat.colorCode.split(' ')[0].replace('bg-', '').replace('-100', '-200'))}>
                                <div className="p-4">
                                    <div className="flex items-start justify-between mb-3">
                                        <div className="flex items-center gap-2">
                                            <span className="text-2xl">{cat.icon}</span>
                                            <div>
                                                <h3 className="font-bold text-slate-800">{cat.name}</h3>
                                                <span className="text-xs font-mono text-slate-500">{cat.displayCode}</span>
                                            </div>
                                        </div>
                                        <div className="flex gap-1">
                                            <button
                                                onClick={() => setEditingCategory(cat)}
                                                className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-white rounded-lg transition-colors"
                                            >
                                                <Edit3 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => IpdService.deleteCategory(cat.id)}
                                                className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-white rounded-lg transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-600 mb-3 line-clamp-2">{cat.description}</p>

                                    <div className="grid grid-cols-2 gap-2 text-sm mb-3">
                                        <div className="bg-white/50 rounded-lg p-2">
                                            <span className="text-xs text-slate-500 block">Base/Day</span>
                                            <span className="font-bold text-slate-800">₹{(cat.baseCharge || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="bg-white/50 rounded-lg p-2">
                                            <span className="text-xs text-slate-500 block">Nursing</span>
                                            <span className="font-bold text-slate-800">₹{(cat.nursingCharge || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="bg-white/50 rounded-lg p-2">
                                            <span className="text-xs text-slate-500 block">Deposit</span>
                                            <span className="font-bold text-slate-800">₹{(cat.depositRequired || 0).toLocaleString()}</span>
                                        </div>
                                        <div className="bg-white/50 rounded-lg p-2">
                                            <span className="text-xs text-slate-500 block">Min Stay</span>
                                            <span className="font-bold text-slate-800">{cat.minStayHours || 0}hrs</span>
                                        </div>
                                    </div>

                                    <div className="flex flex-wrap gap-1">
                                        {cat.features.map((f, i) => (
                                            <span key={i} className="text-[10px] bg-white/70 px-2 py-0.5 rounded-full text-slate-600">{f}</span>
                                        ))}
                                    </div>

                                    <div className="mt-3 pt-3 border-t border-white/50 flex items-center gap-2 text-xs">
                                        {cat.insuranceCovered && <span className="bg-green-500 text-white px-2 py-0.5 rounded-full font-bold">Insurance ✓</span>}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* WARDS TAB */}
            {activeTab === 'wards' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Ward Configuration</h2>
                        <button
                            onClick={() => setShowAddWard(true)}
                            className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
                        >
                            <Plus className="w-4 h-4" />
                            Add Ward
                        </button>
                    </div>

                    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                        <table className="w-full">
                            <thead className="bg-slate-50 border-b border-slate-200">
                                <tr>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Ward Name</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Category</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Floor</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Gender</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Beds</th>
                                    <th className="text-left px-4 py-3 text-xs font-bold text-slate-500 uppercase">Visiting Hours</th>
                                    <th className="text-right px-4 py-3 text-xs font-bold text-slate-500 uppercase">Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {data.wards.map(ward => {
                                    const category = data.categories.find(c => c.id === ward.type);
                                    const wardBeds = data.beds.filter(b => b.wardId === ward.id);
                                    const occupiedCount = wardBeds.filter(b => b.status === 'OCCUPIED').length;

                                    return (
                                        <tr key={ward.id} className="border-b border-slate-100 hover:bg-slate-50">
                                            <td className="px-4 py-3">
                                                <div className="font-bold text-slate-800">{ward.name}</div>
                                                <div className="text-xs text-slate-500 font-mono">{ward.wardCode}</div>
                                            </td>
                                            <td className="px-4 py-3">
                                                <span className={cn("text-xs font-bold px-2 py-1 rounded", category?.colorCode)}>
                                                    {category?.name || 'Unknown'}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">Floor {ward.floor}</td>
                                            <td className="px-4 py-3">
                                                <span className={cn(
                                                    "text-xs font-bold px-2 py-1 rounded",
                                                    ward.genderPolicy === 'Male' ? 'bg-blue-100 text-blue-700' :
                                                        ward.genderPolicy === 'Female' ? 'bg-pink-100 text-pink-700' :
                                                            'bg-slate-100 text-slate-700'
                                                )}>
                                                    {ward.genderPolicy}
                                                </span>
                                            </td>
                                            <td className="px-4 py-3">
                                                <div className="flex items-center gap-2">
                                                    <span className="font-bold text-slate-800">{ward.totalBeds}</span>
                                                    <span className="text-xs text-slate-400">({occupiedCount} occ)</span>
                                                </div>
                                            </td>
                                            <td className="px-4 py-3 text-sm text-slate-600">{ward.visitingHours || '-'}</td>
                                            <td className="px-4 py-3 text-right">
                                                <div className="flex justify-end gap-1">
                                                    <button
                                                        onClick={() => setEditingWard(ward)}
                                                        className="p-1.5 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                                                    >
                                                        <Edit3 className="w-4 h-4" />
                                                    </button>
                                                    <button
                                                        onClick={() => IpdService.deleteWard(ward.id)}
                                                        className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                    >
                                                        <Trash2 className="w-4 h-4" />
                                                    </button>
                                                </div>
                                            </td>
                                        </tr>
                                    );
                                })}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {/* BUILDINGS TAB */}
            {activeTab === 'buildings' && (
                <div>
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-lg font-bold text-slate-800">Building & Floor Management</h2>
                        {!isAddingBuilding && (
                            <button
                                onClick={() => setIsAddingBuilding(true)}
                                className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-xl font-bold text-sm hover:bg-indigo-700 transition-colors"
                            >
                                <Plus className="w-4 h-4" />
                                Add Building
                            </button>
                        )}
                    </div>

                    {isAddingBuilding && (
                        <div className="bg-white p-4 rounded-2xl border border-indigo-200 shadow-sm mb-6 animate-in slide-in-from-top-2">
                            <h3 className="font-bold text-slate-700 mb-4">New Building Details</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1.5">Building Name</label>
                                    <input
                                        value={newBuilding.name}
                                        onChange={e => setNewBuilding({ ...newBuilding, name: e.target.value })}
                                        placeholder="e.g. Main Block"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                        autoFocus
                                    />
                                </div>
                                <div>
                                    <label className="text-xs font-bold text-slate-500 block mb-1.5">Building Code</label>
                                    <input
                                        value={newBuilding.code}
                                        onChange={e => setNewBuilding({ ...newBuilding, code: e.target.value })}
                                        placeholder="e.g. MB"
                                        className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    />
                                </div>
                            </div>
                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => setIsAddingBuilding(false)}
                                    className="px-4 py-2 text-slate-500 font-bold text-sm hover:bg-slate-50 rounded-lg transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={() => {
                                        if (newBuilding.name && newBuilding.code) {
                                            IpdService.addBuilding({
                                                name: newBuilding.name,
                                                code: newBuilding.code,
                                                floors: [{ number: 1, name: 'Ground Floor' }]
                                            });
                                            setIsAddingBuilding(false);
                                            setNewBuilding({ name: '', code: '' });
                                        }
                                    }}
                                    disabled={!newBuilding.name || !newBuilding.code}
                                    className="px-6 py-2 bg-indigo-600 text-white rounded-lg font-bold text-sm hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed shadow-lg shadow-indigo-100"
                                >
                                    Create Building
                                </button>
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {data.buildings.map(building => (
                            <div key={building.id} className="bg-white rounded-2xl border border-slate-200 overflow-hidden">
                                <div className="p-4 border-b border-slate-100">
                                    <div className="flex items-start justify-between">
                                        <div>
                                            <h3 className="font-bold text-slate-800 text-lg">{building.name}</h3>
                                            <span className="text-xs font-mono bg-slate-100 px-2 py-0.5 rounded text-slate-600">{building.code}</span>
                                        </div>
                                        <button
                                            onClick={() => IpdService.deleteBuilding(building.id)}
                                            className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                        >
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                                <div className="p-4">
                                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-2">Floors ({building.floors.length})</h4>
                                    <div className="space-y-1">
                                        {building.floors.map((floor, i) => (
                                            <div key={i} className="flex items-center gap-2 text-sm bg-slate-50 px-3 py-2 rounded-lg">
                                                <span className="w-6 h-6 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center text-xs font-bold">
                                                    {floor.number}
                                                </span>
                                                <span className="text-slate-700">{floor.name}</span>
                                            </div>
                                        ))}
                                    </div>
                                    {addingFloorTo === building.id ? (
                                        <div className="mt-3 bg-indigo-50 p-2 rounded-lg animate-in fade-in zoom-in duration-200">
                                            <input
                                                value={newFloorName}
                                                onChange={e => setNewFloorName(e.target.value)}
                                                placeholder="Floor Name (e.g. 2nd Floor)"
                                                className="w-full px-3 py-2 border border-indigo-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 mb-2 bg-white"
                                                autoFocus
                                                onKeyDown={e => {
                                                    if (e.key === 'Enter' && newFloorName) {
                                                        const updatedFloors = [...building.floors, { number: building.floors.length + 1, name: newFloorName }];
                                                        IpdService.updateBuilding(building.id, { floors: updatedFloors });
                                                        setAddingFloorTo(null);
                                                        setNewFloorName('');
                                                    }
                                                }}
                                            />
                                            <div className="flex justify-end gap-2">
                                                <button
                                                    onClick={() => setAddingFloorTo(null)}
                                                    className="p-1.5 text-slate-400 hover:text-slate-600"
                                                >
                                                    <X className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        if (newFloorName) {
                                                            const updatedFloors = [...building.floors, { number: building.floors.length + 1, name: newFloorName }];
                                                            IpdService.updateBuilding(building.id, { floors: updatedFloors });
                                                            setAddingFloorTo(null);
                                                            setNewFloorName('');
                                                        }
                                                    }}
                                                    className="px-3 py-1.5 bg-indigo-600 text-white rounded-md text-xs font-bold shadow-sm"
                                                >
                                                    Add
                                                </button>
                                            </div>
                                        </div>
                                    ) : (
                                        <button
                                            onClick={() => {
                                                setAddingFloorTo(building.id);
                                                setNewFloorName(`Floor ${building.floors.length}`);
                                            }}
                                            className="mt-3 w-full text-xs text-indigo-600 font-bold py-2 border border-dashed border-indigo-200 rounded-lg hover:bg-indigo-50 transition-colors flex items-center justify-center gap-1"
                                        >
                                            <Plus className="w-3 h-3" />
                                            Add Floor
                                        </button>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* MASTER DATA TAB */}
            {activeTab === 'master' && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* Room Types */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Room Types</h3>
                            <button
                                onClick={() => setShowAddRoomType(true)}
                                className="text-xs text-indigo-600 font-bold hover:text-indigo-800"
                            >
                                + Add
                            </button>
                        </div>
                        <div className="space-y-2">
                            {data.roomTypes.map(rt => (
                                <div key={rt.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div>
                                        <span className="font-bold text-slate-700">{rt.name}</span>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-xs bg-slate-200 px-2 py-0.5 rounded text-slate-600">Max {rt.maxBeds} beds</span>
                                            {rt.surcharge > 0 && <span className="text-xs bg-amber-100 px-2 py-0.5 rounded text-amber-700">+₹{rt.surcharge}/day</span>}
                                            {rt.isIsolation && <span className="text-xs bg-red-100 px-2 py-0.5 rounded text-red-700">Isolation</span>}
                                            {rt.isSuite && <span className="text-xs bg-purple-100 px-2 py-0.5 rounded text-purple-700">Suite</span>}
                                        </div>
                                    </div>
                                    <button onClick={() => IpdService.deleteRoomType(rt.id)} className="text-slate-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Amenities */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Amenities</h3>
                            <button
                                onClick={() => setShowAddAmenity(true)}
                                className="text-xs text-indigo-600 font-bold hover:text-indigo-800"
                            >
                                + Add
                            </button>
                        </div>
                        <div className="flex flex-wrap gap-2">
                            {data.amenities.map(am => (
                                <div key={am.id} className="flex items-center gap-2 px-3 py-2 bg-slate-50 rounded-xl group">
                                    <span className="text-lg">{am.icon}</span>
                                    <span className="text-sm font-medium text-slate-700">{am.name}</span>
                                    {am.isDefault && <span className="text-[10px] bg-green-100 text-green-700 px-1 rounded">Default</span>}
                                    <button onClick={() => IpdService.deleteAmenity(am.id)} className="text-slate-300 hover:text-red-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <X className="w-3 h-3" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Equipment */}
                    <div className="bg-white rounded-2xl border border-slate-200 p-4 lg:col-span-2">
                        <div className="flex justify-between items-center mb-4">
                            <h3 className="font-bold text-slate-800">Medical Equipment</h3>
                            <button
                                onClick={() => setShowAddEquipment(true)}
                                className="text-xs text-indigo-600 font-bold hover:text-indigo-800"
                            >
                                + Add Equipment
                            </button>
                        </div>
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                            {data.equipment.map(eq => (
                                <div key={eq.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-xl">
                                    <div>
                                        <span className="font-bold text-slate-700 text-sm">{eq.name}</span>
                                        <div className="flex gap-2 mt-1">
                                            <span className="text-xs font-mono bg-slate-200 px-2 py-0.5 rounded text-slate-600">{eq.code}</span>
                                            <span className="text-xs bg-emerald-100 px-2 py-0.5 rounded text-emerald-700">₹{eq.dailyCharge}/day</span>
                                            <span className="text-xs bg-indigo-100 px-2 py-0.5 rounded text-indigo-700 font-bold">Qty: {eq.totalQuantity || 0}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => IpdService.deleteEquipment(eq.id)} className="text-slate-400 hover:text-red-500">
                                        <Trash2 className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* ADD/EDIT CATEGORY MODAL */}
            {(showAddCategory || editingCategory) && (
                <CategoryModal
                    category={editingCategory}
                    onClose={() => { setShowAddCategory(false); setEditingCategory(null); }}
                    categories={data.categories}
                    amenities={data.amenities}
                    roomTypes={data.roomTypes}
                />
            )}

            {/* ADD/EDIT WARD MODAL */}
            {(showAddWard || editingWard) && (
                <WardModal
                    ward={editingWard}
                    categories={data.categories}
                    buildings={data.buildings}
                    onClose={() => { setShowAddWard(false); setEditingWard(null); }}
                />
            )}

            {showAddRoomType && (
                <RoomTypeModal onClose={() => setShowAddRoomType(false)} />
            )}

            {showAddAmenity && (
                <AmenityModal onClose={() => setShowAddAmenity(false)} />
            )}

            {showAddEquipment && (
                <EquipmentModal onClose={() => setShowAddEquipment(false)} />
            )}
        </div>
    );
}

function RoomTypeModal({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState({ name: '', maxBeds: 1, surcharge: 0, isIsolation: false, isSuite: false });
    const handleSave = () => {
        if (!form.name) return;
        IpdService.addRoomType(form);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Add Room Type</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Name</label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg p-2 text-sm" placeholder="e.g. Single Room" autoFocus />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Max Beds</label>
                        <input type="number" value={form.maxBeds} onChange={e => setForm({ ...form, maxBeds: parseInt(e.target.value) || 1 })} className="w-full border rounded-lg p-2 text-sm" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Surcharge (₹/day)</label>
                        <input type="number" value={form.surcharge} onChange={e => setForm({ ...form, surcharge: parseInt(e.target.value) || 0 })} className="w-full border rounded-lg p-2 text-sm" />
                    </div>
                    <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={form.isIsolation} onChange={e => setForm({ ...form, isIsolation: e.target.checked })} /> Isolation
                        </label>
                        <label className="flex items-center gap-2 text-sm text-slate-700">
                            <input type="checkbox" checked={form.isSuite} onChange={e => setForm({ ...form, isSuite: e.target.checked })} /> Suite
                        </label>
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="text-slate-500 font-bold text-sm px-3 py-2">Cancel</button>
                    <button onClick={handleSave} className="bg-indigo-600 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">Save</button>
                </div>
            </div>
        </div>
    );
}

function AmenityModal({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState({ name: '', icon: '✨' });
    const handleSave = () => {
        if (!form.name) return;
        IpdService.addAmenity({ ...form, isDefault: false });
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Add Amenity</h3>
                <div className="space-y-3">
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Name</label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg p-2 text-sm" placeholder="e.g. Smart TV" autoFocus />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Icon (Emoji)</label>
                        <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="w-full border rounded-lg p-2 text-sm text-center text-xl" />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="text-slate-500 font-bold text-sm px-3 py-2">Cancel</button>
                    <button onClick={handleSave} className="bg-indigo-600 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">Save</button>
                </div>
            </div>
        </div>
    );
}

function EquipmentModal({ onClose }: { onClose: () => void }) {
    const [form, setForm] = useState({ name: '', code: '', dailyCharge: 0, totalQuantity: 10, icon: '🔌' });
    const handleSave = () => {
        if (!form.name || !form.code) return;
        IpdService.addEquipment(form);
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
            <div className="bg-white w-full max-w-sm rounded-2xl shadow-2xl p-6">
                <h3 className="text-lg font-bold text-slate-800 mb-4">Add Equipment</h3>
                <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="col-span-2">
                        <label className="text-xs font-bold text-slate-500 block mb-1">Name</label>
                        <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="w-full border rounded-lg p-2 text-sm" placeholder="e.g. Ventilator" autoFocus />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Code</label>
                        <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value.toUpperCase() })} className="w-full border rounded-lg p-2 text-sm uppercase" placeholder="VENT" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Icon</label>
                        <input value={form.icon} onChange={e => setForm({ ...form, icon: e.target.value })} className="w-full border rounded-lg p-2 text-sm text-center" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Charge (₹/day)</label>
                        <input type="number" value={form.dailyCharge} onChange={e => setForm({ ...form, dailyCharge: parseInt(e.target.value) || 0 })} className="w-full border rounded-lg p-2 text-sm" />
                    </div>
                    <div>
                        <label className="text-xs font-bold text-slate-500 block mb-1">Total Qty</label>
                        <input type="number" value={form.totalQuantity} onChange={e => setForm({ ...form, totalQuantity: parseInt(e.target.value) || 0 })} className="w-full border rounded-lg p-2 text-sm" />
                    </div>
                </div>
                <div className="flex justify-end gap-2 mt-6">
                    <button onClick={onClose} className="text-slate-500 font-bold text-sm px-3 py-2">Cancel</button>
                    <button onClick={handleSave} className="bg-indigo-600 text-white font-bold text-sm px-4 py-2 rounded-lg hover:bg-indigo-700">Save</button>
                </div>
            </div>
        </div>
    );
}

// --- CATEGORY MODAL ---
function CategoryModal({ category, onClose, categories, amenities, roomTypes }: { category: BedCategory | null; onClose: () => void; categories: BedCategory[]; amenities: Amenity[]; roomTypes: RoomType[] }) {
    const [form, setForm] = useState<Omit<BedCategory, 'id'>>({
        name: category?.name || '',
        displayCode: category?.displayCode || '',
        baseCharge: category?.baseCharge || 500,
        nursingCharge: category?.nursingCharge || 200,
        depositRequired: category?.depositRequired || 5000,
        colorCode: category?.colorCode || COLOR_OPTIONS[0].value,
        icon: category?.icon || '🛏️',
        description: category?.description || '',
        minStayHours: category?.minStayHours || 24,
        insuranceCovered: category?.insuranceCovered ?? true,
        features: category?.features || [],
        roomTypeId: category?.roomTypeId || ''
    });

    const handleSave = () => {
        if (!form.name || !form.displayCode) {
            alert('Name and Display Code are required');
            return;
        }
        if (category) {
            IpdService.updateCategory(category.id, form);
        } else {
            IpdService.addCategory(form);
        }
        onClose();
    };



    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-100 shrink-0">
                    <h2 className="text-xl font-bold text-slate-800">{category ? 'Edit Category' : 'Add New Category'}</h2>
                </div>

                <div className="p-6 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Name *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., General Ward"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Display Code *</label>
                            <input
                                type="text"
                                value={form.displayCode}
                                onChange={e => setForm({ ...form, displayCode: e.target.value.toUpperCase() })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., GEN"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Icon (Emoji)</label>
                            <input
                                type="text"
                                value={form.icon}
                                onChange={e => setForm({ ...form, icon: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm text-center text-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Color Theme</label>
                            <select
                                value={form.colorCode}
                                onChange={e => setForm({ ...form, colorCode: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {COLOR_OPTIONS.map(opt => (
                                    <option key={opt.id} value={opt.value}>{opt.label}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Room Type Link</label>
                        <select
                            value={form.roomTypeId || ''}
                            onChange={e => setForm({ ...form, roomTypeId: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">No Link (Flexible Capacity)</option>
                            {roomTypes.map(rt => (
                                <option key={rt.id} value={rt.id}>{rt.name} (Max {rt.maxBeds} beds)</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1">Linking to a Room Type enforces maximum bed limits.</p>
                    </div>

                    <div className="mb-4">
                        <label className="block text-xs font-bold text-slate-500 mb-1">Room Type Link</label>
                        <select
                            value={form.roomTypeId || ''}
                            onChange={e => setForm({ ...form, roomTypeId: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                            <option value="">No Link (Flexible Capacity)</option>
                            {roomTypes.map(rt => (
                                <option key={rt.id} value={rt.id}>{rt.name} (Max {rt.maxBeds} beds)</option>
                            ))}
                        </select>
                        <p className="text-[10px] text-slate-400 mt-1">Linking to a Room Type enforces maximum bed limits.</p>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Description</label>
                        <textarea
                            value={form.description}
                            onChange={e => setForm({ ...form, description: e.target.value })}
                            rows={2}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            placeholder="Brief description of this category..."
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Base Charge (₹/day)</label>
                            <input
                                type="number"
                                value={form.baseCharge}
                                onChange={e => setForm({ ...form, baseCharge: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Nursing Charge (₹/day)</label>
                            <input
                                type="number"
                                value={form.nursingCharge}
                                onChange={e => setForm({ ...form, nursingCharge: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Deposit Required (₹)</label>
                            <input
                                type="number"
                                value={form.depositRequired}
                                onChange={e => setForm({ ...form, depositRequired: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Min Stay (hours)</label>
                            <input
                                type="number"
                                value={form.minStayHours}
                                onChange={e => setForm({ ...form, minStayHours: parseInt(e.target.value) || 0 })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="flex items-center gap-2 cursor-pointer">
                            <input
                                type="checkbox"
                                checked={form.insuranceCovered}
                                onChange={e => setForm({ ...form, insuranceCovered: e.target.checked })}
                                className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                            />
                            <span className="text-sm text-slate-700">Insurance Covered</span>
                        </label>
                    </div>

                    <div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Included Amenities</label>
                            <div className="grid grid-cols-2 gap-2 mt-2 border border-slate-200 rounded-lg p-3 max-h-40 overflow-y-auto">
                                {amenities.map(am => (
                                    <label key={am.id} className="flex items-center gap-2 cursor-pointer hover:bg-slate-50 p-1 rounded transition-colors">
                                        <input
                                            type="checkbox"
                                            checked={form.features.includes(am.name)}
                                            onChange={e => {
                                                if (e.target.checked) {
                                                    setForm({ ...form, features: [...form.features, am.name] });
                                                } else {
                                                    setForm({ ...form, features: form.features.filter(f => f !== am.name) });
                                                }
                                            }}
                                            className="w-4 h-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                                        />
                                        <span className="text-lg">{am.icon}</span>
                                        <span className="text-sm text-slate-700">{am.name}</span>
                                    </label>
                                ))}
                                {amenities.length === 0 && (
                                    <div className="col-span-2 text-center text-xs text-slate-400 py-2">
                                        No amenities configured in Master Data.
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        {category ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- WARD MODAL ---
function WardModal({ ward, categories, buildings, onClose }: { ward: Ward | null; categories: BedCategory[]; buildings: Building[]; onClose: () => void }) {
    const [form, setForm] = useState<Omit<Ward, 'id'>>({
        name: ward?.name || '',
        wardCode: ward?.wardCode || '',
        type: ward?.type || categories[0]?.id || '',
        buildingId: ward?.buildingId || buildings[0]?.id || '',
        genderPolicy: ward?.genderPolicy || 'Any',
        totalBeds: ward?.totalBeds || 10,
        floor: ward?.floor || 1,
        bedNamingPattern: ward?.bedNamingPattern || 'B-{FLOOR}0{SEQ}',
        visitingHours: ward?.visitingHours || '10:00 AM - 6:00 PM',
        nurseStation: ward?.nurseStation || ''
    });

    const selectedBuilding = buildings.find(b => b.id === form.buildingId);

    // Auto-select first floor when building changes if current floor is invalid
    useEffect(() => {
        if (selectedBuilding && selectedBuilding.floors.length > 0) {
            const isValid = selectedBuilding.floors.some(f => f.number === form.floor);
            if (!isValid) {
                setForm(prev => ({ ...prev, floor: selectedBuilding.floors[0].number }));
            }
        }
    }, [form.buildingId, selectedBuilding]);

    const handleSave = () => {
        if (!form.name || !form.wardCode) {
            alert('Name and Ward Code are required');
            return;
        }
        if (ward) {
            IpdService.updateWard(ward.id, form);
        } else {
            IpdService.addWard(form);
        }
        onClose();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden max-h-[90vh] flex flex-col">
                <div className="p-6 border-b border-slate-100 shrink-0">
                    <h2 className="text-xl font-bold text-slate-800">{ward ? 'Edit Ward' : 'Add New Ward'}</h2>
                </div>

                <div className="p-6 overflow-y-auto space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Ward Name *</label>
                            <input
                                type="text"
                                value={form.name}
                                onChange={e => setForm({ ...form, name: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., Male General Ward"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Ward Code *</label>
                            <input
                                type="text"
                                value={form.wardCode}
                                onChange={e => setForm({ ...form, wardCode: e.target.value.toUpperCase() })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., MGW"
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Category</label>
                            <select
                                value={form.type}
                                onChange={e => setForm({ ...form, type: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {categories.map(cat => (
                                    <option key={cat.id} value={cat.id}>{cat.name}</option>
                                ))}
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Building</label>
                            <select
                                value={form.buildingId}
                                onChange={e => setForm({ ...form, buildingId: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                {buildings.map(b => (
                                    <option key={b.id} value={b.id}>{b.name}</option>
                                ))}
                            </select>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Floor</label>
                            {selectedBuilding && selectedBuilding.floors.length > 0 ? (
                                <select
                                    value={form.floor}
                                    onChange={e => setForm({ ...form, floor: parseInt(e.target.value) })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                >
                                    {selectedBuilding.floors.map(f => (
                                        <option key={f.number} value={f.number}>{f.name}</option>
                                    ))}
                                </select>
                            ) : (
                                <input
                                    type="number"
                                    value={form.floor}
                                    onChange={e => setForm({ ...form, floor: parseInt(e.target.value) || 1 })}
                                    className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                    min={1}
                                    placeholder="Floor No."
                                />
                            )}
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Gender Policy</label>
                            <select
                                value={form.genderPolicy}
                                onChange={e => setForm({ ...form, genderPolicy: e.target.value as Ward['genderPolicy'] })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            >
                                <option value="Any">Any</option>
                                <option value="Male">Male Only</option>
                                <option value="Female">Female Only</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Total Beds</label>
                            <input
                                type="number"
                                value={form.totalBeds}
                                onChange={e => setForm({ ...form, totalBeds: parseInt(e.target.value) || 1 })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                min={1}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-slate-500 mb-1">Bed Naming Pattern</label>
                        <input
                            type="text"
                            value={form.bedNamingPattern}
                            onChange={e => setForm({ ...form, bedNamingPattern: e.target.value })}
                            className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        <p className="text-[10px] text-slate-400 mt-1">Use: {'{FLOOR}'} for floor, {'{SEQ}'} for sequence (01, 02...)</p>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Visiting Hours</label>
                            <input
                                type="text"
                                value={form.visitingHours}
                                onChange={e => setForm({ ...form, visitingHours: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., 10:00 AM - 6:00 PM"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 mb-1">Nurse Station</label>
                            <input
                                type="text"
                                value={form.nurseStation}
                                onChange={e => setForm({ ...form, nurseStation: e.target.value })}
                                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                placeholder="e.g., Station A"
                            />
                        </div>
                    </div>
                </div>

                <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                    <button onClick={onClose} className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors">
                        Cancel
                    </button>
                    <button onClick={handleSave} className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2">
                        <Save className="w-4 h-4" />
                        {ward ? 'Update' : 'Create'}
                    </button>
                </div>
            </div>
        </div>
    );
}

// --- COMPONENTS ---

// 1. BedCard Component
function BedCard({
    bed,
    category,
    onClick,
    isEditing,
    onEditStart,
    onEditSave,
    onEditCancel
}: {
    bed: Bed;
    category: BedCategory;
    onClick: () => void;
    isEditing?: boolean;
    onEditStart?: (b: Bed) => void;
    onEditSave?: (b: Bed, val: string) => void;
    onEditCancel?: () => void;
}) {
    const statusColors: Record<BedStatus, string> = {
        'AVAILABLE': 'bg-white border-slate-200 hover:border-emerald-400 hover:shadow-md cursor-pointer',
        'OCCUPIED': 'bg-red-50 border-red-200',
        'RESERVED': 'bg-amber-50 border-amber-200',
        'CLEANING': 'bg-blue-50 border-blue-200 animate-pulse',
        'BLOCKED': 'bg-slate-100 border-slate-200 opacity-60'
    };

    const statusBadges: Record<BedStatus, { icon: string, label: string, color: string }> = {
        'AVAILABLE': { icon: '🟢', label: 'Open', color: 'text-emerald-600' },
        'OCCUPIED': { icon: '🔴', label: 'Occupied', color: 'text-red-600' },
        'RESERVED': { icon: '🟡', label: 'Reserved', color: 'text-amber-600' },
        'CLEANING': { icon: '🧹', label: 'Cleaning', color: 'text-blue-600' },
        'BLOCKED': { icon: '⛔', label: 'Blocked', color: 'text-slate-500' },
    };

    const meta = statusBadges[bed.status];

    return (
        <div
            onClick={onClick}
            className={cn("p-3 rounded-xl border-2 transition-all relative group", statusColors[bed.status])}
        >
            <div className="flex justify-between items-start mb-2 relative">
                <span className="font-mono font-bold text-slate-700">{bed.bedNumber}</span>
                <span className={cn("text-[10px] font-bold uppercase", meta.color)}>{meta.label}</span>
                <span className={cn("text-[10px] font-bold uppercase", meta.color)}>{meta.label}</span>
                {!isEditing && onEditStart && (
                    <button
                        onClick={(e) => {
                            e.stopPropagation();
                            onEditStart(bed);
                        }}
                        className="absolute -top-1 -right-1 opacity-0 group-hover:opacity-100 p-1.5 bg-white text-slate-400 hover:text-indigo-600 rounded-full shadow-sm border border-slate-100 transition-all z-10"
                        title="Edit Bed Number"
                    >
                        <Edit3 className="w-3 h-3" />
                    </button>
                )}
            </div>

            {isEditing ? (
                <div className="py-2" onClick={e => e.stopPropagation()}>
                    <input
                        autoFocus
                        defaultValue={bed.bedNumber}
                        onBlur={(e) => onEditSave && onEditSave(bed, e.target.value)}
                        onKeyDown={(e) => {
                            if (e.key === 'Enter' && onEditSave) onEditSave(bed, e.currentTarget.value);
                            if (e.key === 'Escape' && onEditCancel) onEditCancel();
                        }}
                        className="w-full font-mono font-bold text-center border-2 border-indigo-400 focus:outline-none focus:ring-2 focus:ring-indigo-200 rounded-lg py-1 px-1 text-slate-800 bg-white"
                    />
                    <div className="text-[10px] text-center text-indigo-500 font-bold mt-1">Press Enter</div>
                </div>
            ) : (
                <>
                    {bed.status === 'OCCUPIED' || bed.status === 'RESERVED' ? (
                        <div className="text-sm">
                            <p className="font-bold text-slate-800 truncate">{bed.patientName || 'Unknown'}</p>
                            <p className="text-[10px] text-slate-500 font-mono">ID: {bed.patientId || '---'}</p>
                        </div>
                    ) : (
                        <div className="text-center py-2 opacity-50">
                            <BedDouble className={cn("w-6 h-6 mx-auto mb-1", bed.status === 'AVAILABLE' ? "text-emerald-200" : "text-slate-300")} />
                            <span className="text-[10px] text-slate-400">{category.name}</span>
                        </div>
                    )}
                </>
            )}
        </div>
    );
}

// 2. Ward Section Component
// 2. Ward Section Component
function WardSection({
    ward,
    beds,
    category,
    onBedClick,
    isEditingWard,
    onEditWardStart,
    onEditWardSave,
    onEditWardCancel,
    editingBedId,
    onEditBedStart,
    onEditBedSave,
    onEditBedCancel
}: {
    ward: Ward;
    beds: Bed[];
    category: BedCategory;
    onBedClick: (b: Bed) => void;
    isEditingWard?: boolean;
    onEditWardStart?: (w: Ward) => void;
    onEditWardSave?: (w: Ward, val: string) => void;
    onEditWardCancel?: () => void;
    editingBedId?: string | null;
    onEditBedStart?: (b: Bed) => void;
    onEditBedSave?: (b: Bed, val: string) => void;
    onEditBedCancel?: () => void;
}) {
    return (
        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-200 mb-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                    <div className={cn("w-2 h-8 rounded-full", category.colorCode.split(' ')[0])}></div>
                    <div>
                        <div className="flex items-center gap-2">
                            {isEditingWard ? (
                                <input
                                    autoFocus
                                    defaultValue={ward.name}
                                    onBlur={(e) => onEditWardSave && onEditWardSave(ward, e.target.value)}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' && onEditWardSave) onEditWardSave(ward, e.currentTarget.value);
                                        if (e.key === 'Escape' && onEditWardCancel) onEditWardCancel();
                                    }}
                                    className="font-bold text-slate-700 text-lg border-b-2 border-indigo-500 focus:outline-none bg-transparent min-w-[200px]"
                                    onClick={e => e.stopPropagation()}
                                />
                            ) : (
                                <h3 className="font-bold text-slate-700 text-lg">{ward.name}</h3>
                            )}

                            {!isEditingWard && onEditWardStart && (
                                <button
                                    onClick={() => onEditWardStart(ward)}
                                    className="p-1 text-slate-300 hover:text-indigo-600 transition-colors opacity-0 group-hover:opacity-100"
                                    title="Rename Ward"
                                >
                                    <Edit3 className="w-3 h-3" />
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2 text-xs text-slate-500">
                            <span>Floor {ward.floor}</span>
                            <span>•</span>
                            <span className={cn("font-medium", category.colorCode.split(' ')[1])}>{category.name}</span>
                            <span>•</span>
                            <span>{ward.genderPolicy} Only</span>
                        </div>
                    </div>
                </div>
                {/* Stats */}
                <div className="flex gap-4 text-xs font-mono">
                    <div className="text-emerald-600">
                        OPEN: <strong>{beds.filter(b => b.status === 'AVAILABLE').length}</strong>
                    </div>
                    <div className="text-red-600">
                        OCC: <strong>{beds.filter(b => b.status === 'OCCUPIED').length}</strong>
                    </div>
                </div>
            </div>

            {/* Bed Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-3">
                {beds.map(bed => (
                    <BedCard
                        key={bed.id}
                        bed={bed}
                        category={category}
                        onClick={() => onBedClick(bed)}
                        isEditing={editingBedId === bed.id}
                        onEditStart={onEditBedStart}
                        onEditSave={onEditBedSave}
                        onEditCancel={onEditBedCancel}
                    />
                ))}
            </div>
        </div>
    );
}

// --- MAIN PAGE ---

export default function IpdPage() {
    const [view, setView] = useState<'LIVE' | 'CONFIG'>('LIVE');
    const [data, setData] = useState<IpdData | null>(null);
    const [selectedBed, setSelectedBed] = useState<Bed | null>(null);

    // Admission Processing State
    const [processingRequest, setProcessingRequest] = useState<AdmissionRequest | null>(null);
    const [selectedBedForAdmission, setSelectedBedForAdmission] = useState<string>('');

    // Inline Editing State
    const [editingBedId, setEditingBedId] = useState<string | null>(null);
    const [editingWardId, setEditingWardId] = useState<string | null>(null);

    // Bed Detail State
    // Bed Detail State
    const [bedDetailTab, setBedDetailTab] = useState<'details' | 'notes' | 'prescriptions'>('details');
    const [newNote, setNewNote] = useState<{ text: string; type: 'ROUND' | 'DIAGNOSIS' | 'INSTRUCTION' | 'COMPLAINT' }>({ text: '', type: 'ROUND' });
    const [newRx, setNewRx] = useState({ name: '', dosage: { m: '0', a: '0', n: '0' }, duration: '3', instruction: 'After Food' });


    // Initial Load
    useEffect(() => {
        IpdService.init();
        const load = () => setData(IpdService.getData());
        load();

        window.addEventListener('storage', load);
        const interval = setInterval(load, 2000); // Poll for cross-tab sync
        return () => {
            window.removeEventListener('storage', load);
            clearInterval(interval);
        };
    }, []);

    const handleRenameWardSave = (ward: Ward, newName: string) => {
        if (newName && newName.trim() !== '' && newName.trim() !== ward.name) {
            IpdService.updateWard(ward.id, { name: newName.trim() });
        }
        setEditingWardId(null);
    };

    const handleRenameBedSave = (bed: Bed, newNumber: string) => {
        if (newNumber && newNumber.trim() !== '' && newNumber.trim() !== bed.bedNumber) {
            IpdService.updateBed(bed.id, { bedNumber: newNumber.trim() });
        }
        setEditingBedId(null);
    };

    const handleBedAction = (bed: Bed, action: string) => {
        if (!data) return;

        if (action === 'CLEAN') {
            IpdService.updateBedStatus(bed.id, 'AVAILABLE');
        } else if (action === 'MAINTENANCE') {
            IpdService.updateBedStatus(bed.id, 'BLOCKED');
        } else if (action === 'OPEN') {
            IpdService.updateBedStatus(bed.id, 'AVAILABLE');
        } else if (action === 'DISCHARGE') {
            if (confirm(`Discharge patient ${bed.patientName}? Bed will be marked for Cleaning.`)) {
                IpdService.updateBedStatus(bed.id, 'CLEANING');
            }
        }
        setSelectedBed(null);
    };

    const handleAllocateBed = () => {
        if (!processingRequest || !selectedBedForAdmission) return;

        IpdService.processAdmission(processingRequest.id, selectedBedForAdmission);

        // Reset
        setProcessingRequest(null);
        setSelectedBedForAdmission('');
    };

    if (!data) return <div className="p-10 text-center">Booting System...</div>;

    // @ts-ignore
    const pendingRequests = data.requests?.filter(r => r.status === 'PATIENT_SELECTED' || r.status === 'PENDING') || [];

    return (
        <div className="min-h-screen bg-slate-50 pb-20">

            {/* PENDING ADMISSIONS BANNER */}
            {pendingRequests.length > 0 && (
                <div className="bg-indigo-600 text-white px-4 py-3 shadow-md relative z-40">
                    <div className="container mx-auto flex justify-between items-center">
                        <div className="flex items-center gap-3">
                            <span className="bg-white/20 p-1.5 rounded-lg animate-pulse">🚨</span>
                            <span className="font-bold">
                                {pendingRequests.length} Pending Admission{pendingRequests.length > 1 ? 's' : ''}
                            </span>
                        </div>
                        <div className="text-xs opacity-90 flex gap-4 overflow-x-auto pb-1">
                            {pendingRequests.map((r: any) => (
                                <button
                                    key={r.id}
                                    onClick={() => setProcessingRequest(r)}
                                    className="flex items-center gap-2 bg-indigo-700/50 hover:bg-white hover:text-indigo-700 hover:shadow-lg transition-all px-3 py-1 rounded-full border border-indigo-400/30 cursor-pointer"
                                >
                                    <span>{r.patientName}</span>
                                    <span className="opacity-50">→</span>
                                    <span className="font-mono font-bold text-amber-300 group-hover:text-indigo-700">
                                        {data?.categories?.find(c => c.id === (r.patientSelection || r.recommendedCategory))?.name}
                                    </span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}

            {/* Toolbar */}
            <div className="sticky top-16 z-30 bg-white border-b border-slate-200 px-4 py-3 shadow-sm">
                <div className="container mx-auto flex justify-between items-center">

                    <div className="flex items-center gap-4">
                        <div className="p-2 bg-indigo-100 text-indigo-700 rounded-lg">
                            <Activity className="w-5 h-5" />
                        </div>
                        <div>
                            <h1 className="text-lg font-bold text-slate-800 leading-tight">IPD Operations Console</h1>
                            <p className="text-xs text-slate-500">
                                Total Occupancy: <strong className="text-slate-700">{data.beds.length > 0 ? Math.round((data.beds.filter(b => b.status === 'OCCUPIED').length / data.beds.length) * 100) : 0}%</strong>
                                <span className="mx-2 text-slate-300">|</span>
                                Available Beds: <strong className="text-emerald-600">{data.beds.filter(b => b.status === 'AVAILABLE').length}</strong>
                            </p>
                        </div>
                    </div>

                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button
                            onClick={() => setView('LIVE')}
                            className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", view === 'LIVE' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                        >
                            Live Console
                        </button>
                        <button
                            onClick={() => setView('CONFIG')}
                            className={cn("px-4 py-1.5 text-xs font-bold rounded-md transition-all", view === 'CONFIG' ? "bg-white text-indigo-600 shadow-sm" : "text-slate-500 hover:text-slate-700")}
                        >
                            Ref Data & Pricing
                        </button>
                    </div>

                    <button
                        onClick={() => IpdService.reset()}
                        className="text-xs text-red-400 hover:text-red-600 font-bold px-3 py-1 bg-red-50 rounded-full"
                    >
                        Reset System
                    </button>
                </div>
            </div>

            {/* LIVE VIEW */}
            {view === 'LIVE' && (
                <div className="container mx-auto px-4 py-6">

                    {/* ADMISSION QUEUE SECTION */}
                    {pendingRequests.length > 0 && (
                        <div className="mb-8 animate-in slide-in-from-top-4 duration-500">
                            <h3 className="text-sm font-bold text-slate-400 uppercase tracking-widest mb-4 flex items-center gap-2">
                                <User className="w-4 h-4" />
                                Appointment Request Queue ({pendingRequests.length})
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {pendingRequests.map((r: any) => (
                                    <div key={r.id} className="bg-white rounded-xl shadow-sm border border-indigo-100 overflow-hidden hover:shadow-md transition-all group">
                                        <div className="p-4 flex items-start gap-4">
                                            <div className="w-12 h-12 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xl shrink-0">
                                                {r.patientName.charAt(0)}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <h4 className="font-bold text-slate-800 truncate">{r.patientName}</h4>
                                                <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
                                                    <span className="bg-slate-100 px-1.5 py-0.5 rounded">{r.patientAge}yr / {r.patientGender}</span>
                                                    <span>•</span>
                                                    <span className="truncate">Dr. {r.doctorName}</span>
                                                </div>
                                                <div className="mt-2 flex items-center gap-2">
                                                    <div className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded border border-amber-100">
                                                        Req: {data?.categories.find(c => c.id === (r.patientSelection || r.recommendedCategory))?.name}
                                                    </div>
                                                    {r.urgency === 'EMERGENCY' && (
                                                        <span className="text-[10px] font-bold bg-red-100 text-red-600 px-1.5 py-0.5 rounded animate-pulse">EMERGENCY</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-2 flex justify-end border-t border-slate-100">
                                            <button
                                                onClick={() => setProcessingRequest(r)}
                                                className="w-full bg-indigo-600 text-white text-sm font-bold py-2 rounded-lg flex items-center justify-center gap-2 hover:bg-indigo-700 transition-colors"
                                            >
                                                <span>Allocate Bed</span>
                                                <ArrowRight className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}


                    {data.wards.map(ward => {
                        const wardBeds = data.beds.filter(b => b.wardId === ward.id);
                        const category = data.categories.find(c => c.id === ward.type) || data.categories[0];
                        return (
                            <WardSection
                                key={ward.id}
                                ward={ward}
                                beds={wardBeds}
                                category={category}
                                onBedClick={setSelectedBed}
                                isEditingWard={editingWardId === ward.id}
                                onEditWardStart={() => setEditingWardId(ward.id)}
                                onEditWardSave={handleRenameWardSave}
                                onEditWardCancel={() => setEditingWardId(null)}
                                editingBedId={editingBedId}
                                onEditBedStart={(b) => setEditingBedId(b.id)}
                                onEditBedSave={handleRenameBedSave}
                                onEditBedCancel={() => setEditingBedId(null)}
                            />
                        );
                    })}
                </div>
            )}

            {/* CONFIG VIEW - Full Configuration Module */}
            {view === 'CONFIG' && (
                <ConfigurationModule data={data} />
            )}

            {/* PROCESS ADMISSION MODAL */}
            {processingRequest && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-md p-4 animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="bg-indigo-600 p-6 text-white shrink-0">
                            <h2 className="text-xl font-bold flex items-center gap-2">
                                <User className="w-6 h-6 text-indigo-200" />
                                Admit Patient
                            </h2>
                            <p className="text-indigo-200 text-sm mt-1">Assign a bed to complete admission.</p>
                        </div>

                        <div className="p-6 overflow-y-auto">
                            {/* Patient Info Card */}
                            <div className="flex gap-4 p-4 bg-indigo-50 rounded-xl border border-indigo-100 mb-6">
                                <div className="w-12 h-12 bg-indigo-200 rounded-full flex items-center justify-center text-indigo-700 font-bold text-lg shrink-0">
                                    {processingRequest.patientName.charAt(0)}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <h3 className="font-bold text-slate-800 text-lg">{processingRequest.patientName}</h3>
                                    <div className="flex gap-3 text-xs text-slate-500 font-medium mt-1">
                                        <span>{processingRequest.patientAge} Years / {processingRequest.patientGender}</span>
                                        <span>•</span>
                                        <span>Ref: Dr. {processingRequest.doctorName}</span>
                                    </div>
                                    <div className="mt-3 flex gap-2">
                                        <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 rounded text-xs font-bold border border-amber-200">
                                            Request: {data?.categories.find(c => c.id === processingRequest.recommendedCategory)?.name}
                                        </div>
                                        {processingRequest.urgency === 'EMERGENCY' && (
                                            <div className="inline-flex items-center gap-1 px-2.5 py-1 bg-red-100 text-red-700 rounded text-xs font-bold border border-red-200 animate-pulse">
                                                🚨 Emergency
                                            </div>
                                        )}
                                    </div>
                                    <div className="mt-3 text-sm text-slate-600 bg-white p-2 rounded border border-indigo-100 break-all whitespace-pre-wrap">
                                        <span className="font-bold text-indigo-900 text-xs uppercase tracking-wider block mb-1">Diagnosis / Reason</span>
                                        {processingRequest.reason}
                                    </div>
                                </div>
                            </div>

                            {/* Bed Selection */}
                            <h3 className="font-bold text-slate-700 mb-3 flex items-center gap-2">
                                <BedDouble className="w-5 h-5 text-slate-400" />
                                Select Available Bed
                            </h3>

                            <div className="space-y-4">
                                {data?.wards.map(ward => {
                                    // Filter beds: Must be available AND match ward
                                    // Optional: Filter by recommended category? For now show all available.
                                    const availableBeds = data.beds.filter(b => b.wardId === ward.id && b.status === 'AVAILABLE');
                                    if (availableBeds.length === 0) return null;

                                    return (
                                        <div key={ward.id} className="border border-slate-200 rounded-lg overflow-hidden">
                                            <div className="bg-slate-50 px-4 py-2 border-b border-slate-200 flex justify-between items-center">
                                                <span className="font-bold text-sm text-slate-700">{ward.name}</span>
                                                <span className="text-xs font-bold bg-emerald-100 text-emerald-700 px-2 py-0.5 rounded">
                                                    {availableBeds.length} Available
                                                </span>
                                            </div>
                                            <div className="p-3 grid grid-cols-4 gap-2">
                                                {availableBeds.map(bed => (
                                                    <button
                                                        key={bed.id}
                                                        onClick={() => setSelectedBedForAdmission(bed.id)}
                                                        className={cn(
                                                            "p-2 rounded border text-sm font-mono font-bold transition-all",
                                                            selectedBedForAdmission === bed.id
                                                                ? "bg-indigo-600 text-white border-indigo-600 shadow-md transform scale-105"
                                                                : "bg-white text-slate-600 border-slate-200 hover:border-indigo-300 hover:bg-indigo-50"
                                                        )}
                                                    >
                                                        {bed.bedNumber}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 shrink-0">
                            <button
                                onClick={() => { setProcessingRequest(null); setSelectedBedForAdmission(''); }}
                                className="px-5 py-2.5 font-bold text-slate-500 hover:bg-slate-200 rounded-xl transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAllocateBed}
                                disabled={!selectedBedForAdmission}
                                className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold rounded-xl shadow-lg shadow-indigo-200 transition-all flex items-center gap-2"
                            >
                                <CheckCircle2 className="w-5 h-5" />
                                Confirm Admission
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Bed Detail Modal (Existing) */}
            {/* Bed Detail Modal (Enhanced) */}
            {selectedBed && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <div className="bg-white w-full max-w-lg rounded-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        {/* Modal Header & Tabs */}
                        <div className="p-4 border-b border-slate-100 flex justify-between items-center bg-slate-50">
                            <div>
                                <h3 className="text-lg font-bold text-slate-800">Bed {selectedBed.bedNumber}</h3>
                                <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider">
                                    <span className={cn(
                                        "px-2 py-0.5 rounded",
                                        selectedBed.status === 'AVAILABLE' ? "bg-emerald-100 text-emerald-700" :
                                            selectedBed.status === 'OCCUPIED' ? "bg-indigo-100 text-indigo-700" :
                                                "bg-slate-200 text-slate-600"
                                    )}>
                                        {selectedBed.status}
                                    </span>
                                    {selectedBed.patientName && <span className="text-indigo-600">👤 {selectedBed.patientName}</span>}
                                </div>
                            </div>
                            <button onClick={() => setSelectedBed(null)} className="p-2 hover:bg-slate-200 rounded-lg text-slate-500 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>

                        {/* Tabs */}
                        <div className="flex border-b border-slate-200">
                            <button
                                onClick={() => setBedDetailTab('details')}
                                className={cn("flex-1 py-3 text-sm font-bold border-b-2 transition-colors", bedDetailTab === 'details' ? "border-indigo-600 text-indigo-600 bg-indigo-50/50" : "border-transparent text-slate-500 hover:bg-slate-50")}
                            >
                                Management
                            </button>
                            <button
                                onClick={() => setBedDetailTab('notes')}
                                className={cn("flex-1 py-3 text-sm font-bold border-b-2 transition-colors", bedDetailTab === 'notes' ? "border-indigo-600 text-indigo-600 bg-indigo-50/50" : "border-transparent text-slate-500 hover:bg-slate-50")}
                            >
                                Clinical Notes
                            </button>
                            <button
                                onClick={() => setBedDetailTab('prescriptions')}
                                className={cn("flex-1 py-3 text-sm font-bold border-b-2 transition-colors", bedDetailTab === 'prescriptions' ? "border-indigo-600 text-indigo-600 bg-indigo-50/50" : "border-transparent text-slate-500 hover:bg-slate-50")}
                            >
                                Prescriptions
                            </button>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto">
                            {bedDetailTab === 'details' ? (
                                <>
                                    <div className="mb-6 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                        <h4 className="text-xs font-bold text-slate-500 mb-3 uppercase tracking-wider flex items-center gap-2">
                                            <span className="bg-white p-1 rounded shadow-sm">🔌</span> Attached Equipment
                                        </h4>

                                        {/* Equipment List */}
                                        <div className="flex flex-wrap gap-2 mb-4">
                                            {(selectedBed.equipment || []).length > 0 ? (selectedBed.equipment || []).map(eqId => {
                                                const eq = data?.equipment?.find(e => e.id === eqId);
                                                if (!eq) return null;
                                                return (
                                                    <span key={eqId} className="bg-white border border-slate-200 text-indigo-700 pl-3 pr-2 py-1.5 rounded-lg text-sm font-bold flex items-center gap-2 shadow-sm group hover:border-red-200 transition-colors">
                                                        <span>{eq.icon} {eq.name}</span>
                                                        <button
                                                            onClick={() => {
                                                                const newEq = (selectedBed.equipment || []).filter(id => id !== eqId);
                                                                IpdService.updateBed(selectedBed.id, { equipment: newEq });
                                                                setSelectedBed({ ...selectedBed, equipment: newEq });
                                                            }}
                                                            className="w-5 h-5 flex items-center justify-center text-slate-300 hover:text-red-500 bg-slate-50 hover:bg-red-50 rounded-md transition-all opacity-0 group-hover:opacity-100"
                                                        >
                                                            <X className="w-3 h-3" />
                                                        </button>
                                                    </span>
                                                );
                                            }) : (
                                                <div className="w-full text-center py-4 border-2 border-dashed border-slate-200 rounded-lg text-slate-400 text-sm">
                                                    No equipment attached
                                                </div>
                                            )}
                                        </div>

                                        {/* Validated Dropdown */}
                                        <select
                                            className="w-full text-sm border border-slate-200 rounded-xl p-2.5 bg-white focus:outline-none focus:ring-2 focus:ring-indigo-500 shadow-sm"
                                            onChange={(e) => {
                                                if (e.target.value) {
                                                    const newEq = [...(selectedBed.equipment || []), e.target.value];
                                                    IpdService.updateBed(selectedBed.id, { equipment: newEq });
                                                    setSelectedBed({ ...selectedBed, equipment: newEq });
                                                    e.target.value = '';
                                                }
                                            }}
                                            defaultValue=""
                                        >
                                            <option value="" disabled>+ Add Equipment (Check Stock)</option>
                                            {(data?.equipment || []).map(e => {
                                                const assignedCount = data?.beds.reduce((acc, b) => acc + (b.equipment?.filter(id => id === e.id).length || 0), 0) || 0;
                                                const available = (e.totalQuantity || 0) - assignedCount;
                                                const isAttached = (selectedBed.equipment || []).includes(e.id);

                                                if (isAttached) return null;
                                                const isOutOfStock = available <= 0;

                                                return (
                                                    <option key={e.id} value={e.id} disabled={isOutOfStock} className={isOutOfStock ? 'text-red-400' : ''}>
                                                        {e.icon} {e.name} — {isOutOfStock ? 'Out of Stock' : `${available} Available`}
                                                    </option>
                                                )
                                            })}
                                        </select>
                                    </div>

                                    <div className="grid gap-3">
                                        {selectedBed.status === 'CLEANING' && (
                                            <button onClick={() => handleBedAction(selectedBed, 'CLEAN')} className="bg-emerald-500 text-white p-3 rounded-lg font-bold hover:bg-emerald-600 transition-colors shadow-lg shadow-emerald-200">
                                                ✅ Mark as Clean & Available
                                            </button>
                                        )}
                                        {selectedBed.status === 'AVAILABLE' && (
                                            <button onClick={() => handleBedAction(selectedBed, 'MAINTENANCE')} className="bg-slate-100 text-slate-700 p-3 rounded-lg font-bold hover:bg-slate-200 transition-colors">
                                                ⛔ Block for Maintenance
                                            </button>
                                        )}
                                        {selectedBed.status === 'BLOCKED' && (
                                            <button onClick={() => handleBedAction(selectedBed, 'OPEN')} className="bg-emerald-100 text-emerald-700 p-3 rounded-lg font-bold hover:bg-emerald-200 transition-colors">
                                                🟢 Re-open Bed
                                            </button>
                                        )}
                                        {selectedBed.status === 'OCCUPIED' && (
                                            <button onClick={() => handleBedAction(selectedBed, 'DISCHARGE')} className="bg-red-50 text-red-600 border border-red-200 p-3 rounded-lg font-bold hover:bg-red-100 flex items-center justify-center gap-2 transition-colors">
                                                <span>📤 Discharge Patient</span>
                                            </button>
                                        )}
                                    </div>
                                </>
                            ) : bedDetailTab === 'prescriptions' ? (
                                /* PRESCRIPTIONS TAB */
                                <div className="grid grid-cols-1 gap-6">
                                    {/* Add Medicine Form */}
                                    <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-sm border-l-4 border-l-indigo-500">
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-4 block">New Prescription</label>
                                        <div className="space-y-4">
                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Medicine Name</label>
                                                <input
                                                    type="text"
                                                    className="w-full p-2.5 rounded-lg border-2 border-slate-200 focus:border-indigo-500 focus:outline-none font-bold text-slate-700 text-sm"
                                                    placeholder="e.g., Tab Paracetamol 500mg"
                                                    value={newRx.name}
                                                    onChange={e => setNewRx({ ...newRx, name: e.target.value })}
                                                />
                                            </div>

                                            <div>
                                                <label className="text-[10px] font-bold text-slate-400 uppercase mb-2 block">Dosage Pattern</label>
                                                <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-lg border border-slate-200 justify-between">
                                                    {['m', 'a', 'n'].map(period => (
                                                        <div key={period} className="flex flex-col items-center w-12">
                                                            <label className="text-[9px] font-bold text-slate-400 uppercase mb-1">{period === 'm' ? 'Morn' : period === 'a' ? 'Aftn' : 'Night'}</label>
                                                            <button
                                                                onClick={() => {
                                                                    const val = (newRx.dosage as any)[period];
                                                                    const next = val === '0' ? '1' : val === '1' ? '1/2' : '0';
                                                                    setNewRx({
                                                                        ...newRx,
                                                                        dosage: { ...newRx.dosage, [period]: next }
                                                                    });
                                                                }}
                                                                className={cn(
                                                                    "w-full text-center border rounded text-sm font-bold py-1.5 transition-all",
                                                                    (newRx.dosage as any)[period] !== '0'
                                                                        ? "bg-indigo-600 text-white border-indigo-600 shadow-sm"
                                                                        : "bg-white text-slate-300 border-slate-200 hover:border-indigo-300 hover:text-indigo-400"
                                                                )}
                                                            >
                                                                {(newRx.dosage as any)[period] === '1/2' ? '½' : (newRx.dosage as any)[period]}
                                                            </button>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3">
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Days</label>
                                                    <input
                                                        type="number"
                                                        className="w-full p-2.5 rounded-lg border border-slate-200 text-center font-bold text-slate-700 text-sm focus:border-indigo-500 focus:outline-none"
                                                        value={newRx.duration}
                                                        onChange={e => setNewRx({ ...newRx, duration: e.target.value })}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-[10px] font-bold text-slate-400 uppercase mb-1 block">Timing</label>
                                                    <select
                                                        className="w-full p-2.5 rounded-lg border border-slate-200 font-bold text-sm text-slate-600 focus:border-indigo-500 focus:outline-none"
                                                        value={newRx.instruction}
                                                        onChange={e => setNewRx({ ...newRx, instruction: e.target.value })}
                                                    >
                                                        <option>After Food</option>
                                                        <option>Before Food</option>
                                                        <option>Empty Stomach</option>
                                                    </select>
                                                </div>
                                            </div>

                                            <button
                                                onClick={() => {
                                                    if (!newRx.name) return;
                                                    // Calculate Qty
                                                    const m = newRx.dosage.m === '1/2' ? 0.5 : Number(newRx.dosage.m);
                                                    const a = newRx.dosage.a === '1/2' ? 0.5 : Number(newRx.dosage.a);
                                                    const n = newRx.dosage.n === '1/2' ? 0.5 : Number(newRx.dosage.n);
                                                    const totalDaily = m + a + n;
                                                    const qty = Math.ceil(totalDaily * Number(newRx.duration)) + ' Tabs';

                                                    const rxToAdd = {
                                                        ...newRx,
                                                        qty,
                                                        doctorId: 'DOC-001',
                                                        doctorName: 'Dr. Resident'
                                                    };

                                                    IpdService.addPrescription(selectedBed.id, rxToAdd);

                                                    // Optimistic Update
                                                    const newRxObj = { ...rxToAdd, id: Math.random().toString(), dateAdded: new Date().toISOString() };
                                                    // @ts-ignore
                                                    const updatedBed = { ...selectedBed, prescriptions: [newRxObj, ...(selectedBed.prescriptions || [])] };
                                                    // @ts-ignore
                                                    setSelectedBed(updatedBed);
                                                    setNewRx({ name: '', dosage: { m: '0', a: '0', n: '0' }, duration: '3', instruction: 'After Food' });
                                                }}
                                                className="w-full bg-indigo-600 text-white py-3 rounded-lg font-bold text-sm hover:bg-indigo-700 shadow-md shadow-indigo-200 transition-all flex items-center justify-center gap-2"
                                            >
                                                <Plus className="w-5 h-5" />
                                                Add Prescription
                                            </button>
                                        </div>
                                    </div>

                                    {/* Active Prescriptions List */}
                                    <div>
                                        <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-4 flex justify-between items-center">
                                            <span>Active Prescriptions</span>
                                            <span className="bg-slate-100 text-slate-500 px-2 py-0.5 rounded-full text-[10px]">{selectedBed.prescriptions?.length || 0}</span>
                                        </h4>

                                        <div className="space-y-3">
                                            {(selectedBed.prescriptions || []).length > 0 ? (selectedBed.prescriptions || []).map((rx: Prescription) => (
                                                <div key={rx.id} className="relative animate-in slide-in-from-right-2 duration-300">
                                                    <div className="bg-white p-4 rounded-xl border border-slate-200 group hover:border-indigo-300 hover:shadow-md transition-all relative">
                                                        <div className="flex justify-between items-start mb-2">
                                                            <div className="flex items-center gap-2">
                                                                <div className="h-8 w-8 bg-indigo-50 rounded-lg flex items-center justify-center text-indigo-700 font-bold text-xs ring-1 ring-indigo-100">
                                                                    Rx
                                                                </div>
                                                                <div>
                                                                    <h5 className="font-bold text-slate-800 text-sm leading-tight">{rx.name}</h5>
                                                                    <p className="text-[10px] text-slate-400 font-bold uppercase mt-0.5">
                                                                        {rx.doctorName} • {new Date(rx.dateAdded).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                                    </p>
                                                                </div>
                                                            </div>
                                                            <button
                                                                onClick={() => {
                                                                    IpdService.removePrescription(selectedBed.id, rx.id);
                                                                    // Optimistic
                                                                    // @ts-ignore
                                                                    const updatedBed = { ...selectedBed, prescriptions: selectedBed.prescriptions?.filter(p => p.id !== rx.id) };
                                                                    // @ts-ignore
                                                                    setSelectedBed(updatedBed);
                                                                }}
                                                                className="h-6 w-6 flex items-center justify-center rounded bg-slate-50 text-slate-300 hover:text-red-500 hover:bg-red-50 transition-colors"
                                                            >
                                                                <X className="w-3.5 h-3.5" />
                                                            </button>
                                                        </div>

                                                        <div className="flex items-center gap-2 mt-3 bg-slate-50 p-2 rounded-lg border border-slate-100">
                                                            <div className="flex items-center gap-1">
                                                                <span className="text-[10px] font-bold text-slate-400 uppercase">Dosage:</span>
                                                                <span className="font-mono font-bold text-slate-700 text-xs bg-white px-1.5 py-0.5 rounded border border-slate-200 shadow-sm">
                                                                    {rx.dosage?.m}-{rx.dosage?.a}-{rx.dosage?.n}
                                                                </span>
                                                            </div>
                                                            <div className="w-px h-3 bg-slate-300"></div>
                                                            <div className="flex items-center gap-1">
                                                                <span className="font-bold text-slate-600 text-xs">{rx.duration} Days</span>
                                                            </div>
                                                            <div className="w-px h-3 bg-slate-300"></div>
                                                            <span className="text-xs text-slate-500 font-medium italic">{rx.instruction}</span>
                                                        </div>

                                                        <div className="absolute -right-1 -top-1 bg-indigo-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-bl-lg rounded-tr-lg shadow-sm">
                                                            Qty: {rx.qty}
                                                        </div>
                                                    </div>
                                                </div>
                                            )) : (
                                                <div className="text-center py-16 bg-white rounded-xl border-2 border-dashed border-slate-100 flex flex-col items-center justify-center">
                                                    <div className="w-12 h-12 bg-slate-50 rounded-full flex items-center justify-center mb-3">
                                                        <BedDouble className="w-6 h-6 text-slate-300" />
                                                    </div>
                                                    <p className="text-slate-400 font-medium text-sm">No active prescriptions</p>
                                                    <p className="text-slate-300 text-xs mt-1">Add medicines for this patient</p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ) : (
                                <div className="space-y-4">
                                    {/* Add Note Form */}
                                    <div className="bg-slate-50 p-4 rounded-xl border border-slate-200">
                                        <label className="text-xs font-bold text-slate-500 uppercase mb-2 block">Add Clinical Note</label>
                                        <div className="flex gap-2 mb-2">
                                            <select
                                                className="bg-white border border-slate-200 rounded-lg px-2 py-1 text-xs font-bold focus:outline-none"
                                                value={newNote.type}
                                                // @ts-ignore
                                                onChange={e => setNewNote({ ...newNote, type: e.target.value })}
                                            >
                                                <option value="ROUND">Round</option>
                                                <option value="DIAGNOSIS">Diagnosis</option>
                                                <option value="INSTRUCTION">Instruction</option>
                                                <option value="COMPLAINT">Complaint</option>
                                            </select>
                                            <div className="text-xs text-slate-400 py-1.5 flex-1 text-right">
                                                {new Date().toLocaleTimeString()}
                                            </div>
                                        </div>
                                        <textarea
                                            className="w-full text-sm border border-slate-200 rounded-lg p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 min-h-[80px]"
                                            placeholder="Enter clinical observations, instructions, or diagnosis..."
                                            value={newNote.text}
                                            onChange={e => setNewNote({ ...newNote, text: e.target.value })}
                                            onKeyDown={e => {
                                                if (e.key === 'Enter' && e.ctrlKey) {
                                                    // Quick submit
                                                    if (!newNote.text.trim()) return;
                                                    IpdService.addClinicalNote(selectedBed.id, {
                                                        ...newNote,
                                                        // @ts-ignore
                                                        doctorId: 'DOC-001', // TODO: Auth
                                                        doctorName: 'Dr. Resident' // TODO: Auth
                                                    });
                                                    setNewNote({ ...newNote, text: '' });
                                                    // Force refresh
                                                    setSelectedBed({ ...selectedBed, clinicalNotes: [{ ...newNote, id: 'temp', date: new Date().toISOString(), doctorId: 'DOC-001', doctorName: 'Dr. Resident' }, ...(selectedBed.clinicalNotes || [])] });
                                                }
                                            }}
                                        />
                                        <div className="flex justify-end mt-2">
                                            <button
                                                disabled={!newNote.text.trim()}
                                                onClick={() => {
                                                    if (!newNote.text.trim()) return;
                                                    IpdService.addClinicalNote(selectedBed.id, {
                                                        ...newNote,
                                                        // @ts-ignore
                                                        doctorId: 'DOC-001',
                                                        doctorName: 'Dr. Resident'
                                                    });
                                                    // Optimistic update for UI feel
                                                    const noteToAdd = { ...newNote, id: Math.random().toString(), date: new Date().toISOString(), doctorId: 'DOC-001', doctorName: 'Dr. Resident' };
                                                    // @ts-ignore
                                                    const updatedBed = { ...selectedBed, clinicalNotes: [noteToAdd, ...(selectedBed.clinicalNotes || [])] };
                                                    // @ts-ignore
                                                    setSelectedBed(updatedBed);
                                                    setNewNote({ ...newNote, text: '' });
                                                }}
                                                className="bg-indigo-600 text-white px-4 py-1.5 rounded-lg text-sm font-bold hover:bg-indigo-700 disabled:opacity-50 transition-colors"
                                            >
                                                Add Note
                                            </button>
                                        </div>
                                    </div>

                                    {/* Timeline */}
                                    <div className="space-y-4 pl-4 border-l-2 border-slate-100 ml-2">
                                        {(selectedBed.clinicalNotes || []).length > 0 ? (selectedBed.clinicalNotes || []).map((note, idx) => (
                                            <div key={note.id || idx} className="relative animate-in slide-in-from-left-2 duration-300" style={{ animationDelay: `${idx * 50}ms` }}>
                                                <div className={cn(
                                                    "absolute -left-[21px] top-0 w-3 h-3 rounded-full border-2 border-white shadow-sm",
                                                    note.type === 'DIAGNOSIS' ? "bg-amber-500" :
                                                        note.type === 'INSTRUCTION' ? "bg-emerald-500" :
                                                            note.type === 'COMPLAINT' ? "bg-red-500" :
                                                                "bg-indigo-500"
                                                )} />
                                                <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-sm">
                                                    <div className="flex justify-between items-start mb-1">
                                                        <div className="flex items-center gap-2">
                                                            <span className={cn(
                                                                "text-[10px] font-bold px-1.5 py-0.5 rounded uppercase",
                                                                note.type === 'DIAGNOSIS' ? "bg-amber-100 text-amber-700" :
                                                                    note.type === 'INSTRUCTION' ? "bg-emerald-100 text-emerald-700" :
                                                                        note.type === 'COMPLAINT' ? "bg-red-100 text-red-700" :
                                                                            "bg-indigo-100 text-indigo-700"
                                                            )}>{note.type}</span>
                                                            <span className="text-xs font-bold text-slate-700">{note.doctorName}</span>
                                                        </div>
                                                        <span className="text-[10px] text-slate-400 font-mono">
                                                            {new Date(note.date).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                        </span>
                                                    </div>
                                                    <p className="text-sm text-slate-600 leading-relaxed whitespace-pre-wrap">{note.text}</p>
                                                </div>
                                            </div>
                                        )) : (
                                            <div className="text-center py-8 text-slate-400 italic text-sm">No clinical notes recorded yet.</div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
