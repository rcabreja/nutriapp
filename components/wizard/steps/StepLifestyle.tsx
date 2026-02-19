import React from 'react';
import { Activity, Moon, Coffee, Utensils, X, Sun, Heart } from 'lucide-react';

interface Props {
    formData: any;
    onChange: (field: string, value: any) => void;
}

const Input = ({ label, value, onChange, placeholder, type = "text" }: any) => (
    <div>
        <label className="block text-xs font-bold text-slate-400 mb-1">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-[var(--primary)] outline-none transition-colors"
        />
    </div>
);

const TextArea = ({ label, value, onChange, placeholder }: any) => (
    <div>
        <label className="block text-xs font-bold text-slate-400 mb-1">{label}</label>
        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-[var(--primary)] outline-none transition-colors h-20 resize-none"
        />
    </div>
);

const Checkbox = ({ label, checked, onChange }: any) => (
    <label className="flex items-center gap-2 cursor-pointer group">
        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-[var(--primary)] border-[var(--primary)]' : 'bg-slate-800 border-slate-600 group-hover:border-[var(--primary)]'}`}>
            {checked && <X size={12} className="text-white" />}
        </div>
        <span className={`text-sm ${checked ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{label}</span>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="hidden" />
    </label>
);

const Section = ({ title, icon: Icon, children }: any) => (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-4">
        <div className="flex items-center gap-2 mb-4 text-blue-400 border-b border-slate-700 pb-2">
            <Icon size={18} />
            <h4 className="font-bold uppercase text-xs tracking-wider">{title}</h4>
        </div>
        {children}
    </div>
);

export default function StepLifestyle({ formData, onChange }: Props) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Actividad Física */}
                <Section title="Actividad Física" icon={Activity}>
                    <div className="space-y-4">
                        <Checkbox
                            label="Realiza ejercicio regularmente"
                            checked={formData.exercise}
                            onChange={(c: any) => onChange('exercise', c)}
                        />
                        {formData.exercise && (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2">
                                <Input
                                    label="Tipo de Ejercicio"
                                    value={formData.exerciseType}
                                    onChange={(v: any) => onChange('exerciseType', v)}
                                    placeholder="Ej. Pesas, Correr..."
                                />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input
                                        label="Frecuencia"
                                        value={formData.exerciseFrequency}
                                        onChange={(v: any) => onChange('exerciseFrequency', v)}
                                        placeholder="Ej. 3/sem"
                                    />
                                    <Input
                                        label="Duración (min)"
                                        value={formData.exerciseDuration}
                                        onChange={(v: any) => onChange('exerciseDuration', v)}
                                        placeholder="Ej. 45"
                                    />
                                </div>
                                <TextArea
                                    label="Detalles Adicionales"
                                    value={formData.exerciseDetails}
                                    onChange={(v: any) => onChange('exerciseDetails', v)}
                                    placeholder="Intensidad, horario, etc."
                                />
                            </div>
                        )}
                        <Input
                            label="Horas Sentado/Día"
                            value={formData.sittingHours}
                            onChange={(v: any) => onChange('sittingHours', v)}
                        />
                    </div>
                </Section>

                {/* Sueño y Energía */}
                <Section title="Sueño y Energía" icon={Moon}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Hora Levantarse" type="time" value={formData.wakeUpTime} onChange={(v: any) => onChange('wakeUpTime', v)} />
                            <Input label="Hora Acostarse" type="time" value={formData.bedTime} onChange={(v: any) => onChange('bedTime', v)} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input
                                label="Horas Sueño"
                                value={formData.sleepHours}
                                onChange={(v: any) => onChange('sleepHours', v)}
                            />
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1">Nivel Energía</label>
                                <select
                                    value={formData.energyLevel}
                                    onChange={e => onChange('energyLevel', e.target.value)}
                                    className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-[var(--primary)] outline-none"
                                >
                                    <option value="">Seleccionar</option>
                                    <option value="Cansado">Cansado</option>
                                    <option value="Variable">Variable</option>
                                    <option value="Activo">Activo</option>
                                </select>
                            </div>
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">Nivel de Estrés</label>
                            <select
                                value={formData.stress}
                                onChange={e => onChange('stress', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-[var(--primary)] outline-none"
                            >
                                <option value="">Seleccionar</option>
                                <option value="Bajo">Bajo</option>
                                <option value="Medio">Medio</option>
                                <option value="Alto">Alto</option>
                            </select>
                        </div>
                    </div>
                </Section>

                {/* Hábitos Generales */}
                <Section title="Hábitos y Rutina" icon={Coffee}>
                    <div className="space-y-3">
                        <div className="flex gap-4">
                            <Checkbox label="Alcohol" checked={formData.alcohol} onChange={(c: any) => onChange('alcohol', c)} />
                            <Checkbox label="Tabaco" checked={formData.tobacco} onChange={(c: any) => onChange('tobacco', c)} />
                        </div>
                        <Input
                            label="Consumo Agua"
                            value={formData.water}
                            onChange={(v: any) => onChange('water', v)}
                            placeholder="Ej. 2 Litros"
                        />
                        <Input
                            label="Estreñimiento / Digestión"
                            value={formData.bowel}
                            onChange={(v: any) => onChange('bowel', v)}
                        />
                        <TextArea
                            label="Rutina Diaria Breve"
                            value={formData.dailyRoutine}
                            onChange={(v: any) => onChange('dailyRoutine', v)}
                            placeholder="Despertar, trabajo, comidas..."
                        />
                    </div>
                </Section>

                {/* Preferencias y Salud */}
                <Section title="Preferencias y Salud" icon={Heart}>
                    <div className="space-y-3">
                        <Input
                            label="Suplementación Actual"
                            value={formData.supplementation}
                            onChange={(v: any) => onChange('supplementation', v)}
                        />
                        <Input
                            label="Intolerancias Alimentarias"
                            value={formData.foodIntolerances}
                            onChange={(v: any) => onChange('foodIntolerances', v)}
                            placeholder="Separar por comas..."
                        />
                        <div className="grid grid-cols-2 gap-4">
                            <TextArea label="Gustos" value={formData.likes} onChange={(v: any) => onChange('likes', v)} />
                            <TextArea label="Disgustos" value={formData.dislikes} onChange={(v: any) => onChange('dislikes', v)} />
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
}
