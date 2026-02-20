import React, { useMemo, useEffect } from 'react';
import { Activity, Calculator, FileText } from 'lucide-react';

interface Props {
    formData: any;
    onChange: (field: string, value: any) => void;
    gender: 'M' | 'F';
    dob: string;
}

const ACTIVITY_FACTORS = [
    { value: 1.2, label: 'Sedentario (Poco o nada ejercicio)' },
    { value: 1.375, label: 'Ligero (Ejercicio 1-3 días/sem)' },
    { value: 1.55, label: 'Moderado (Ejercicio 3-5 días/sem)' },
    { value: 1.725, label: 'Fuerte (Ejercicio 6-7 días/sem)' },
    { value: 1.9, label: 'Muy fuerte (Dos veces al día, entrenamientos duros)' },
];

const Input = ({ label, value, onChange, type = "number", readOnly = false, placeholder }: any) => (
    <div>
        <label className="block text-xs font-bold text-slate-400 mb-1 truncate" title={label}>{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange && onChange(e.target.value)}
            readOnly={readOnly}
            placeholder={placeholder}
            className={`w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-[var(--primary)] outline-none transition-colors ${readOnly ? 'opacity-50 cursor-not-allowed bg-slate-900' : ''}`}
        />
    </div>
);

export default function StepAnthropometry({ formData, onChange, gender, dob }: Props) {
    const data = formData.anthropometry || {};

    // Helper to update nested state
    const updateAuthro = (field: string, val: any) => {
        const newData = { ...data, [field]: val };
        onChange('anthropometry', newData);
    };

    const updateNested = (parent: string, field: string, val: any) => {
        const parentData = data[parent] || {};
        const newData = { ...data, [parent]: { ...parentData, [field]: parseFloat(val) || 0 } };
        onChange('anthropometry', newData);
    };

    // Calculation Logic (Effect to update derived values)
    useEffect(() => {
        const w = parseFloat(data.weight) || 0;
        const h = parseFloat(data.height) || 0;

        let updates: any = {};
        let hasUpdates = false;

        // IMC
        if (h > 0) {
            const hM = h / 100;
            const newImc = parseFloat((w / (hM * hM)).toFixed(1));
            if (newImc !== data.imc) {
                updates.imc = newImc;
                hasUpdates = true;
            }
        }

        // BMR & TDEE (Mifflin-St Jeor)
        if (w > 0 && h > 0 && dob) {
            const birthDate = new Date(dob);
            const age = new Date().getFullYear() - birthDate.getFullYear();
            let bmr = (10 * w) + (6.25 * h) - (5 * age);
            bmr += gender === 'M' ? 5 : -161;

            const act = parseFloat(data.activity) || 1.2;
            const tdee = Math.round(bmr * act);

            if (Math.round(bmr) !== data.bmr) {
                updates.bmr = Math.round(bmr);
                hasUpdates = true;
            }
            if (tdee !== data.tdee) {
                updates.tdee = tdee;
                hasUpdates = true;
            }
        }

        if (hasUpdates) {
            onChange('anthropometry', { ...data, ...updates });
        }
    }, [data.weight, data.height, data.activity, gender, dob]);

    // Sum & Average folds
    const foldsMetrics = useMemo(() => {
        const f = data.folds || {};
        const values = [f.bicipital, f.tricipital, f.subscapular, f.abdominal, f.suprailiac, f.quadriceps].map(v => parseFloat(v) || 0);
        const sum = values.reduce((a, b) => a + b, 0);
        const count = values.filter(v => v > 0).length;
        const avg = count > 0 ? sum / count : 0;
        return { sum, avg };
    }, [data.folds]);

    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Basics */}
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                    <h4 className="text-white font-bold mb-4 border-b border-slate-700 pb-2">Medidas Básicas</h4>
                    <div className="grid grid-cols-2 gap-4">
                        <Input label="Fecha y Hora" type="datetime-local" value={data.date || new Date().toISOString().slice(0, 16)} onChange={(v: any) => updateAuthro('date', v)} />
                        <Input label="Peso (kg)" value={data.weight} onChange={(v: any) => updateAuthro('weight', v)} />
                        <Input label="Altura (cm)" value={data.height} onChange={(v: any) => updateAuthro('height', v)} />
                        <Input label="IMC" value={data.imc || 0} readOnly />
                    </div>
                </div>

                {/* Energy */}
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                    <h4 className="text-white font-bold mb-4 border-b border-slate-700 pb-2 flex items-center gap-2">
                        <Activity size={16} className="text-green-500" /> Cálculo Energético (Mifflin-St Jeor)
                    </h4>
                    <div className="space-y-4">
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1 truncate">Factor Actividad</label>
                            <select
                                value={data.activity || 1.2}
                                onChange={e => updateAuthro('activity', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-[var(--primary)] outline-none"
                            >
                                {ACTIVITY_FACTORS.map(f => (
                                    <option key={f.value} value={f.value}>{f.label}</option>
                                ))}
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="BMR (Kcal)" value={data.bmr || 0} readOnly />
                            <Input label="TDEE (Kcal Diarias)" value={data.tdee || 0} readOnly />
                        </div>
                    </div>
                </div>

                {/* Circumferences */}
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                    <h4 className="text-white font-bold mb-4 border-b border-slate-700 pb-2">Circunferencias (cm)</h4>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <Input label="Cintura" value={data.circumference?.waist} onChange={(v: any) => updateNested('circumference', 'waist', v)} />
                        <Input label="Cadera" value={data.circumference?.hip} onChange={(v: any) => updateNested('circumference', 'hip', v)} />
                        <Input label="Abdomen" value={data.circumference?.abdomen} onChange={(v: any) => updateNested('circumference', 'abdomen', v)} />
                        <Input label="Pecho" value={data.circumference?.chest} onChange={(v: any) => updateNested('circumference', 'chest', v)} />
                        <Input label="Brazo Der" value={data.circumference?.armR} onChange={(v: any) => updateNested('circumference', 'armR', v)} />
                        <Input label="Brazo Izq" value={data.circumference?.armL} onChange={(v: any) => updateNested('circumference', 'armL', v)} />
                        <Input label="Muslo" value={data.circumference?.thigh} onChange={(v: any) => updateNested('circumference', 'thigh', v)} />
                        <Input label="Pantorrilla" value={data.circumference?.calf} onChange={(v: any) => updateNested('circumference', 'calf', v)} />
                    </div>
                </div>

                {/* Folds */}
                <div className="bg-slate-800/40 p-4 rounded-xl border border-slate-700">
                    <div className="flex justify-between items-center mb-4 border-b border-slate-700 pb-2">
                        <h4 className="text-white font-bold">Pliegues (mm)</h4>
                        <div className="flex gap-2">
                            <span className="text-xs font-bold text-blue-400 bg-blue-500/10 px-2 py-1 rounded border border-blue-500/20 flex items-center gap-1">
                                <Calculator size={10} /> Prom: {foldsMetrics.avg.toFixed(1)} mm
                            </span>
                            <span className="text-xs font-bold text-orange-400 bg-orange-500/10 px-2 py-1 rounded border border-orange-500/20 flex items-center gap-1">
                                <Calculator size={10} /> Σ {foldsMetrics.sum.toFixed(1)} mm
                            </span>
                        </div>
                    </div>
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
                        <Input label="Tricipital" value={data.folds?.tricipital} onChange={(v: any) => updateNested('folds', 'tricipital', v)} />
                        <Input label="Bicipital" value={data.folds?.bicipital} onChange={(v: any) => updateNested('folds', 'bicipital', v)} />
                        <Input label="Subescapular" value={data.folds?.subscapular} onChange={(v: any) => updateNested('folds', 'subscapular', v)} />
                        <Input label="Supraíliaco" value={data.folds?.suprailiac} onChange={(v: any) => updateNested('folds', 'suprailiac', v)} />
                        <Input label="Abdominal" value={data.folds?.abdominal} onChange={(v: any) => updateNested('folds', 'abdominal', v)} />
                        <Input label="Cuádriceps" value={data.folds?.quadriceps} onChange={(v: any) => updateNested('folds', 'quadriceps', v)} />
                    </div>
                </div>
            </div>
        </div>
    );
}
