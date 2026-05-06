import React, { useState, useMemo } from 'react';
import { getBodyCompositionCategory } from '../../utils/bodyComposition';
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

    // Dynamic Summation & Average of Folds
    const foldsMetrics = useMemo(() => {
        const f = newMeasure.folds || {};
        const values = [f.bicipital, f.tricipital, f.subscapular, f.abdominal, f.suprailiac, f.quadriceps].map(v => parseFloat(v as any) || 0);
        const sum = values.reduce((a, b) => a + b, 0);
        const count = values.filter(v => v > 0).length;
        const avg = count > 0 ? sum / count : 0;
        return { sum, avg };
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
            { label: 'Cadera', data: sortedRecords.map(r => r.circumference.hip), borderColor: '#f43f5e', maintainAspectRatio: false },
            { label: 'Abdomen', data: sortedRecords.map(r => r.circumference.abdomen), borderColor: '#06b6d4', maintainAspectRatio: false },
            { label: 'Pecho', data: sortedRecords.map(r => r.circumference.chest), borderColor: '#f97316', maintainAspectRatio: false },
            { label: 'Brazo D.', data: sortedRecords.map(r => r.circumference.armR), borderColor: '#10b981', maintainAspectRatio: false },
            { label: 'Brazo I.', data: sortedRecords.map(r => r.circumference.armL), borderColor: '#ec4899', maintainAspectRatio: false },
            { label: 'Muslo', data: sortedRecords.map(r => r.circumference.thigh), borderColor: '#eab308', maintainAspectRatio: false },
            { label: 'Pantorrilla', data: sortedRecords.map(r => r.circumference.calf), borderColor: '#64748b', maintainAspectRatio: false }
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

    // Calculate Age
    const age = useMemo(() => {
        if (!patient.dob) return 0;
        const birthDate = new Date(patient.dob);
        const diff = Date.now() - birthDate.getTime();
        return Math.floor(diff / (1000 * 60 * 60 * 24 * 365.25));
    }, [patient.dob]);

    const bodyComp = useMemo(() => {
        return getBodyCompositionCategory(patient.gender, age, foldsMetrics.avg);
    }, [patient.gender, age, foldsMetrics.avg]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* IMC Chart */}
                <div className="bg-[#cbd9ce] border border-[#cbd9ce] rounded-xl p-4 sm:p-6">
                    <h3 className="text-sm font-bold text-[#3c584b] mb-4">Evolución Peso vs IMC</h3>
                    <div className="h-64 w-full relative">
                        <Line data={imcData} options={chartOptions} />
                    </div>
                </div>

                {/* Reference Table */}
                <div className="bg-[#cbd9ce] border border-[#cbd9ce] rounded-xl p-4 sm:p-6 overflow-x-auto">
                    <h3 className="text-sm font-bold text-[#3c584b] mb-4">Referencia IMC (OMS)</h3>
                    <table className="w-full text-xs text-[#3c584b] min-w-[200px]">
                        <thead><tr className="border-b border-[#cbd9ce]"><th className="text-left py-2">Categoría</th><th className="text-right">Rango</th></tr></thead>
                        <tbody className="divide-y divide-slate-800">
                            <tr><td className="py-2 text-[#3c584b]">Bajo Peso</td><td className="text-right text-[#3c584b]">&lt; 18.5</td></tr>
                            <tr><td className="py-2 text-[#3c584b]">Normal</td><td className="text-right text-[#3c584b]">18.5 - 24.9</td></tr>
                            <tr><td className="py-2 text-[#3c584b]">Sobrepeso</td><td className="text-right text-[#3c584b]">25.0 - 29.9</td></tr>
                            <tr><td className="py-2 text-[#3c584b]">Obesidad I</td><td className="text-right text-[#3c584b]">30.0 - 34.9</td></tr>
                            <tr><td className="py-2 text-[#3c584b]">Obesidad II</td><td className="text-right text-[#3c584b]">35.0 - 39.9</td></tr>
                        </tbody>
                    </table>
                </div>

                {/* Measures Chart */}
                <div className="col-span-1 lg:col-span-2 bg-[#cbd9ce] border border-[#cbd9ce] rounded-xl p-4 sm:p-6">
                    <h3 className="text-sm font-bold text-[#3c584b] mb-4">Evolución de Medidas (cm)</h3>
                    <div className="h-64 w-full relative">
                        <Line data={measureData} options={{ ...chartOptions, scales: { y: { grid: { color: '#1e293b' } }, x: { grid: { display: false } } } }} />
                    </div>
                </div>
            </div>

            {/* Energy Expenditure Card (Latest) */}
            {sortedRecords.length > 0 && (
                <div className="bg-[#cbd9ce] border border-[#cbd9ce] rounded-xl p-6 relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
                        <Activity size={100} className="text-[#cbd9ce]" />
                    </div>
                    <h3 className="text-sm font-bold text-[#3c584b] mb-6 flex items-center gap-2">
                        <Activity size={18} className="text-[#cbd9ce]" />
                        Estimación Energética (Mifflin-St Jeor)
                        <span className="text-xs font-normal text-[#3c584b] ml-2">Basado en último pesaje</span>
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-[#fdf7e7] rounded-lg p-4 border border-[#cbd9ce]">
                            <p className="text-xs text-[#3c584b] font-bold uppercase mb-1">Metabolismo Basal (BMR)</p>
                            <div className="text-3xl font-bold text-[#3c584b]">
                                {sortedRecords[sortedRecords.length - 1].bmr || '-'} <span className="text-sm font-normal text-[#3c584b]">kcal/día</span>
                            </div>
                        </div>

                        <div className="bg-gradient-to-br from-[var(--primary)] to-blue-800 rounded-lg p-4 text-[#3c584b] shadow-lg">
                            <p className="text-xs text-[#3c584b] font-bold uppercase mb-1">Gasto Energético Total (TDEE)</p>
                            <div className="text-3xl font-bold">
                                {sortedRecords[sortedRecords.length - 1].tdee || '-'} <span className="text-sm font-normal text-[#3c584b]">kcal/día</span>
                            </div>
                        </div>

                        <div className="bg-[#fdf7e7] rounded-lg p-4 border border-[#cbd9ce] flex flex-col justify-center">
                            <p className="text-xs text-[#3c584b] font-bold uppercase mb-1">Factor de Actividad Pasado</p>
                            <div className="text-lg font-medium text-[#3c584b]">
                                {ACTIVITY_FACTORS.find(f => f.value === sortedRecords[sortedRecords.length - 1].activity)?.label || 'No registrado'}
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Table & Action */}
            <div className="bg-[#cbd9ce] border border-[#cbd9ce] rounded-xl overflow-hidden">
                <div className="p-4 border-b border-[#cbd9ce] flex justify-between items-center">
                    <h3 className="text-[#3c584b] font-bold">Registro de Medidas</h3>
                    {!readOnly && (
                        <button onClick={() => { setEditingId(null); setNewMeasure({ ...INITIAL_MEASURE, date: getNowISO() }); setShowModal(true); }} className="bg-[#fdf7e7] hover:bg-[#fdf7e7] text-[#3c584b] px-3 py-1.5 rounded text-sm border border-[#cbd9ce] transition-colors whitespace-nowrap">
                            NUEVA MEDIDA
                        </button>
                    )}
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left text-[#3c584b] whitespace-nowrap">
                        <thead className="bg-[#fdf7e7] text-xs uppercase">
                            <tr>
                                <th className="px-4 py-3">Fecha</th>
                                <th className="px-4 py-3">Peso</th>
                                <th className="px-4 py-3">IMC</th>
                                <th className="px-4 py-3">Cintura</th>
                                <th className="px-4 py-3">Cadera</th>
                                <th className="px-4 py-3">Abdomen</th>
                                <th className="px-4 py-3">Pecho</th>
                                <th className="px-4 py-3">B. Der</th>
                                <th className="px-4 py-3">B. Izq</th>
                                <th className="px-4 py-3">Muslo</th>
                                <th className="px-4 py-3">Pantorrilla</th>
                                <th className="px-4 py-3 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800">
                            {patient.anthropometry.map(r => (
                                <tr key={r.id} className="hover:bg-[#fdf7e7] transition-colors">
                                    <td className="px-4 py-3">
                                        {new Date(r.date).toLocaleDateString('es-ES', { year: 'numeric', month: '2-digit', day: '2-digit', hour: '2-digit', minute: '2-digit' })}
                                    </td>
                                    <td className="px-4 py-3">{r.weight} kg</td>
                                    <td className="px-4 py-3 font-bold">{r.imc}</td>
                                    <td className="px-4 py-3">{r.circumference.waist}</td>
                                    <td className="px-4 py-3">{r.circumference.hip}</td>
                                    <td className="px-4 py-3">{r.circumference.abdomen}</td>
                                    <td className="px-4 py-3">{r.circumference.chest}</td>
                                    <td className="px-4 py-3">{r.circumference.armR}</td>
                                    <td className="px-4 py-3">{r.circumference.armL}</td>
                                    <td className="px-4 py-3">{r.circumference.thigh}</td>
                                    <td className="px-4 py-3">{r.circumference.calf}</td>
                                    <td className="px-4 py-3 text-right">
                                        {!readOnly && (
                                            <div className="flex justify-end gap-2">
                                                <button onClick={() => handleEdit(r)} className="p-1.5 text-[#3c584b] hover:bg-[#cbd9ce] rounded-lg transition-colors">
                                                    <Edit2 size={16} />
                                                </button>
                                                <button onClick={() => setDeleteId(r.id)} className="p-1.5 text-[#3c584b] hover:bg-[#cbd9ce] rounded-lg transition-colors">
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {patient.anthropometry.length === 0 && (
                                <tr>
                                    <td colSpan={12} className="px-4 py-8 text-center text-[#3c584b] italic">No hay registros de medidas.</td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            {deleteId && (
                <div className="fixed inset-0 bg-[#fdf7e7] backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-[#cbd9ce] border border-[#cbd9ce] rounded-xl p-8 max-w-sm w-full shadow-2xl text-center animate-in fade-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-[#cbd9ce] text-[#3c584b] rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-[#3c584b] mb-2">¿Eliminar Registro?</h3>
                        <p className="text-[#3c584b] text-sm mb-8 leading-relaxed">
                            Esta acción eliminará permanentemente esta medición antropométrica de la ficha del paciente.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-5 py-2.5 text-[#3c584b] hover:text-[#3c584b] font-medium hover:bg-[#fdf7e7] rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-[#cbd9ce] hover:bg-[#cbd9ce] text-[#3c584b] px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-md transition-all active:scale-95"
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Modal Nueva/Editar Medida */}
            {showModal && (
                <div className="fixed inset-0 bg-[#fdf7e7] backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#cbd9ce] border border-[#cbd9ce] rounded-xl w-full max-w-2xl max-h-[90vh] flex flex-col shadow-2xl animate-in fade-in zoom-in duration-200">
                        {/* Modal Header */}
                        <div className="bg-[#cbd9ce] p-4 flex justify-between items-center shrink-0 rounded-t-xl">
                            <h3 className="text-[#3c584b] font-bold text-lg">{editingId ? 'Editar Medida' : 'Nueva Medida'}</h3>
                            <button onClick={closeModal} className="text-[#3c584b] hover:text-[#3c584b] transition-colors"><X size={24} /></button>
                        </div>

                        {/* Scrollable Body */}
                        <div className="p-4 md:p-6 space-y-6 overflow-y-auto custom-scrollbar flex-1">
                            {/* Basics */}
                            <div className="bg-[#fdf7e7] p-4 rounded-lg border border-[#cbd9ce]">
                                <h4 className="text-sm font-bold text-[#3c584b] mb-3 uppercase tracking-wider">Básicos</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                                    <Input label="Fecha y Hora" type="datetime-local" value={newMeasure.date} onChange={v => handleInputChange('date', v)} />
                                    <Input label="Peso (kg)" type="number" value={newMeasure.weight} onChange={v => handleInputChange('weight', v)} />
                                    <Input label="Altura (cm)" type="number" value={newMeasure.height} onChange={v => handleInputChange('height', v)} />
                                    <Input label="IMC" type="number" value={newMeasure.imc} readOnly />
                                </div>
                            </div>

                            {/* Energy Calculation */}
                            <div className="bg-[#fdf7e7] p-4 rounded-lg border border-[#cbd9ce]">
                                <h4 className="text-sm font-bold text-[#3c584b] mb-3 uppercase tracking-wider flex items-center gap-2">
                                    <Activity size={14} /> Cálculo Energético (Mifflin-St Jeor)
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                                    <div className="col-span-2">
                                        <label className="block text-xs font-bold text-[#3c584b] mb-1 uppercase">Factor de Actividad</label>
                                        <select
                                            value={newMeasure.activity || 1.2}
                                            onChange={e => handleInputChange('activity', e.target.value)}
                                            className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded p-2 text-[#3c584b] text-sm focus:border-[#cbd9ce] outline-none"
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
                            <div className="bg-[#fdf7e7] p-4 rounded-lg border border-[#cbd9ce]">
                                <h4 className="text-sm font-bold text-[#3c584b] mb-3 uppercase tracking-wider">Circunferencias (cm)</h4>
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
                            <div className="bg-[#fdf7e7] p-4 rounded-lg border border-[#cbd9ce]">
                                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-3 gap-2">
                                    <h4 className="text-sm font-bold text-[#3c584b] uppercase tracking-wider">Pliegues (mm)</h4>
                                    <div className="flex gap-2 flex-wrap">
                                        {bodyComp && (
                                            <div className={`text-xs font-bold ${bodyComp.color} bg-[#fdf7e7] px-3 py-1 rounded-full border border-[#cbd9ce] flex items-center gap-2`}>
                                                {bodyComp.label}
                                            </div>
                                        )}
                                        <div className="bg-[#cbd9ce] text-[#3c584b] px-3 py-1 rounded-full text-xs font-bold border border-[#cbd9ce] flex items-center gap-2">
                                            <Calculator size={12} /> Prom: {foldsMetrics.avg.toFixed(1)} mm
                                        </div>
                                        <div className="bg-[#cbd9ce] text-[#3c584b] px-3 py-1 rounded-full text-xs font-bold border border-[#cbd9ce] flex items-center gap-2">
                                            <Calculator size={12} /> Σ {foldsMetrics.sum.toFixed(1)} mm
                                        </div>
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
                        <div className="p-4 border-t border-[#cbd9ce] bg-[#fdf7e7] rounded-b-xl shrink-0">
                            <button onClick={handleSave} className="w-full bg-[#cbd9ce] hover:opacity-90 text-[#3c584b] font-bold py-3 rounded-lg transition-all shadow-lg shadow-md">
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
        <label className="block text-xs font-bold text-[#3c584b] mb-1 uppercase tracking-tighter truncate" title={label}>{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange && onChange(e.target.value)}
            readOnly={readOnly}
            className={`w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded p-2 text-[#3c584b] text-sm focus:border-[#cbd9ce] outline-none transition-all ${readOnly ? 'opacity-50 cursor-not-allowed bg-[#fdf7e7]' : 'hover:border-[#cbd9ce]'}`}
        />
    </div>
);