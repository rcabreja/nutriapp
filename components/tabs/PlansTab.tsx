import React, { useState } from 'react';
import { Patient, Plan, MealSection, Meal } from '../../types';
import { jsPDF } from 'jspdf';
import { FileDown, CheckCircle, Flame, Edit2, Plus, Trash2, X, Save, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';

interface Props {
    patient: Patient;
    updatePatient: (id: string, data: Partial<Patient>) => void;
    readOnly: boolean;
}

export default function PlansTab({ patient, updatePatient, readOnly }: Props) {
    const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
    const [viewDate, setViewDate] = useState(new Date()); // State to track visible month
    const [showEditModal, setShowEditModal] = useState(false);

    // Get active plan or default empty
    const activePlan = patient.plans.find(p => p.active) || {
        id: 'new',
        name: 'Nuevo Plan Nutricional',
        kcalTarget: 2000,
        active: true,
        sections: [
            { title: 'Desayuno', options: [{ id: '1', name: 'Opción 1', description: '' }] },
            { title: 'Almuerzo', options: [{ id: '2', name: 'Opción 1', description: '' }] },
            { title: 'Cena', options: [{ id: '3', name: 'Opción 1', description: '' }] }
        ],
        supplements: '',
        avoid: '',
        macronutrients: {
            protein: 20,
            carbs: 50,
            fats: 30
        },
        createdAt: new Date().toISOString()
    } as Plan;

    // Edit State
    const [editedPlan, setEditedPlan] = useState<Plan>(activePlan);

    // Get latest weight for calculations (default 70 if no data)
    const currentWeight = patient.anthropometry.length > 0
        ? patient.anthropometry[patient.anthropometry.length - 1].weight
        : 70;

    // --- ADHERENCE LOGIC ---
    const handleMacroChange = (key: 'protein' | 'carbs' | 'fats', value: number) => {
        const newPlan = { ...editedPlan };
        if (!newPlan.macronutrients) {
            newPlan.macronutrients = { protein: 20, carbs: 50, fats: 30 };
        }

        // Clamp value between 0 and 100
        let newValue = Math.max(0, Math.min(100, value));

        newPlan.macronutrients[key] = newValue;

        const remaining = 100 - newValue;
        const otherKeys = (['protein', 'carbs', 'fats'] as const).filter(k => k !== key);

        const other1 = newPlan.macronutrients[otherKeys[0]];
        const other2 = newPlan.macronutrients[otherKeys[1]];

        const totalOthers = other1 + other2;

        if (totalOthers === 0) {
            // If others are 0, split remaining equally
            newPlan.macronutrients[otherKeys[0]] = remaining / 2;
            newPlan.macronutrients[otherKeys[1]] = remaining / 2;
        } else {
            // Proportional adjustment
            newPlan.macronutrients[otherKeys[0]] = (other1 / totalOthers) * remaining;
            newPlan.macronutrients[otherKeys[1]] = (other2 / totalOthers) * remaining;
        }

        // Round to 1 decimal place to avoid floating point issues
        newPlan.macronutrients[otherKeys[0]] = Math.round(newPlan.macronutrients[otherKeys[0]] * 10) / 10;
        newPlan.macronutrients[otherKeys[1]] = Math.round(newPlan.macronutrients[otherKeys[1]] * 10) / 10;

        // Adjust last one to ensure exact 100 sum
        const currentSum = newValue + newPlan.macronutrients[otherKeys[0]] + newPlan.macronutrients[otherKeys[1]];
        if (currentSum !== 100) {
            const diff = 100 - currentSum;
            newPlan.macronutrients[otherKeys[1]] += diff;
        }

        setEditedPlan(newPlan);
    };

    const getAdherenceData = (date: string) => {
        return patient.adherence.find(a => a.date === date) || {
            date,
            completed: 0,
            total: 4,
            checks: { breakfast: false, lunch: false, dinner: false, supplements: false }
        };
    };

    const currentAdherence = getAdherenceData(selectedDate);
    const currentChecks = currentAdherence.checks || { breakfast: false, lunch: false, dinner: false, supplements: false };

    const handleCheck = (category: 'breakfast' | 'lunch' | 'dinner' | 'supplements') => {
        // Create new check state
        const newChecks = { ...currentChecks, [category]: !currentChecks[category] };

        // Calculate score
        let score = 0;
        if (newChecks.breakfast) score++;
        if (newChecks.lunch) score++;
        if (newChecks.dinner) score++;
        if (newChecks.supplements) score++;

        // Update Array
        const newAdherenceEntry = {
            date: selectedDate,
            completed: score,
            total: 4,
            checks: newChecks
        };

        const otherEntries = patient.adherence.filter(a => a.date !== selectedDate);
        updatePatient(patient.id, { adherence: [...otherEntries, newAdherenceEntry] });
    };

    // --- MAP PLAN TITLES TO KEYS ---
    const mapTitleToKey = (title: string): 'breakfast' | 'lunch' | 'dinner' | null => {
        const t = title.toLowerCase();
        if (t.includes('desayuno')) return 'breakfast';
        if (t.includes('almuerzo') || t.includes('comida')) return 'lunch';
        if (t.includes('cena')) return 'dinner';
        return null;
    };

    // --- CHARTS DATA ---
    // Get last 7 days or current month
    const chartDays = Array.from({ length: 10 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (9 - i));
        return d.toISOString().split('T')[0];
    });

    const adherenceChartData = {
        labels: chartDays.map(d => d.slice(5)), // MM-DD
        datasets: [
            {
                label: 'Cumplimiento Diario (%)',
                data: chartDays.map(date => {
                    const entry = patient.adherence.find(a => a.date === date);
                    return entry ? (entry.completed / 4) * 100 : 0;
                }),
                borderColor: '#3b82f6',
                backgroundColor: 'rgba(59, 130, 246, 0.5)',
                tension: 0.4,
                fill: true
            }
        ]
    };

    const adherenceChartOptions = {
        responsive: true,
        plugins: {
            legend: { display: false },
            title: { display: false }
        },
        scales: {
            y: { min: 0, max: 100, grid: { color: '#1e293b' } },
            x: { grid: { display: false } }
        }
    };

    // --- PDF GENERATION ---
    const generatePDF = () => {
        if (!activePlan) return;
        const doc = new jsPDF();

        doc.setFontSize(20);
        doc.setTextColor(0, 0, 0);
        doc.text(`Plan Nutricional: ${activePlan.name}`, 20, 20);

        doc.setFontSize(10);
        doc.setTextColor(100, 100, 100);
        doc.text(`Paciente: ${patient.name} | Kcal: ${activePlan.kcalTarget}`, 20, 28);

        let y = 40;
        activePlan.sections.forEach(sec => {
            doc.setFillColor(240, 248, 255);
            doc.rect(20, y - 6, 170, 10, 'F');
            doc.setFontSize(12);
            doc.setTextColor(0, 80, 150);
            doc.setFont('helvetica', 'bold');
            doc.text(sec.title.toUpperCase(), 25, y + 1);
            y += 12;

            doc.setFontSize(10);
            doc.setTextColor(0, 0, 0);
            doc.setFont('helvetica', 'normal');

            sec.options.forEach(opt => {
                doc.setFont('helvetica', 'bold');
                doc.text(`${opt.name}:`, 25, y);
                doc.setFont('helvetica', 'normal');
                const splitDesc = doc.splitTextToSize(opt.description, 130);
                doc.text(splitDesc, 50, y);
                y += (splitDesc.length * 5) + 4;
            });
            y += 5;
        });

        y += 5;
        doc.setDrawColor(200, 200, 200);
        doc.rect(20, y, 170, 25);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(0, 0, 150);
        doc.text('SUPLEMENTOS', 25, y + 6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.text(doc.splitTextToSize(activePlan.supplements, 160), 25, y + 12);

        y += 30;
        doc.setDrawColor(255, 200, 200);
        doc.setFillColor(255, 240, 240);
        doc.rect(20, y, 170, 25, 'FD');
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(150, 0, 0);
        doc.text('EVITAR', 25, y + 6);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(50, 50, 50);
        doc.text(doc.splitTextToSize(activePlan.avoid, 160), 25, y + 12);

        doc.save(`Plan_${patient.name.replace(/\s+/g, '_')}.pdf`);
    };

    const handleSavePlan = () => {
        let newPlans = [...patient.plans];
        const existingIndex = newPlans.findIndex(p => p.id === editedPlan.id);

        if (existingIndex >= 0) {
            newPlans[existingIndex] = editedPlan;
        } else {
            const finalPlan = { ...editedPlan, id: Date.now().toString() };
            newPlans = [finalPlan, ...newPlans.map(p => ({ ...p, active: false }))];
        }

        updatePatient(patient.id, { plans: newPlans });
        setShowEditModal(false);
    };

    // --- CALENDAR LOGIC ---
    const changeMonth = (offset: number) => {
        const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
        setViewDate(newDate);
    };

    const currentYear = viewDate.getFullYear();
    const currentMonth = viewDate.getMonth();
    const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
    const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

    const calendarCells = [];

    // Padding for previous month
    for (let i = 0; i < firstDayOfMonth; i++) {
        calendarCells.push(<div key={`empty-${i}`} className="w-9 h-9"></div>);
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
        const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
        const entry = patient.adherence.find(a => a.date === dateStr);
        const score = entry ? entry.completed : 0;

        let bg = 'bg-transparent text-[#3c584b] hover:bg-[#fdf7e7]';
        if (score >= 4) bg = 'bg-[#cbd9ce] text-[#3c584b] shadow-lg shadow-sm'; // Excelent
        else if (score >= 2) bg = 'bg-[#cbd9ce] text-[#3c584b]'; // Med
        else if (score > 0) bg = 'bg-[#cbd9ce] text-[#3c584b]'; // Low

        const isSelected = selectedDate === dateStr;

        calendarCells.push(
            <button
                key={dateStr}
                onClick={() => setSelectedDate(dateStr)}
                className={`w-9 h-9 mx-auto rounded-lg flex items-center justify-center text-sm transition-all font-medium ${bg} ${isSelected ? 'ring-2 ring-[#cbd9ce] ring-offset-2 ring-offset-slate-900 z-10' : ''}`}
            >
                {d}
            </button>
        );
    }

    return (
        <div className="space-y-8">
            {/* SECTION 1: ADHERENCE (Blue Card) */}
            <div className="bg-[#fdf7e7] border border-[#cbd9ce] rounded-xl p-6">
                <h3 className="flex items-center gap-2 font-bold text-[#3c584b] mb-6 text-lg">
                    <CheckCircle className="text-[#3c584b]" size={24} /> Seguimiento y Adherencia
                </h3>

                <div className="flex flex-col xl:flex-row gap-8">
                    {/* Left: Progress Card */}
                    <div className="flex-1 bg-[#fdf7e7] border border-[#cbd9ce] rounded-xl p-6 text-[#3c584b] shadow-sm">
                        <h4 className="text-xs font-bold text-[#3c584b] uppercase mb-4 tracking-wider">PROGRESO DEL DÍA SELECCIONADO</h4>

                        <div className="flex justify-between items-end mb-2">
                            <div className="text-xl font-bold capitalize text-[#3c584b]">
                                {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </div>
                            <div className="text-3xl font-bold text-[#3c584b]">{currentAdherence.completed}/4</div>
                        </div>

                        <div className="w-full h-4 bg-[#fdf7e7] rounded-full overflow-hidden mb-3">
                            <div
                                className="h-full bg-[#cbd9ce] transition-all duration-500 ease-out"
                                style={{ width: `${(currentAdherence.completed / 4) * 100}%` }}
                            ></div>
                        </div>

                        <p className="text-xs text-center text-[#3c584b] italic mb-6">Marca las casillas en el plan inferior para registrar tu progreso.</p>

                        {/* Chart within Adherence Card */}
                        <div className="mt-6 pt-6 border-t border-[#cbd9ce]">
                            <h5 className="flex items-center gap-2 text-xs font-bold text-[#3c584b] uppercase mb-4">
                                <TrendingUp size={14} /> Tendencia (Últimos 10 días)
                            </h5>
                            <div className="h-32 w-full">
                                <Line data={adherenceChartData} options={adherenceChartOptions} />
                            </div>
                        </div>
                    </div>

                    {/* Right: Calendar & Legend */}
                    <div className="flex-1 flex flex-col justify-between">
                        <div>
                            <div className="flex justify-between items-center mb-6 px-2 bg-[#fdf7e7] rounded-lg p-2">
                                <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-[#fdf7e7] rounded text-[#3c584b] hover:text-[#3c584b] transition-colors">
                                    <ChevronLeft size={20} />
                                </button>
                                <span className="font-bold text-[#3c584b] text-lg capitalize">
                                    {viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                                </span>
                                <button onClick={() => changeMonth(1)} className="p-1 hover:bg-[#fdf7e7] rounded text-[#3c584b] hover:text-[#3c584b] transition-colors">
                                    <ChevronRight size={20} />
                                </button>
                            </div>
                            <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-6">
                                {['D', 'L', 'M', 'M', 'J', 'V', 'S'].map(d => <div key={d} className="text-xs text-[#3c584b] font-bold">{d}</div>)}
                                {calendarCells}
                            </div>
                        </div>

                        {/* Legend */}
                        <div className="border-t border-[#cbd9ce] pt-4">
                            <p className="text-xs font-bold text-[#3c584b] uppercase mb-3">LEYENDA DE CUMPLIMIENTO</p>
                            <div className="space-y-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-[#cbd9ce]"></div>
                                    <span className="text-xs text-[#3c584b]">Cumplimiento Parcial (Bajo)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-[#cbd9ce]"></div>
                                    <span className="text-xs text-[#3c584b]">Cumplimiento Parcial (Medio)</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <div className="w-3 h-3 rounded bg-[#cbd9ce]"></div>
                                    <span className="text-xs text-[#3c584b]">Cumplimiento Total (Excelente)</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* SECTION 2: PLAN DETAIL (White/Gray card style in Dark Mode) */}
            <div className="bg-[#fdf7e7] rounded-xl overflow-hidden border border-[#cbd9ce] shadow-xl">
                {/* Header */}
                <div className="bg-[#fdf7e7] p-6 border-b border-[#cbd9ce] flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                        <h2 className="text-2xl font-bold text-[#3c584b] flex items-center gap-3">
                            {activePlan.name}
                            {!readOnly && (
                                <button onClick={() => { setEditedPlan(JSON.parse(JSON.stringify(activePlan))); setShowEditModal(true); }} className="text-[#3c584b] hover:text-[#3c584b] transition-colors">
                                    <Edit2 size={18} />
                                </button>
                            )}
                        </h2>
                        <div className="mt-2 inline-flex items-center gap-1.5 bg-[#cbd9ce] text-[#3c584b] px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                            <Flame size={12} fill="currentColor" /> {activePlan.kcalTarget} kcal
                        </div>
                    </div>

                    {/* Macronutrients Display */}
                    {activePlan.macronutrients && (
                        <div className="mt-4 grid grid-cols-3 gap-4 border-t border-[#cbd9ce] pt-4">
                            <div className="text-center">
                                <div className="text-xs font-bold text-[#3c584b] uppercase">Proteínas</div>
                                <div className="text-lg font-bold text-[#3c584b]">{activePlan.macronutrients.protein}%</div>
                                <div className="text-xs text-[#3c584b]">{Math.round((activePlan.kcalTarget * activePlan.macronutrients.protein) / 100 / 4)}g ({Math.round((activePlan.kcalTarget * activePlan.macronutrients.protein) / 100)} kcal)</div>
                                <div className="text-xs font-semibold text-[#3c584b] mt-0.5">{((activePlan.kcalTarget * activePlan.macronutrients.protein / 100 / 4) / currentWeight).toFixed(1)} g/kg</div>
                            </div>
                            <div className="text-center border-l border-[#cbd9ce]">
                                <div className="text-xs font-bold text-[#3c584b] uppercase">Carbohidratos</div>
                                <div className="text-lg font-bold text-[#3c584b]">{activePlan.macronutrients.carbs}%</div>
                                <div className="text-xs text-[#3c584b]">{Math.round((activePlan.kcalTarget * activePlan.macronutrients.carbs) / 100 / 4)}g ({Math.round((activePlan.kcalTarget * activePlan.macronutrients.carbs) / 100)} kcal)</div>
                                <div className="text-xs font-semibold text-[#3c584b] mt-0.5">{((activePlan.kcalTarget * activePlan.macronutrients.carbs / 100 / 4) / currentWeight).toFixed(1)} g/kg</div>
                            </div>
                            <div className="text-center border-l border-[#cbd9ce]">
                                <div className="text-xs font-bold text-[#3c584b] uppercase">Grasas</div>
                                <div className="text-lg font-bold text-[#3c584b]">{activePlan.macronutrients.fats}%</div>
                                <div className="text-xs text-[#3c584b]">{Math.round((activePlan.kcalTarget * activePlan.macronutrients.fats) / 100 / 9)}g ({Math.round((activePlan.kcalTarget * activePlan.macronutrients.fats) / 100)} kcal)</div>
                                <div className="text-xs font-semibold text-[#3c584b] mt-0.5">{((activePlan.kcalTarget * activePlan.macronutrients.fats / 100 / 9) / currentWeight).toFixed(1)} g/kg</div>
                            </div>
                        </div>
                    )}
                </div>

                <div className="flex gap-3">
                    {!readOnly && (
                        <button
                            onClick={() => { setEditedPlan(JSON.parse(JSON.stringify(activePlan))); setShowEditModal(true); }}
                            className="px-4 py-2 rounded-lg border border-[#cbd9ce] text-[#3c584b] font-medium hover:bg-[#fdf7e7] flex items-center gap-2 transition-colors text-sm"
                        >
                            <Edit2 size={16} /> Editar
                        </button>
                    )}
                    <button
                        onClick={generatePDF}
                        className="px-4 py-2 rounded-lg bg-[#fdf7e7] text-[#3c584b] font-medium hover:bg-[#fdf7e7] flex items-center gap-2 transition-colors text-sm shadow-lg shadow-md"
                    >
                        <FileDown size={16} /> PDF
                    </button>
                </div>
            </div>

            {/* Plan Content */}
            <div className="p-8 space-y-8 bg-[#fdf7e7]">
                {activePlan.sections.map((sec, idx) => {
                    const key = mapTitleToKey(sec.title);
                    const isChecked = key ? currentChecks[key] : false;

                    return (
                        <div key={idx} className="relative">
                            <h4 className="flex items-center gap-2 text-sm font-bold text-[#3c584b] uppercase tracking-widest mb-4">
                                <div className={`w-3 h-3 rounded-full border-2 ${isChecked ? 'bg-[#cbd9ce] border-[#cbd9ce]' : 'border-[#cbd9ce]'}`}></div>
                                {sec.title}
                                {isChecked && <span className="text-[#3c584b] text-xs ml-2 bg-[#cbd9ce] px-2 py-0.5 rounded">Completado</span>}
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {sec.options.map((opt, optIdx) => (
                                    <div key={opt.id} className={`bg-[#fdf7e7] border rounded-lg p-5 shadow-sm hover:shadow-md transition-all relative ${isChecked ? 'border-[#cbd9ce] ring-1 ring-[#cbd9ce]' : 'border-[#cbd9ce]'}`}>
                                        <div className="flex justify-between items-start mb-2">
                                            <div className="text-xs font-bold text-[#3c584b] uppercase">Opción {optIdx + 1}:</div>

                                            {/* CHECKBOX FOR MEAL */}
                                            {key && (
                                                <div
                                                    onClick={() => handleCheck(key)}
                                                    className={`cursor-pointer w-6 h-6 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-[#cbd9ce] border-[#cbd9ce] text-[#3c584b]' : 'bg-[#fdf7e7] border-[#cbd9ce] text-transparent hover:border-blue-400'}`}
                                                >
                                                    <CheckCircle size={14} />
                                                </div>
                                            )}
                                        </div>
                                        <p className="text-[#3c584b] font-medium leading-relaxed">{opt.description}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )
                })}

                {/* Footer Boxes */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className={`bg-[#cbd9ce] border rounded-xl p-5 relative transition-all ${currentChecks.supplements ? 'border-[#cbd9ce] ring-1 ring-[#cbd9ce]' : 'border-blue-100'}`}>
                        <div className="flex justify-between items-start mb-2">
                            <h5 className="font-bold text-[#3c584b] text-xs uppercase flex items-center gap-2">
                                💊 Suplementos
                            </h5>
                            <div
                                onClick={() => handleCheck('supplements')}
                                className={`cursor-pointer w-6 h-6 rounded border flex items-center justify-center transition-colors ${currentChecks.supplements ? 'bg-[#cbd9ce] border-[#cbd9ce] text-[#3c584b]' : 'bg-[#fdf7e7] border-blue-200 text-transparent hover:border-blue-400'}`}
                            >
                                <CheckCircle size={14} />
                            </div>
                        </div>
                        <p className="text-sm text-[#3c584b] leading-relaxed">{activePlan.supplements || 'Sin suplementación.'}</p>
                    </div>

                    <div className="bg-[#cbd9ce] border border-red-100 rounded-xl p-5">
                        <h5 className="font-bold text-[#3c584b] text-xs uppercase mb-2 flex items-center gap-2">
                            🚫 Evitar
                        </h5>
                        <p className="text-sm text-[#3c584b] leading-relaxed">{activePlan.avoid || 'Ninguno.'}</p>
                    </div>
                </div>
            </div>

            {/* EDIT MODAL */}
            {
                showEditModal && (
                    <div className="fixed inset-0 bg-[#fdf7e7] backdrop-blur-sm flex items-center justify-center z-50 p-4">
                        <div className="bg-[#fdf7e7] border border-[#cbd9ce] rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                            {/* Header */}
                            <div className="bg-[#cbd9ce] p-4 flex justify-between items-center shrink-0 rounded-t-xl">
                                <h3 className="text-[#3c584b] font-bold text-lg">Editar Plan Nutricional</h3>
                                <button onClick={() => setShowEditModal(false)} className="text-[#3c584b] hover:text-[#3c584b]"><X size={24} /></button>
                            </div>

                            {/* Scrollable Body */}
                            <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                                {/* Basic Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                    <div className="md:col-span-2">
                                        <label className="block text-xs font-bold text-[#3c584b] uppercase mb-1">Nombre del Plan</label>
                                        <input
                                            type="text"
                                            value={editedPlan.name}
                                            onChange={e => setEditedPlan({ ...editedPlan, name: e.target.value })}
                                            className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded-lg p-2.5 text-[#3c584b]"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#3c584b] uppercase mb-1">Kcal Objetivo</label>
                                        <input
                                            type="number"
                                            value={editedPlan.kcalTarget}
                                            onChange={e => setEditedPlan({ ...editedPlan, kcalTarget: Number(e.target.value) })}
                                            className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded-lg p-2.5 text-[#3c584b]"
                                        />
                                    </div>
                                </div>

                                {/* Macronutrients Edit Section */}
                                <div className="bg-[#fdf7e7] border border-[#cbd9ce] rounded-xl p-4">
                                    <h4 className="text-sm font-bold text-[#3c584b] uppercase mb-4 text-center">Distribución de Macronutrientes</h4>
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                        {/* Protein */}
                                        <div className="bg-[#fdf7e7] rounded-lg p-3 border border-[#cbd9ce]">
                                            <label className="block text-xs font-bold text-[#3c584b] uppercase mb-1 text-center">Proteínas (%)</label>
                                            <div className="flex items-center gap-2 justify-center">
                                                <input
                                                    type="number"
                                                    value={editedPlan.macronutrients?.protein || 0}
                                                    onChange={e => handleMacroChange('protein', Number(e.target.value))}
                                                    className="w-20 bg-[#fdf7e7] border border-[#cbd9ce] rounded p-1 text-center text-[#3c584b] font-bold"
                                                />
                                            </div>
                                            <div className="text-center mt-2 text-xs text-[#3c584b]">
                                                {Math.round((editedPlan.kcalTarget * (editedPlan.macronutrients?.protein || 0)) / 100)} kcal
                                            </div>
                                            <div className="text-center mt-1 text-xs text-[#3c584b] font-bold">
                                                {((editedPlan.kcalTarget * (editedPlan.macronutrients?.protein || 0) / 100 / 4) / currentWeight).toFixed(1)} g/kg
                                            </div>
                                        </div>

                                        {/* Carbs */}
                                        <div className="bg-[#fdf7e7] rounded-lg p-3 border border-[#cbd9ce]">
                                            <label className="block text-xs font-bold text-[#3c584b] uppercase mb-1 text-center">Carbohidratos (%)</label>
                                            <div className="flex items-center gap-2 justify-center">
                                                <input
                                                    type="number"
                                                    value={editedPlan.macronutrients?.carbs || 0}
                                                    onChange={e => handleMacroChange('carbs', Number(e.target.value))}
                                                    className="w-20 bg-[#fdf7e7] border border-[#cbd9ce] rounded p-1 text-center text-[#3c584b] font-bold"
                                                />
                                            </div>
                                            <div className="text-center mt-2 text-xs text-[#3c584b]">
                                                {Math.round((editedPlan.kcalTarget * (editedPlan.macronutrients?.carbs || 0)) / 100)} kcal
                                            </div>
                                            <div className="text-center mt-1 text-xs text-[#3c584b] font-bold">
                                                {((editedPlan.kcalTarget * (editedPlan.macronutrients?.carbs || 0) / 100 / 4) / currentWeight).toFixed(1)} g/kg
                                            </div>
                                        </div>

                                        {/* Fats */}
                                        <div className="bg-[#fdf7e7] rounded-lg p-3 border border-[#cbd9ce]">
                                            <label className="block text-xs font-bold text-[#3c584b] uppercase mb-1 text-center">Grasas (%)</label>
                                            <div className="flex items-center gap-2 justify-center">
                                                <input
                                                    type="number"
                                                    value={editedPlan.macronutrients?.fats || 0}
                                                    onChange={e => handleMacroChange('fats', Number(e.target.value))}
                                                    className="w-20 bg-[#fdf7e7] border border-[#cbd9ce] rounded p-1 text-center text-[#3c584b] font-bold"
                                                />
                                            </div>
                                            <div className="text-center mt-2 text-xs text-[#3c584b]">
                                                {Math.round((editedPlan.kcalTarget * (editedPlan.macronutrients?.fats || 0)) / 100)} kcal
                                            </div>
                                            <div className="text-center mt-1 text-xs text-[#3c584b] font-bold">
                                                {((editedPlan.kcalTarget * (editedPlan.macronutrients?.fats || 0) / 100 / 9) / currentWeight).toFixed(1)} g/kg
                                            </div>
                                        </div>
                                    </div>
                                    <div className="mt-2 text-center text-xs text-[#3c584b]">
                                        Total: {(editedPlan.macronutrients?.protein || 0) + (editedPlan.macronutrients?.carbs || 0) + (editedPlan.macronutrients?.fats || 0)}%
                                    </div>
                                </div>

                                {/* Meal Sections */}
                                <div className="space-y-6">
                                    <div className="flex justify-between items-center border-b border-[#cbd9ce] pb-2">
                                        <h4 className="text-sm font-bold text-[#3c584b] uppercase">Comidas y Opciones</h4>
                                        <button
                                            onClick={() => setEditedPlan({
                                                ...editedPlan,
                                                sections: [...editedPlan.sections, { title: 'Nueva Comida', options: [] }]
                                            })}
                                            className="text-xs bg-[#fdf7e7] hover:bg-[#fdf7e7] text-[#3c584b] px-3 py-1.5 rounded flex items-center gap-1"
                                        >
                                            <Plus size={14} /> Agregar Tiempo de Comida
                                        </button>
                                    </div>

                                    {editedPlan.sections.map((section, sIdx) => (
                                        <div key={sIdx} className="bg-[#fdf7e7] border border-[#cbd9ce] rounded-xl p-4">
                                            <div className="flex justify-between items-center mb-3">
                                                <input
                                                    type="text"
                                                    value={section.title}
                                                    onChange={e => {
                                                        const newSections = [...editedPlan.sections];
                                                        newSections[sIdx].title = e.target.value;
                                                        setEditedPlan({ ...editedPlan, sections: newSections });
                                                    }}
                                                    className="bg-transparent border-b border-[#cbd9ce] text-[#3c584b] font-bold text-sm focus:border-[#cbd9ce] outline-none w-1/2"
                                                />
                                                <div className="flex gap-2">
                                                    <button
                                                        onClick={() => {
                                                            const newSections = [...editedPlan.sections];
                                                            newSections[sIdx].options.push({ id: Date.now().toString(), name: `Opción ${section.options.length + 1}`, description: '' });
                                                            setEditedPlan({ ...editedPlan, sections: newSections });
                                                        }}
                                                        className="text-xs text-[#3c584b] hover:text-[#3c584b] flex items-center gap-1"
                                                    >
                                                        <Plus size={12} /> Opción
                                                    </button>
                                                    <button
                                                        onClick={() => {
                                                            const newSections = editedPlan.sections.filter((_, i) => i !== sIdx);
                                                            setEditedPlan({ ...editedPlan, sections: newSections });
                                                        }}
                                                        className="text-xs text-[#3c584b] hover:text-[#3c584b]"
                                                    >
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-1 gap-3">
                                                {section.options.map((opt, oIdx) => (
                                                    <div key={oIdx} className="flex gap-3 items-start">
                                                        <div className="flex-1">
                                                            <input
                                                                type="text"
                                                                value={opt.name}
                                                                onChange={e => {
                                                                    const newSections = [...editedPlan.sections];
                                                                    newSections[sIdx].options[oIdx].name = e.target.value;
                                                                    setEditedPlan({ ...editedPlan, sections: newSections });
                                                                }}
                                                                className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded p-1.5 text-xs text-[#3c584b] mb-1"
                                                                placeholder="Nombre Opción"
                                                            />
                                                            <textarea
                                                                value={opt.description}
                                                                onChange={e => {
                                                                    const newSections = [...editedPlan.sections];
                                                                    newSections[sIdx].options[oIdx].description = e.target.value;
                                                                    setEditedPlan({ ...editedPlan, sections: newSections });
                                                                }}
                                                                className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded p-2 text-sm text-[#3c584b] resize-none h-20"
                                                                placeholder="Descripción de la comida..."
                                                            />
                                                        </div>
                                                        <button
                                                            onClick={() => {
                                                                const newSections = [...editedPlan.sections];
                                                                newSections[sIdx].options = newSections[sIdx].options.filter((_, i) => i !== oIdx);
                                                                setEditedPlan({ ...editedPlan, sections: newSections });
                                                            }}
                                                            className="text-[#3c584b] hover:text-[#3c584b] mt-2"
                                                        >
                                                            <X size={14} />
                                                        </button>
                                                    </div>
                                                ))}
                                                {section.options.length === 0 && <p className="text-xs text-[#3c584b] italic">Sin opciones.</p>}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Footer Info */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold text-[#3c584b] uppercase mb-1">Suplementos</label>
                                        <textarea
                                            value={editedPlan.supplements}
                                            onChange={e => setEditedPlan({ ...editedPlan, supplements: e.target.value })}
                                            className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded-lg p-3 text-[#3c584b] h-24"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#3c584b] uppercase mb-1">Evitar</label>
                                        <textarea
                                            value={editedPlan.avoid}
                                            onChange={e => setEditedPlan({ ...editedPlan, avoid: e.target.value })}
                                            className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded-lg p-3 text-[#3c584b] h-24"
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Footer Actions */}
                            <div className="p-4 border-t border-[#cbd9ce] flex justify-end gap-3 bg-[#fdf7e7] shrink-0 rounded-b-xl">
                                <button onClick={() => setShowEditModal(false)} className="px-6 py-2 text-[#3c584b] hover:text-[#3c584b] font-medium">Cancelar</button>
                                <button onClick={handleSavePlan} className="bg-[#cbd9ce] hover:bg-[#cbd9ce] text-[#3c584b] px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                                    <Save size={18} /> Guardar Plan
                                </button>
                            </div>
                        </div>
                    </div>
                )
            }
        </div >
    );
}