import React from 'react';
import { Calendar, Clock } from 'lucide-react';

interface Props {
    formData: any;
    onChange: (field: string, value: any) => void;
}

const InputQ = ({ label, value, onChange }: any) => (
    <div>
        <label className="block text-[10px] font-bold text-slate-400 uppercase mb-1">{label}</label>
        <input
            type="text"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-sm focus:border-[var(--primary)] outline-none transition-colors"
        />
    </div>
);

export default function StepEvolution({ formData, onChange }: Props) {
    // We map formData evolution fields directly
    const handleEvolutionChange = (field: string, value: string) => {
        onChange('evolution', {
            ...formData.evolution,
            [field]: value
        });
    };

    return (
        <div className="space-y-6">
            <h2 className="text-xl font-bold text-white border-b border-slate-800 pb-2">Registro Inicial de Evolución</h2>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1">FECHA Y HORA VISITA</label>
                    <div className="relative">
                        <input
                            type="datetime-local"
                            value={formData.evolutionDate}
                            onChange={e => onChange('evolutionDate', e.target.value)}
                            className="w-full bg-[var(--card-bg)] border border-slate-700 rounded-lg p-3 text-white focus:border-[var(--primary)] outline-none transition-all"
                        />
                        <Calendar className="absolute right-3 top-3 text-slate-500 pointer-events-none" size={18} />
                    </div>
                </div>

                <div>
                    <label className="block text-xs font-bold text-slate-400 uppercase mb-1 flex items-center gap-1">
                        <Clock size={12} /> FECHA Y HORA PRÓXIMA CITA
                    </label>
                    <div className="relative">
                        <input
                            type="datetime-local"
                            value={formData.evolutionNextAppt}
                            onChange={e => onChange('evolutionNextAppt', e.target.value)}
                            className="w-full bg-[var(--card-bg)] border border-slate-700 rounded-lg p-3 text-white focus:border-[var(--primary)] outline-none transition-all"
                        />
                        <Calendar className="absolute right-3 top-3 text-slate-500 pointer-events-none" size={18} />
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">OBJETIVO DE LA VISITA</label>
                <input
                    type="text"
                    placeholder="Ej. Revisión de apego, Ajuste calórico..."
                    value={formData.evolutionObjective}
                    onChange={e => onChange('evolutionObjective', e.target.value)}
                    className="w-full bg-[var(--card-bg)] border border-slate-700 rounded-lg p-3 text-white placeholder-slate-600 focus:border-[var(--primary)] outline-none transition-all"
                />
            </div>

            <div className="bg-slate-800/30 border border-slate-700 p-4 rounded-xl space-y-4">
                <h4 className="text-sm font-bold text-[var(--primary)] uppercase border-b border-slate-700 pb-2">Cuestionario de Evolución</h4>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <InputQ label="¿Cómo te sentiste con el plan? (Gustos/Disgustos)" value={formData.evolution?.feelingWithPlan} onChange={(v: string) => handleEvolutionChange('feelingWithPlan', v)} />
                    <InputQ label="¿Apego al plan?" value={formData.evolution?.adherence} onChange={(v: string) => handleEvolutionChange('adherence', v)} />

                    <InputQ label="¿Hambre o Ansiedad?" value={formData.evolution?.hungerOrAnxiety} onChange={(v: string) => handleEvolutionChange('hungerOrAnxiety', v)} />
                    <InputQ label="¿Inflamación?" value={formData.evolution?.inflammation} onChange={(v: string) => handleEvolutionChange('inflammation', v)} />

                    <InputQ label="¿Estreñimiento?" value={formData.evolution?.constipation} onChange={(v: string) => handleEvolutionChange('constipation', v)} />
                    <InputQ label="¿Estrés por cambios?" value={formData.evolution?.stress} onChange={(v: string) => handleEvolutionChange('stress', v)} />

                    <InputQ label="¿Calidad de Sueño?" value={formData.evolution?.sleep} onChange={(v: string) => handleEvolutionChange('sleep', v)} />
                    <InputQ label="¿Consumo de Agua?" value={formData.evolution?.water} onChange={(v: string) => handleEvolutionChange('water', v)} />

                    <InputQ label="¿Comidas fuera?" value={formData.evolution?.eatingOut} onChange={(v: string) => handleEvolutionChange('eatingOut', v)} />
                    <InputQ label="¿Ejercicio?" value={formData.evolution?.exercise} onChange={(v: string) => handleEvolutionChange('exercise', v)} />

                    <div className="md:col-span-2">
                        <InputQ label="¿Modificaciones deseadas?" value={formData.evolution?.modifications} onChange={(v: string) => handleEvolutionChange('modifications', v)} />
                    </div>
                    <div className="md:col-span-2">
                        <label className="block text-xs font-bold text-green-500 uppercase mb-1">PLAN / MANEJO</label>
                        <textarea
                            value={formData.evolution?.management || ''}
                            onChange={e => handleEvolutionChange('management', e.target.value)}
                            className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2 text-white text-sm h-20 focus:border-[var(--primary)] outline-none transition-all resize-none"
                            placeholder="Plan de acción..."
                        ></textarea>
                    </div>
                </div>
            </div>

            <div>
                <label className="block text-xs font-bold text-slate-400 uppercase mb-1">OBSERVACIONES / ANÁLISIS CLÍNICO</label>
                <textarea
                    placeholder="Ej. Paciente refiere sentirse con más energía..."
                    value={formData.evolutionObservations}
                    onChange={e => onChange('evolutionObservations', e.target.value)}
                    className="w-full bg-[var(--card-bg)] border border-slate-700 rounded-lg p-3 text-white placeholder-slate-600 h-32 focus:border-[var(--primary)] outline-none transition-all resize-none"
                ></textarea>
            </div>
        </div>
    );
}
