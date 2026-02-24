import React from 'react';
import { Stethoscope, Activity, Utensils, Clock, AlertCircle, FileText } from 'lucide-react';

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
    <label className="flex items-center gap-2 cursor-pointer group">
        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-[var(--primary)] border-[var(--primary)]' : 'bg-slate-800 border-slate-600 group-hover:border-[var(--primary)]'}`}>
            {checked && <div className="w-2.5 h-2.5 bg-white rounded-sm" />}
        </div>
        <span className={`text-sm ${checked ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{label}</span>
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

const SYMPTOMS_LIST = [
    "Dolores de cabeza", "Diarrea", "Dolor abdominal", "Flatulencias", "Acidez", "Mareos",
    "Insomnio", "Resequedad", "Prurito", "Sangrado de encías", "Adormecimiento de las extremidades", "Depresión",
    "Fatiga", "Estreñimiento", "Distensión abdominal", "Reflujo", "Náuseas", "Falta de memoria",
    "Caída del cabello", "Piel seca o grasa", "Uñas quebradizas", "Cicatrización lenta", "Ansiedad"
];

const FOOD_GROUPS = [
    "Verduras", "Frutas", "Cereales", "Tubérculos", "Leguminosas", "Carnes Rojas", "Pollo / Pavo",
    "Pescados", "Huevo", "Embutidos", "Lácteos", "Grasas", "Azúcares"
];

const FREQUENCIES = ["Diario", "Semanal", "Quincenal", "Ocasional", "Nunca"];

export default function StepClinical({ formData, onChange }: Props) {

    const toggleSymptom = (symptom: string, checked: boolean) => {
        const current = formData.symptoms || [];
        if (checked) {
            onChange('symptoms', [...current, symptom]);
        } else {
            onChange('symptoms', current.filter((s: string) => s !== symptom));
        }
    };

    const updateFrequency = (group: string, freq: string) => {
        const current = formData.foodFrequencies || {};
        onChange('foodFrequencies', { ...current, [group]: freq });
    };

    return (
        <div className="space-y-6">

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Antecedentes Clínicos */}
                <Section title="Antecedentes Clínicos" icon={Stethoscope}>
                    <div className="space-y-4">
                        <TextArea label="Motivo Consulta" value={formData.motive} onChange={(v: any) => onChange('motive', v)} placeholder="-" />
                        <TextArea label="Medicamentos" value={formData.medications} onChange={(v: any) => onChange('medications', v)} placeholder="-" />
                        <TextArea label="Heredofamiliares" value={formData.familyHistory} onChange={(v: any) => onChange('familyHistory', v)} placeholder="-" />
                        <Input label="Otros" value={formData.others} onChange={(v: any) => onChange('others', v)} placeholder="-" />
                        <Input label="Alergias (Clínicas)" value={formData.allergies} onChange={(v: any) => onChange('allergies', v)} placeholder="-" />
                    </div>
                </Section>

                {/* Gineco-Obstétricos / Patologías */}
                <div className="space-y-6">
                    {/* Patologías */}
                    <Section title="Patologías" icon={AlertCircle}>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                            <Checkbox label="Diabetes" checked={formData.diabetes} onChange={(c: any) => onChange('diabetes', c)} />
                            <Checkbox label="Cáncer" checked={formData.cancer} onChange={(c: any) => onChange('cancer', c)} />
                            <Checkbox label="Dislipidemia" checked={formData.dislipidemia} onChange={(c: any) => onChange('dislipidemia', c)} />
                            <Checkbox label="Anemia" checked={formData.anemia} onChange={(c: any) => onChange('anemia', c)} />
                            <Checkbox label="Hipertensión" checked={formData.hypertension} onChange={(c: any) => onChange('hypertension', c)} />
                            <Checkbox label="Enf. Renales" checked={formData.renal} onChange={(c: any) => onChange('renal', c)} />
                        </div>
                        <div className="mt-4">
                            <TextArea label="Patologías" value={formData.pathologiesDescription} onChange={(v: any) => onChange('pathologiesDescription', v)} placeholder="Describa de ser necesario..." />
                        </div>
                    </Section>

                    {/* Gineco (Conditional) */}
                    {formData.gender === 'F' && (
                        <Section title="Gineco-Obstétricos" icon={Activity}>
                            <div className="grid grid-cols-4 gap-2 mb-4">
                                <Input label="G" value={formData.g} onChange={(v: any) => onChange('g', v)} placeholder="-" />
                                <Input label="P" value={formData.p} onChange={(v: any) => onChange('p', v)} placeholder="-" />
                                <Input label="C" value={formData.c} onChange={(v: any) => onChange('c', v)} placeholder="-" />
                                <Input label="A" value={formData.a} onChange={(v: any) => onChange('a', v)} placeholder="-" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="FUM" type="date" value={formData.fum} onChange={(v: any) => onChange('fum', v)} />
                                <Input label="Menarca" value={formData.menarche} onChange={(v: any) => onChange('menarche', v)} placeholder="-" />
                                <Input label="Duración Ciclo" value={formData.cycleDuration} onChange={(v: any) => onChange('cycleDuration', v)} placeholder="-" />
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 mb-1 uppercase tracking-wider">Regularidad</label>
                                    <select
                                        value={formData.cycleRegularity}
                                        onChange={e => onChange('cycleRegularity', e.target.value)}
                                        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg p-2.5 text-white text-sm focus:border-[var(--primary)] outline-none"
                                    >
                                        <option value="">-</option>
                                        <option value="Regular">Regular</option>
                                        <option value="Irregular">Irregular</option>
                                    </select>
                                </div>
                            </div>
                            <div className="mt-4">
                                <Input label="Anticonceptivos" value={formData.contraception} onChange={(v: any) => onChange('contraception', v)} placeholder="-" />
                            </div>
                        </Section>
                    )}
                </div>
            </div>

            {/* Sintomatología Actual */}
            <Section title="Sintomatología Actual" icon={Activity}>
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
                    {SYMPTOMS_LIST.map(symptom => (
                        <Checkbox
                            key={symptom}
                            label={symptom}
                            checked={(formData.symptoms || []).includes(symptom)}
                            onChange={(c: boolean) => toggleSymptom(symptom, c)}
                        />
                    ))}
                </div>
                <div className="mt-4">
                    <TextArea label="Más Sintomatología" value={formData.currentSymptoms} onChange={(v: any) => onChange('currentSymptoms', v)} placeholder="Escriba síntomas adicionales o describa los actuales..." />
                </div>
            </Section>

            {/* Recordatorio 24h & Hábitos Alimenticios */}
            <Section title="Recordatorio 24H (Básico)" icon={Clock}>
                <div className="space-y-4">
                    <TextArea label="Desayuno" value={formData.recallBreakfast} onChange={(v: any) => onChange('recallBreakfast', v)} placeholder="-" />
                    <TextArea label="Comida" value={formData.recallLunch} onChange={(v: any) => onChange('recallLunch', v)} placeholder="-" />
                    <TextArea label="Cena" value={formData.recallDinner} onChange={(v: any) => onChange('recallDinner', v)} placeholder="-" />
                </div>
            </Section>

            {/* Frecuencia de Consumo */}
            <Section title="Frecuencia de Consumo" icon={FileText}>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead>
                            <tr className="border-b border-slate-700 text-slate-400">
                                <th className="py-2 px-2">Grupo</th>
                                {FREQUENCIES.map(f => (
                                    <th key={f} className="py-2 px-2 text-center">{f}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {FOOD_GROUPS.map((group, idx) => (
                                <tr key={group} className={`border-b border-slate-800/50 hover:bg-white/5 transition-colors ${idx % 2 === 0 ? 'bg-slate-900/30' : ''}`}>
                                    <td className="py-2.5 px-2 font-medium text-white">{group}</td>
                                    {FREQUENCIES.map(freq => (
                                        <td key={freq} className="py-2.5 px-2 text-center">
                                            <label className="cursor-pointer flex justify-center">
                                                <input
                                                    type="radio"
                                                    name={`freq-${group}`}
                                                    checked={formData.foodFrequencies?.[group] === freq}
                                                    onChange={() => updateFrequency(group, freq)}
                                                    className="w-4 h-4 text-[var(--primary)] bg-slate-800 border-slate-600 focus:ring-[var(--primary)] focus:ring-2"
                                                />
                                            </label>
                                        </td>
                                    ))}
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </Section>
        </div>
    );
}

