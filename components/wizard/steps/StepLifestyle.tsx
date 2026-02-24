import React from 'react';
import { Activity, Moon, Coffee, Wallet, AlertCircle, Utensils } from 'lucide-react';

interface Props {
    formData: any;
    onChange: (field: string, value: any) => void;
}

const Input = ({ label, value, onChange, placeholder, type = "text" }: any) => (
    <div className="flex-1">
        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">{label}</label>
        <input
            type={type}
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-[var(--primary)] outline-none transition-colors focus:bg-slate-900"
        />
    </div>
);

const TextArea = ({ label, value, onChange, placeholder }: any) => (
    <div className="flex-1">
        <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">{label}</label>
        <textarea
            value={value}
            onChange={e => onChange(e.target.value)}
            placeholder={placeholder}
            className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-[var(--primary)] outline-none transition-colors h-20 resize-none focus:bg-slate-900"
        />
    </div>
);

const Checkbox = ({ label, checked, onChange }: any) => (
    <label className="flex items-center gap-3 cursor-pointer group bg-slate-900/30 p-3 rounded-lg border border-slate-700 hover:border-slate-600 transition-colors">
        <div className={`w-5 h-5 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-[var(--primary)] border-[var(--primary)]' : 'bg-slate-800 border-slate-600 group-hover:border-[var(--primary)]'}`}>
            {checked && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
        </div>
        <span className={`text-sm font-medium ${checked ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{label}</span>
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="hidden" />
    </label>
);

const Section = ({ title, icon: Icon, children }: any) => (
    <div className="bg-slate-800/40 border border-slate-700 rounded-xl p-5 mb-6">
        <div className="flex items-center gap-2 mb-5 text-[var(--primary)] border-b border-slate-700/50 pb-3">
            <Icon size={20} />
            <h4 className="font-bold uppercase text-sm tracking-wider text-white">{title}</h4>
        </div>
        {children}
    </div>
);

export default function StepLifestyle({ formData, onChange }: Props) {
    return (
        <div className="space-y-6">
            {/* Actividad Física */}
            <Section title="Actividad Física" icon={Activity}>
                <div className="mb-4">
                    <Checkbox
                        label="Realiza Actividad Física regularmente"
                        checked={formData.exercise}
                        onChange={(c: any) => onChange('exercise', c)}
                    />
                </div>

                {formData.exercise && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 animate-in fade-in slide-in-from-top-2">
                        <Input
                            label="Tipo de Ejercicio"
                            value={formData.exerciseType}
                            onChange={(v: any) => onChange('exerciseType', v)}
                            placeholder="Ej. Pesas, Cardio..."
                        />
                        <Input
                            label="Frecuencia"
                            value={formData.exerciseFrequency}
                            onChange={(v: any) => onChange('exerciseFrequency', v)}
                            placeholder="Ej. 3 veces/sem..."
                        />
                        <Input
                            label="Duración Promedio"
                            value={formData.exerciseDuration}
                            onChange={(v: any) => onChange('exerciseDuration', v)}
                            placeholder="Ej. 45 min..."
                        />
                    </div>
                )}

                <TextArea
                    label="Detalles Adicionales"
                    value={formData.exerciseDetails}
                    onChange={(v: any) => onChange('exerciseDetails', v)}
                    placeholder={formData.exercise ? "Intensidad, objetivos..." : "Sin detalles"}
                />
            </Section>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Sueño y Estrés */}
                <Section title="Sueño, Estrés y Sustancias" icon={Moon}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Horas Sueño" value={formData.sleepHours} onChange={(v: any) => onChange('sleepHours', v)} />
                            <div>
                                <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Nivel Estrés (General)</label>
                                <select
                                    value={formData.stress}
                                    onChange={e => onChange('stress', e.target.value)}
                                    className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-[var(--primary)] outline-none"
                                >
                                    <option value="">No especificado</option>
                                    <option value="Bajo">Bajo</option>
                                    <option value="Medio">Medio</option>
                                    <option value="Alto">Alto</option>
                                </select>
                            </div>
                        </div>
                        <Input label="Nivel Estrés (Diario)" value={formData.dailyStress} onChange={(v: any) => onChange('dailyStress', v)} placeholder="Ej. Del 1 al 10..." />
                        <Input label="Horarios Comida" value={formData.mealSchedules} onChange={(v: any) => onChange('mealSchedules', v)} />

                        <div className="grid grid-cols-2 gap-4 pt-2">
                            <div className="flex flex-col p-2 bg-slate-900/20 rounded-lg rounded-t-xl gap-2 border border-slate-700">
                                <Checkbox label="Alcohol" checked={formData.alcohol} onChange={(c: any) => onChange('alcohol', c)} />
                                {formData.alcohol && (
                                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-700/50">
                                        <Input label="Tipo" value={formData.alcoholType} onChange={(v: any) => onChange('alcoholType', v)} placeholder="Ej. Cerveza, Vino..." />
                                        <Input label="Frecuencia" value={formData.alcoholFrequency} onChange={(v: any) => onChange('alcoholFrequency', v)} placeholder="Ej. Fines de sem..." />
                                    </div>
                                )}
                            </div>
                            <div className="flex flex-col p-2 bg-slate-900/20 rounded-lg rounded-t-xl gap-2 border border-slate-700">
                                <Checkbox label="Tabaco" checked={formData.tobacco} onChange={(c: any) => onChange('tobacco', c)} />
                                {formData.tobacco && (
                                    <div className="grid grid-cols-1 gap-2 pt-2 border-t border-slate-700/50">
                                        <Input label="Tipo" value={formData.tobaccoType} onChange={(v: any) => onChange('tobaccoType', v)} placeholder="Ej. Cigarrillo, Vape..." />
                                        <Input label="Frecuencia" value={formData.tobaccoFrequency} onChange={(v: any) => onChange('tobaccoFrequency', v)} placeholder="Ej. 1 cajetilla/día" />
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Hábitos y Rutina */}
                <Section title="Hábitos y Rutina Diaria" icon={Coffee}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 gap-4">
                            <Input label="Suplementación Actual" value={formData.supplementation} onChange={(v: any) => onChange('supplementation', v)} />
                            <div className="grid grid-cols-1 gap-4">
                                <TextArea label="Medicamentos Peso / Sustancias" value={formData.weightLossMeds} onChange={(v: any) => onChange('weightLossMeds', v)} placeholder="Uso previo de medicamentos para bajar de peso..." />
                                {/* Assuming 'toxicSubstances' maps to weightLossMeds or we add a field? Using weightLossMeds for 'Medicamentos Peso'. */}
                            </div>
                        </div>

                        <TextArea label="Rutina Diaria (Resumen)" value={formData.dailyRoutine} onChange={(v: any) => onChange('dailyRoutine', v)} placeholder="Descripción breve de un día típico..." />

                        <div className="grid grid-cols-4 gap-2">
                            <div className="col-span-1">
                                <Input label="Horas Sentado" value={formData.sittingHours} onChange={(v: any) => onChange('sittingHours', v)} />
                            </div>
                            <div className="col-span-1">
                                <Input label="Hora Despertar" type="time" value={formData.wakeUpTime} onChange={(v: any) => onChange('wakeUpTime', v)} />
                            </div>
                            <div className="col-span-1">
                                <Input label="Hora Acostarse" type="time" value={formData.bedTime} onChange={(v: any) => onChange('bedTime', v)} />
                            </div>
                            <div className="col-span-1">
                                <Input label="Nivel Energía (Día)" value={formData.energyLevel} onChange={(v: any) => onChange('energyLevel', v)} placeholder="-" />
                            </div>
                        </div>

                        <Input label="¿Cuidas tu salud de otra manera?" value={formData.otherHealthCare} onChange={(v: any) => onChange('otherHealthCare', v)} />
                    </div>
                </Section>
            </div>

            {/* Hábitos Alimenticios */}
            <Section title="Hábitos Alimenticios" icon={Utensils}>
                <div className="grid grid-cols-2 gap-4">
                    <Input label="Tipo de dieta actual" value={formData.dietType} onChange={(v: any) => onChange('dietType', v)} placeholder="-" />
                    <TextArea label="Recetas favoritas" value={formData.favoriteRecipes} onChange={(v: any) => onChange('favoriteRecipes', v)} placeholder="-" />

                    <Input label="Número de comidas al día" value={formData.numMeals} onChange={(v: any) => onChange('numMeals', v)} placeholder="-" />
                    <Input label="Consumo Agua (vasos/litros)" value={formData.waterConsumption} onChange={(v: any) => onChange('waterConsumption', v)} placeholder="-" />

                    <Input label="¿Quién cocina?" value={formData.cookingHabits} onChange={(v: any) => onChange('cookingHabits', v)} placeholder="-" />
                    <Input label="Consumo Café (tazas)" value={formData.coffeeConsumption} onChange={(v: any) => onChange('coffeeConsumption', v)} placeholder="-" />

                    <Input label="Horarios para comer" value={formData.mealTimes} onChange={(v: any) => onChange('mealTimes', v)} placeholder="-" />
                    <Input label="Frecuencia comer fuera / a domicilio" value={formData.eatingOutFrequency} onChange={(v: any) => onChange('eatingOutFrequency', v)} placeholder="-" />

                    <Input label="Compañía / Distractores al comer" value={formData.eatingCompany} onChange={(v: any) => onChange('eatingCompany', v)} placeholder="-" />
                    <Input label="Frecuencia alimentos procesados" value={formData.processedFoodFrequency} onChange={(v: any) => onChange('processedFoodFrequency', v)} placeholder="-" />
                </div>
            </Section>

            {/* Preferencias y Economía */}
            <Section title="Preferencias y Economía" icon={Wallet}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                        <TextArea label="Preferencias" value={formData.likes} onChange={(v: any) => onChange('likes', v)} />
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Presupuesto</label>
                            <select
                                value={formData.budget}
                                onChange={e => onChange('budget', e.target.value)}
                                className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-[var(--primary)] outline-none"
                            >
                                <option value="Bajo">Bajo</option>
                                <option value="Medio">Medio</option>
                                <option value="Alto">Alto</option>
                            </select>
                        </div>
                        <Input label="Frecuencia de Comer Fuera" value={formData.eatingOutStat} onChange={(v: any) => onChange('eatingOutStat', v)} placeholder="Ej. 2 veces por semana..." />
                    </div>
                    <div className="space-y-4">
                        <TextArea label="Aversiones" value={formData.dislikes} onChange={(v: any) => onChange('dislikes', v)} />
                        <Input label="Acceso a Alimentos" value={formData.access} onChange={(v: any) => onChange('access', v)} placeholder="Ej. Súper, Mercado..." />
                    </div>
                </div>
            </Section>

            {/* Alergias */}
            <Section title="Alergias e Intolerancias" icon={AlertCircle}>
                <div className="space-y-4">
                    <TextArea label="Alergias Alimentarias" value={formData.foodAllergies} onChange={(v: any) => onChange('foodAllergies', v)} placeholder="Ninguna registrada." />
                    <TextArea label="Intolerancias Alimentarias" value={formData.foodIntolerances} onChange={(v: any) => onChange('foodIntolerances', v)} placeholder="Ninguna registrada." />
                </div>
            </Section>
        </div>
    );
}
