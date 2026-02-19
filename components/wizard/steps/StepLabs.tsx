import React from 'react';
import { Calendar, AlertTriangle } from 'lucide-react';

interface Props {
    formData: any;
    onChange: (field: string, value: any) => void;
}

const InputGroup = ({ label, children }: { label: string, children?: React.ReactNode }) => (
    <div>
        <label className="block text-xs font-bold text-slate-500 uppercase mb-1.5">{label}</label>
        {children}
    </div>
)

const InputMetric = ({ label, value, onChange }: { label: string, value: string, onChange: (v: string) => void }) => (
    <InputGroup label={label}>
        <input
            type="number"
            placeholder="0"
            value={value}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white outline-none focus:border-[var(--primary)]"
        />
    </InputGroup>
)

export default function StepLabs({ formData, onChange }: Props) {
    const data = formData.initialLab || {};

    const updateLab = (field: string, val: string) => {
        onChange('initialLab', { ...data, [field]: val });
    };

    return (
        <div className="space-y-6">
            <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4">
                <div className="bg-blue-500/10 border border-blue-500/20 rounded-lg p-3 mb-6 flex gap-3 items-start">
                    <AlertTriangle className="text-blue-400 shrink-0 mt-0.5" size={18} />
                    <p className="text-sm text-blue-200">
                        Opcional: Si el paciente tiene análisis recientes, puedes registrarlos aquí. Se creará un registro con la fecha actual.
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                    <InputGroup label="FECHA Y HORA">
                        <div className="relative">
                            <input
                                type="datetime-local"
                                value={data.date || new Date().toISOString().slice(0, 16)}
                                onChange={e => updateLab('date', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white outline-none focus:border-[var(--primary)]"
                            />
                            <Calendar className="absolute right-3 top-3 text-slate-400 pointer-events-none" size={16} />
                        </div>
                    </InputGroup>
                    <InputGroup label="NOMBRE DE PERFIL">
                        <input
                            type="text"
                            placeholder="Ej. Perfil Inicial"
                            value={data.name || ''}
                            onChange={e => updateLab('name', e.target.value)}
                            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white outline-none focus:border-[var(--primary)] placeholder-slate-500"
                        />
                    </InputGroup>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
                    <InputMetric label="GLUCOSA (MG/DL)" value={data.glucose || ''} onChange={(v) => updateLab('glucose', v)} />
                    <InputMetric label="COLESTEROL (MG/DL)" value={data.cholesterol || ''} onChange={(v) => updateLab('cholesterol', v)} />
                    <InputMetric label="TRIGLICÉRIDOS" value={data.triglycerides || ''} onChange={(v) => updateLab('triglycerides', v)} />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <InputMetric label="HEMOGLOBINA" value={data.hemoglobin || ''} onChange={(v) => updateLab('hemoglobin', v)} />
                    <InputMetric label="HEMATOCRITO" value={data.hematocrit || ''} onChange={(v) => updateLab('hematocrit', v)} />
                </div>
            </div>
        </div>
    );
}
