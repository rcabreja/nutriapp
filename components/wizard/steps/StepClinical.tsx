import React from 'react';
import { X, Pill, Users, Stethoscope, Utensils, Clock } from 'lucide-react';

interface Props {
    formData: any;
    onChange: (field: string, value: any) => void;
}

const Input = ({ label, value, onChange, type = "text", placeholder }: any) => (
    <div>
        <label className="block text-xs font-bold text-slate-400 mb-1 truncate" title={label}>{label}</label>
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

export default function StepClinical({ formData, onChange }: Props) {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Antecedentes Patológicos */}
                <Section title="Antecedentes Patológicos" icon={Stethoscope}>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4">
                        <Checkbox label="Diabetes" checked={formData.diabetes} onChange={(c: any) => onChange('diabetes', c)} />
                        <Checkbox label="Cáncer" checked={formData.cancer} onChange={(c: any) => onChange('cancer', c)} />
                        <Checkbox label="Dislipidemia" checked={formData.dislipidemia} onChange={(c: any) => onChange('dislipidemia', c)} />
                        <Checkbox label="Anemia" checked={formData.anemia} onChange={(c: any) => onChange('anemia', c)} />
                        <Checkbox label="Hipertensión" checked={formData.hypertension} onChange={(c: any) => onChange('hypertension', c)} />
                        <Checkbox label="Enf. Renales" checked={formData.renal} onChange={(c: any) => onChange('renal', c)} />
                    </div>
                    <div className="space-y-3">
                        <Input label="Otros Antecedentes" value={formData.others} onChange={(v: any) => onChange('others', v)} />
                        <Input label="Alergias" value={formData.allergies} onChange={(v: any) => onChange('allergies', v)} />
                    </div>
                </Section>

                {/* Antecedentes Heredofamiliares y Medicación */}
                <Section title="General" icon={Users}>
                    <div className="space-y-4">
                        <TextArea
                            label="Antecedentes Heredofamiliares"
                            value={formData.familyHistory}
                            onChange={(v: any) => onChange('familyHistory', v)}
                            placeholder="Diabetes, Hipertensión en padres/abuelos..."
                        />
                        <TextArea
                            label="Medicación Actual"
                            value={formData.medications}
                            onChange={(v: any) => onChange('medications', v)}
                            placeholder="Nombre, dosis, frecuencia..."
                        />
                    </div>
                </Section>
            </div>

            {/* Gineco-obstétricos (Only for Females) */}
            {formData.gender === 'F' && (
                <Section title="Gineco-obstétricos" icon={Users}>
                    <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                        <Input label="G (Gestas)" value={formData.g} onChange={(v: any) => onChange('g', v)} />
                        <Input label="P (Partos)" value={formData.p} onChange={(v: any) => onChange('p', v)} />
                        <Input label="C (Cesáreas)" value={formData.c} onChange={(v: any) => onChange('c', v)} />
                        <Input label="A (Abortos)" value={formData.a} onChange={(v: any) => onChange('a', v)} />
                        <Input label="FUM" type="date" value={formData.fum} onChange={(v: any) => onChange('fum', v)} />
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <Input label="Método Anticonceptivo" value={formData.contraception} onChange={(v: any) => onChange('contraception', v)} />
                        <Input label="Menarca (edad)" value={formData.menarche} onChange={(v: any) => onChange('menarche', v)} />
                        <Input label="Duración Ciclo (días)" value={formData.cycleDuration} onChange={(v: any) => onChange('cycleDuration', v)} />
                        <div>
                            <label className="block text-xs font-bold text-slate-400 mb-1">Regularidad</label>
                            <select
                                value={formData.cycleRegularity}
                                onChange={e => onChange('cycleRegularity', e.target.value)}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-[var(--primary)] outline-none"
                            >
                                <option value="">Seleccionar</option>
                                <option value="Regular">Regular</option>
                                <option value="Irregular">Irregular</option>
                            </select>
                        </div>
                    </div>
                </Section>
            )}

            {/* Hábitos Nutricionales */}
            <Section title="Hábitos Nutricionales" icon={Utensils}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Input label="Tipo de Dieta" value={formData.dietType} onChange={(v: any) => onChange('dietType', v)} placeholder="Omnívora, Vegetariana..." />
                    <Input label="Quién cocina?" value={formData.cookingHabits} onChange={(v: any) => onChange('cookingHabits', v)} />
                    <Input label="Compañía al comer" value={formData.eatingCompany} onChange={(v: any) => onChange('eatingCompany', v)} placeholder="Solo, Familia..." />
                    <Input label="Consumo Café (tazas/día)" value={formData.coffeeConsumption} onChange={(v: any) => onChange('coffeeConsumption', v)} />
                    <Input label="Comidas Fuera (veces/sem)" value={formData.eatingOutFrequency} onChange={(v: any) => onChange('eatingOutFrequency', v)} />
                    <Input label="Alimentos Procesados" value={formData.processedFoodFrequency} onChange={(v: any) => onChange('processedFoodFrequency', v)} />
                </div>
                <div className="mt-4">
                    <TextArea label="Recetas Favoritas" value={formData.favoriteRecipes} onChange={(v: any) => onChange('favoriteRecipes', v)} />
                </div>
            </Section>

            {/* Recordatorio 24h */}
            <Section title="Recordatorio 24 Horas" icon={Clock}>
                <div className="space-y-3">
                    <Input label="Desayuno" value={formData.recallBreakfast} onChange={(v: any) => onChange('recallBreakfast', v)} placeholder="Hora y alimentos..." />
                    <Input label="Colación Mañana" value={formData.recallSnackAM} onChange={(v: any) => onChange('recallSnackAM', v)} />
                    <Input label="Almuerzo" value={formData.recallLunch} onChange={(v: any) => onChange('recallLunch', v)} />
                    <Input label="Colación Tarde" value={formData.recallSnackPM} onChange={(v: any) => onChange('recallSnackPM', v)} />
                    <Input label="Cena" value={formData.recallDinner} onChange={(v: any) => onChange('recallDinner', v)} />
                </div>
            </Section>
        </div>
    );
}

