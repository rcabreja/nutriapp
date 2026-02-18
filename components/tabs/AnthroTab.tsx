import React, { useState, useMemo } from 'react';
import { Patient, Anthropometry } from '../../types';
import { Line } from 'react-chartjs-2';
import { Plus, Calculator, Edit2, Trash2, X, AlertTriangle, Activity } from 'lucide-react';
import clsx from 'clsx';

interface Props {
    patient: Patient;
    updatePatient: (id: string, data: Partial<Patient>) => void;
    readOnly: boolean;
}

const getNowISO = () => {
    const now = new Date();
    now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
    return now.toISOString().slice(0, 16);
};

const INITIAL_MEASURE = {
    date: '', // Will be set on init or reset
    weight: 0, height: 0, imc: 0,
    circumference: { waist: 0, hip: 0, abdomen: 0, chest: 0, armR: 0, armL: 0, thigh: 0, calf: 0 },
    folds: { tricipital: 0, bicipital: 0, subscapular: 0, suprailiac: 0, abdominal: 0, quadriceps: 0 },
    activity: 1.2,
    bmr: 0,
    tdee: 0,
    notes: ''
};

const ACTIVITY_FACTORS = [
    { value: 1.2, label: 'Sedentario (Poco o nada ejercicio)' },
    { value: 1.375, label: 'Ligero (Ejercicio 1-3 días/sem)' },
    { value: 1.55, label: 'Moderado (Ejercicio 3-5 días/sem)' },
    { value: 1.725, label: 'Fuerte (Ejercicio 6-7 días/sem)' },
    { value: 1.9, label: 'Muy fuerte (Dos veces al día, entrenamientos duros)' },
];

export default function AnthroTab({ patient, updatePatient, readOnly }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    const [newMeasure, setNewMeasure] = useState<Partial<Anthropometry>>({ ...INITIAL_MEASURE, date: getNowISO() });

    // Calculate IMC Helper
    const calculateIMC = (w: number, h: number) => {
        if (h === 0) return 0;
        const hM = h / 100;
        return parseFloat((w / (hM * hM)).toFixed(1));
    }

    // Calculate Mifflin-St Jeor
    const calculateMifflin = (w: number, h: number, a: number, gender: 'M' | 'F', dob: string, act: number) => {
        if (!w || !h || !dob) return { bmr: 0, tdee: 0 };

        const birthDate = new Date(dob);
        const age = new Date().getFullYear() - birthDate.getFullYear();

        // Mifflin-St Jeor Formula
        let bmr = (10 * w) + (6.25 * h) - (5 * age);
        bmr += gender === 'M' ? 5 : -161;

        const tdee = Math.round(bmr * act);
        return { bmr: Math.round(bmr), tdee };
    };

    // Dynamic Summation of Folds
    const foldsSum = useMemo(() => {
        const f = newMeasure.folds || { tricipital: 0, bicipital: 0, subscapular: 0, suprailiac: 0, abdominal: 0, quadriceps: 0 };
        return (f.bicipital || 0) + (f.tricipital || 0) + (f.subscapular || 0) + (f.abdominal || 0) + (f.suprailiac || 0) + (f.quadriceps || 0);
    }, [newMeasure.folds]);

    const handleInputChange = (field: string, val: string, nested?: string, nestedKey?: string) => {
        const numVal = field === 'date' || field === 'notes' ? val : parseFloat(val) || 0;
        if (nested && nestedKey) {
            setNewMeasure(prev => ({
                ...prev,
                [nested]: { ...prev[nested as keyof Anthropometry] as any, [nestedKey]: numVal }
            }));
        } else {
            const updated = { ...newMeasure, [field]: numVal };

            if (field === 'weight' || field === 'height' || field === 'activity') {
                updated.imc = calculateIMC(updated.weight as number, updated.height as number);
                const { bmr, tdee } = calculateMifflin(
                    updated.weight as number,
                    updated.height as number,
                    0,
                    patient.gender,
                    patient.dob,
                    updated.activity || 1.2
                );
                updated.bmr = bmr;
                updated.tdee = tdee;
            }
            setNewMeasure(updated);
        }
    };

    const handleEdit = (measure: Anthropometry) => {
        setNewMeasure(measure);
        setEditingId(measure.id);
        setShowModal(true);
    };

    const handleSave = () => {
        let updatedAnthros = [...patient.anthropometry];
        if (editingId) {
            updatedAnthros = updatedAnthros.map(a => a.id === editingId ? { ...newMeasure as Anthropometry, id: editingId } : a);
        } else {
            const entry: Anthropometry = {
                ...newMeasure as Anthropometry,
                id: Date.now().toString()
            };
            updatedAnthros = [entry, ...updatedAnthros];
        }

        updatePatient(patient.id, { anthropometry: updatedAnthros });
        closeModal();
    };

    const closeModal = () => {
        setShowModal(false);
        setEditingId(null);
        setNewMeasure({ ...INITIAL_MEASURE, date: getNowISO() });
    };

    const confirmDelete = () => {
        if (deleteId) {
            const updatedAnthros = patient.anthropometry.filter(a => a.id !== deleteId);
            updatePatient(patient.id, { anthropometry: updatedAnthros });
            setDeleteId(null);
        }
    };

    // Chart Data Preparation
    const sortedRecords = [...patient.anthropometry].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const imcData = {
        labels: sortedRecords.map(r => new Date(r.date).toLocaleDateString()),
        datasets: [
            {
                label: 'IMC',
                data: sortedRecords.map(r => r.imc),
                borderColor: '#3b82f6',
                yAxisID: 'y',
                maintainAspectRatio: false,
            },
            {
                label: 'Peso (kg)',
                data: sortedRecords.map(r => r.weight),
                borderColor: '#10b981',
                yAxisID: 'y1',
                borderDash: [5, 5],
                maintainAspectRatio: false,
            }
        ]
    };

    const measureData = {
        labels: sortedRecords.map(r => new Date(r.date).toLocaleDateString()),
        datasets: [
            { label: 'Cintura', data: sortedRecords.map(r => r.circumference.waist), borderColor: '#8b5cf6', maintainAspectRatio: false },
            { label: 'Cadera', data: sortedRecords.map(r => r.circumference.hip), borderColor: '#f43f5e', maintainAspectRatio: false }
        ]
    };

    const chartOptions = {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index' as const, intersect: false },
        plugins: { legend: { position: 'bottom' as const } },
        scales: {
            y: { type: 'linear' as const, display: true, position: 'left' as const, grid: { color: '#1e293b' } },
            y1: { type: 'linear' as const, display: true, position: 'right' as const, grid: { drawOnChartArea: false } },
            x: { grid: { display: false } }
        }
    };

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* IMC Chart */}
                <div className="bg-[var(--card-bg)] border border-slate-800 rounded-xl p-4 sm:p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Evolución Peso vs IMC</h3>
                    <div className="h-64 w-full relative">
                        <Line data={imcData} options={chartOptions} />
                    </div>
                </div>

                {/* Reference Table */}
                <div className="bg-[var(--card-bg)] border border-slate-800 rounded-xl p-4 sm:p-6 overflow-x-auto">
                    <h3 className="text-sm font-bold text-white mb-4">Referencia IMC (OMS)</h3>
                    <table className="w-full text-xs text-slate-300 min-w-[200px]">
                        <thead><tr className="border-b border-slate-700"><th className="text-left py-2">Categoría</th><th className="text-right">Rango</th></tr></thead>
                        <tbody className="divide-y divide-slate-800">
                            <tr><td className="py-2 text-blue-400">Bajo Peso</td><td className="text-right text-blue-400">&lt; 18.5</td></tr>
                            <tr><td className="py-2 text-green-400">Normal</td><td className="text-right text-green-400">18.5 - 24.9</td></tr>
                            <tr><td className="py-2 text-yellow-400">Sobrepeso</td><td className="text-right text-yellow-400">25.0 - 29.9</td></tr>
                            <tr><td className="py-2 text-orange-400">Obesidad I</td><td className="text-right text-orange-400">30.0 - 34.9</td></tr>
                            <tr><td className="py-2 text-red-400">Obesidad II</td><td className="text-right text-red-400">35.0 - 39.9</td></tr>
                        </tbody>
                    </table>
                </div>

                {/* Measures Chart */}
                <div className="col-span-1 lg:col-span-2 bg-[var(--card-bg)] border border-slate-800 rounded-xl p-4 sm:p-6">
                    <h3 className="text-sm font-bold text-white mb-4">Evolución de Medidas (cm)</h3>
                    <div className="h-64 w-full relative">
                        <Line data={measureData} options={{ ...chartOptions, scales: { y: { grid: { color: '#1e293b' } }, x: { grid: { display: false } } } }} />
                    </div>
                </div>
            </div>

            {/* Energy Expenditure Card (Latest) */}
            {sortedRecords.length > 0 && (
                <div className="bg-[var(--card-bg)] border border-slate-800 rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={100} className="text-[var(--primary)]" />
                    </div>
                    <h3 className="text-sm font-bold text-white mb-6 flex items-center gap-2">
                        <Activity size={18} className="text-[var(--primary)]" />
                        Estimación Energética (Mifflin-St Jeor)
                        <span className="text-xs font-normal text-slate-500 ml-2">Basado en último pesaje</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Metabolismo Basal (BMR)</p>
                            <div className="text-3xl font-bold text-white">
                                {sortedRecords[sortedRecords.length - 1].bmr || '-'} <span className="text-sm font-normal text-slate-500">kcal/día</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[var(--primary)] to-blue-800 rounded-lg p-4 text-white shadow-lg">
                            <p className="text-xs text-blue-200 font-bold uppercase mb-1">Gasto Energético Total (TDEE)</p>
                            <div className="text-3xl font-bold">
                                {sortedRecords[sortedRecords.length - 1].tdee || '-'} <span className="text-sm font-normal text-blue-200">kcal/día</span>
                            </div>
                        </div>

                        <div className="bg-slate-800/50 rounded-lg p-4 border border-slate-700 flex flex-col justify-center">
                            <p className="text-xs text-slate-400 font-bold uppercase mb-1">Factor de Actividad Pasado</p>
                            <div className="text-lg font-medium text-slate-300">
                                {ACTIVITY_FACTORS.find(f => f.value === sortedRecords[sortedRecords.length - 1].activity)?.label || 'No registrado'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Table & Action */}
            <div className="bg-[var(--card-bg)] border border-slate-800 rounded-xl overflow-hidden">
                <div className="p-4 border-b border-slate-800 flex justify-between items-center">
                    <h3 className="text-white font-bold">Registro de Medidas</h3>
                    {!readOnly && (
                        <button onClick={() => { setEditingId(null); setNewMeasure({ ...INITIAL_MEASURE, date: getNowISO() }); setShowModal(true); }} className="bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded text-sm border border-slate-700 transition-colors whitespace-nowrap">
                            NUEVA MEDIDA
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-slate-300 whitespace-nowrap">
                        <thead className="bg-slate-800 text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3">Fecha</th>
                                <th className="px-4 py-3">Peso</th>
                                <th className="px-4 py-3">IMC</th>
                                <th className="px-4 py-3">Cintura</th>
                                <th className="px-4 py-3">Cadera</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {patient.anthropometry.map(r => (
                                <tr key={r.id} className="hover:bg-slate-800/50 transition-colors">
                                    <td className="px-4 py-3">
                                        {new Date(r.date).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-4 py-3">{r.weight} kg</td>
                                    <td className="px-4 py-3 font-bold">{r.imc}</td>
                                    <td className="px-4 py-3">{r.circumference.waist}</td>
                                    <td className="px-4 py-3">{r.circumference.hip}</td>
                                    <td className="px-4 py-3 text-right">
                                        {!readOnly && (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(r)} className="p-1.5 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {patient.anthropometry.length === 0 && (
                                <tr>
                                    <td colSpan={6} className="px-4 py-8 text-center text-slate-500 italic">No hay registros de medidas.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            {deleteId && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-[var(--card-bg)] border border-slate-700 rounded-xl p-8 max-w-sm w-full shadow-2xl text-center animate-in fade-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-white mb-2">¿Eliminar Registro?</h3>
                        <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                            Esta acción eliminará permanentemente esta medición antropométrica de la ficha del paciente.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-5 py-2.5 text-slate-400 hover:text-white font-medium hover:bg-slate-800 rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95"
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nueva/Editar Medida */}
            {showModal && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[var(--card-bg)] border border-slate-700 rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="bg-[var(--primary)] p-4 flex justify-between items-center shrink-0 rounded-t-xl">
                            <h3 className="text-white font-bold text-lg">{editingId ? 'Editar Medida' : 'Nueva Medida'}</h3>
                            <button onClick={closeModal} className="text-white/80 hover:text-white transition-colors"><X size={24} /></button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-4 md:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                            {/* Basics */}
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <h4 className="text-sm font-bold text-blue-400 mb-3 uppercase tracking-wider">Básicos</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <Input label="Fecha y Hora" type="datetime-local" value={newMeasure.date} onChange={v => handleInputChange('date', v)} />
                                    <Input label="Peso (kg)" type="number" value={newMeasure.weight} onChange={v => handleInputChange('weight', v)} />
                                    <Input label="Altura (cm)" type="number" value={newMeasure.height} onChange={v => handleInputChange('height', v)} />
                                    <Input label="IMC" type="number" value={newMeasure.imc} readOnly />
                                </div>
                            </div>

                            {/* Energy Calculation */}
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <h4 className="text-sm font-bold text-green-400 mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <Activity size={14} /> Cálculo Energético (Mifflin-St Jeor)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase">Factor de Actividad</label>
                                        <select
                                            value={newMeasure.activity || 1.2}
                                            onChange={e => handleInputChange('activity', e.target.value)}
                                            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm focus:border-[var(--primary)] outline-none"
                                        >
                                            {ACTIVITY_FACTORS.map(f => (
                                                <option key={f.value} value={f.value}>{f.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <Input label="BMR (Kcal)" value={newMeasure.bmr} readOnly />
                                    <Input label="TDEE (Kcal Diarias)" value={newMeasure.tdee} readOnly />
                                </div>
                            </div>

                            {/* Circumferences */}
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700">
                                <h4 className="text-sm font-bold text-purple-400 mb-3 uppercase tracking-wider">Circunferencias (cm)</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <Input label="Cintura" value={newMeasure.circumference?.waist} onChange={v => handleInputChange('circumference', v, 'circumference', 'waist')} />
                                    <Input label="Cadera" value={newMeasure.circumference?.hip} onChange={v => handleInputChange('circumference', v, 'circumference', 'hip')} />
                                    <Input label="Abdomen" value={newMeasure.circumference?.abdomen} onChange={v => handleInputChange('circumference', v, 'circumference', 'abdomen')} />
                                    <Input label="Pecho" value={newMeasure.circumference?.chest} onChange={v => handleInputChange('circumference', v, 'circumference', 'chest')} />
                                    <Input label="Brazo Der" value={newMeasure.circumference?.armR} onChange={v => handleInputChange('circumference', v, 'circumference', 'armR')} />
                                    <Input label="Brazo Izq" value={newMeasure.circumference?.armL} onChange={v => handleInputChange('circumference', v, 'circumference', 'armL')} />
                                    <Input label="Muslo" value={newMeasure.circumference?.thigh} onChange={v => handleInputChange('circumference', v, 'circumference', 'thigh')} />
                                    <Input label="Pantorrilla" value={newMeasure.circumference?.calf} onChange={v => handleInputChange('circumference', v, 'circumference', 'calf')} />
                                </div>
                            </div>

                            {/* Folds */}
                            <div className="bg-slate-800/50 p-4 rounded-lg border border-slate-700 relative">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                                    <h4 className="text-sm font-bold text-orange-400 uppercase tracking-wider">Pliegues (mm)</h4>
                                    <div className="bg-orange-500/10 text-orange-400 px-3 py-1 rounded-full text-xs font-bold border border-orange-500/20 flex items-center gap-2">
                                        <Calculator size={12} /> Σ6 pliegues: {foldsSum.toFixed(1)} mm
                                    </div>
                                </div>
                                <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                                    <Input label="Bicipital" value={newMeasure.folds?.bicipital} onChange={v => handleInputChange('folds', v, 'folds', 'bicipital')} />
                                    <Input label="Tricipital" value={newMeasure.folds?.tricipital} onChange={v => handleInputChange('folds', v, 'folds', 'tricipital')} />
                                    <Input label="Subescapular" value={newMeasure.folds?.subscapular} onChange={v => handleInputChange('folds', v, 'folds', 'subscapular')} />
                                    <Input label="Abdominal" value={newMeasure.folds?.abdominal} onChange={v => handleInputChange('folds', v, 'folds', 'abdominal')} />
                                    <Input label="Supraíliaco" value={newMeasure.folds?.suprailiac} onChange={v => handleInputChange('folds', v, 'folds', 'suprailiac')} />
                                    <Input label="Cuádriceps" value={newMeasure.folds?.quadriceps} onChange={v => handleInputChange('folds', v, 'folds', 'quadriceps')} />
                                </div>
                            </div>
                        </div>

                        {/* Footer Button */}
                        <div className="p-4 border-t border-slate-800 bg-[var(--card-bg)] rounded-b-xl shrink-0">
                            <button onClick={handleSave} className="w-full bg-[var(--primary)] hover:opacity-90 text-white font-bold py-3 rounded-lg transition-all shadow-lg shadow-blue-900/20">
                                {editingId ? 'Guardar Cambios' : 'Guardar Medida'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const Input = ({ label, value, onChange, type = "number", readOnly = false }: any) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 mb-1 uppercase tracking-tighter truncate" title={label}>{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange && onChange(e.target.value)}
            readOnly={readOnly}
            className={`w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm focus:border-[var(--primary)] outline-none transition-all ${readOnly ? 'opacity-50 cursor-not-allowed bg-slate-800' : 'hover:border-slate-600'}`}
        />
    </div>
);