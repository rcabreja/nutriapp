import React, { useState } from 'react';
import { Patient, ClinicalHistory } from '../../types';
import { Edit2, X } from 'lucide-react';

interface Props {
    patient: Patient;
    updatePatient: (id: string, data: Partial<Patient>) => void;
    readOnly: boolean;
}

export default function ClinicalTab({ patient, updatePatient, readOnly }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState<ClinicalHistory>(patient.clinical);

    const handleSave = () => {
        updatePatient(patient.id, { clinical: data });
        setIsEditing(false);
    };

    const symptomsList = [
        'Dolores de cabeza', 'Fatiga', 'Diarrea', 'Estreñimiento', 'Dolor abdominal',
        'Distensión abdominal', 'Flatulencias', 'Reflujo', 'Acidez', 'Náuseas',
        'Mareos', 'Falta de memoria', 'Insomnio', 'Caída del cabello', 'Resequedad',
        'Piel seca o grasa', 'Prurito', 'Uñas quebradizas', 'Sangrado de encías',
        'Cicatrización lenta', 'Adormecimiento de las extremidades', 'Ansiedad', 'Depresión'
    ];

    const toggleSymptom = (symptom: string) => {
        const current = data.background.symptoms || [];
        const exists = current.includes(symptom);
        let newSymptoms;
        if (exists) {
            newSymptoms = current.filter(s => s !== symptom);
        } else {
            newSymptoms = [...current, symptom];
        }
        setData({ ...data, background: { ...data.background, symptoms: newSymptoms } });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Historia Clínica Nutricional</h3>
                {!readOnly && (
                    <button onClick={() => isEditing ? handleSave() : setIsEditing(true)} className={`${isEditing ? 'bg-green-600' : 'bg-slate-800'} text-white px-4 py-2 rounded-lg flex items-center gap-2 border border-slate-700 transition-colors`}>
                        <Edit2 size={16} /> {isEditing ? 'Guardar' : 'Editar'}
                    </button>
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-6">
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-blue-400 mb-4 uppercase border-b border-slate-800 pb-2">Antecedentes Clínicos</h4>
                        <div className="space-y-3">
                            <Field label="Motivo Consulta" value={data.background.motive} editing={isEditing} onChange={v => setData({ ...data, background: { ...data.background, motive: v } })} />
                            <Field label="Medicamentos" value={data.background.medications} editing={isEditing} onChange={v => setData({ ...data, background: { ...data.background, medications: v } })} />
                            <Field label="Heredofamiliares" value={data.background.familyHistory} editing={isEditing} onChange={v => setData({ ...data, background: { ...data.background, familyHistory: v } })} />
                            <Field label="Otros" value={data.background.pathological?.others} editing={isEditing} onChange={v => setData({ ...data, background: { ...data.background, pathological: { ...data.background.pathological!, others: v } } })} />
                            <Field label="Alergias (Clínicas)" value={data.background.pathological?.allergies} editing={isEditing} onChange={v => setData({ ...data, background: { ...data.background, pathological: { ...data.background.pathological!, allergies: v } } })} />
                        </div>
                    </div>

                    {/* Pathological Checkboxes and Text */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-blue-400 mb-4 uppercase border-b border-slate-800 pb-2">Patologías</h4>
                        <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4">
                            <Checkbox label="Diabetes" checked={data.background.pathological?.diabetes} editing={isEditing} onChange={(c: any) => setData({ ...data, background: { ...data.background, pathological: { ...data.background.pathological!, diabetes: c } } })} />
                            <Checkbox label="Cáncer" checked={data.background.pathological?.cancer} editing={isEditing} onChange={(c: any) => setData({ ...data, background: { ...data.background, pathological: { ...data.background.pathological!, cancer: c } } })} />
                            <Checkbox label="Dislipidemia" checked={data.background.pathological?.dislipidemia} editing={isEditing} onChange={(c: any) => setData({ ...data, background: { ...data.background, pathological: { ...data.background.pathological!, dislipidemia: c } } })} />
                            <Checkbox label="Anemia" checked={data.background.pathological?.anemia} editing={isEditing} onChange={(c: any) => setData({ ...data, background: { ...data.background, pathological: { ...data.background.pathological!, anemia: c } } })} />
                            <Checkbox label="Hipertensión" checked={data.background.pathological?.hypertension} editing={isEditing} onChange={(c: any) => setData({ ...data, background: { ...data.background, pathological: { ...data.background.pathological!, hypertension: c } } })} />
                            <Checkbox label="Enf. Renales" checked={data.background.pathological?.renal} editing={isEditing} onChange={(c: any) => setData({ ...data, background: { ...data.background, pathological: { ...data.background.pathological!, renal: c } } })} />
                        </div>
                        <Field label="Patologías" value={data.background.pathologies} editing={isEditing} onChange={(v: any) => setData({ ...data, background: { ...data.background, pathologies: v } })} />
                    </div>

                    {/* Symptoms Section */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-red-400 mb-4 uppercase border-b border-slate-800 pb-2">Sintomatología Actual</h4>
                        <div className="grid grid-cols-2 gap-y-2 gap-x-4 text-sm mb-4">
                            {symptomsList.map(sym => (
                                <Checkbox
                                    key={sym}
                                    label={sym}
                                    checked={data.background.symptoms?.includes(sym)}
                                    editing={isEditing}
                                    onChange={() => toggleSymptom(sym)}
                                />
                            ))}
                        </div>
                        <Field label="Más Sintomatología" value={data.background.currentSymptoms} editing={isEditing} onChange={(v: any) => setData({ ...data, background: { ...data.background, currentSymptoms: v } })} />
                    </div>
                </div>

                <div className="space-y-6">
                    {/* Gyneco */}
                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-purple-400 mb-4 uppercase border-b border-slate-800 pb-2">Gineco-obstétricos</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                            <Field label="G" value={data.gyneco?.g} editing={isEditing} onChange={v => setData({ ...data, gyneco: { ...data.gyneco!, g: v } })} />
                            <Field label="P" value={data.gyneco?.p} editing={isEditing} onChange={v => setData({ ...data, gyneco: { ...data.gyneco!, p: v } })} />
                            <Field label="C" value={data.gyneco?.c} editing={isEditing} onChange={v => setData({ ...data, gyneco: { ...data.gyneco!, c: v } })} />
                            <Field label="A" value={data.gyneco?.a} editing={isEditing} onChange={v => setData({ ...data, gyneco: { ...data.gyneco!, a: v } })} />
                        </div>
                        <div className="space-y-3">
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="FUM" value={data.gyneco?.fum} editing={isEditing} type="date" onChange={v => setData({ ...data, gyneco: { ...data.gyneco!, fum: v } })} />
                                <Field label="Menarca" value={data.gyneco?.menarche} editing={isEditing} onChange={v => setData({ ...data, gyneco: { ...data.gyneco!, menarche: v } })} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Field label="Duración Ciclo (días)" value={data.gyneco?.cycleDuration} editing={isEditing} onChange={v => setData({ ...data, gyneco: { ...data.gyneco!, cycleDuration: v } })} />
                                <div>
                                    <label className="text-xs text-slate-500 font-bold block mb-1">Regularidad</label>
                                    {isEditing ? (
                                        <select
                                            value={data.gyneco?.cycleRegularity || ''}
                                            onChange={e => setData({ ...data, gyneco: { ...data.gyneco!, cycleRegularity: e.target.value as any } })}
                                            className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none"
                                        >
                                            <option value="">Seleccionar</option>
                                            <option value="Regular">Regular</option>
                                            <option value="Irregular">Irregular</option>
                                        </select>
                                    ) : (
                                        <p className="text-sm text-slate-200 border-b border-slate-800 pb-1 h-[30px] flex items-center">{data.gyneco?.cycleRegularity || '-'}</p>
                                    )}
                                </div>
                            </div>
                            <Field label="Anticonceptivos" value={data.gyneco?.contraception} editing={isEditing} onChange={v => setData({ ...data, gyneco: { ...data.gyneco!, contraception: v } })} />
                        </div>
                    </div>

                    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                        <h4 className="text-sm font-bold text-blue-400 mb-4 uppercase border-b border-slate-800 pb-2">Recordatorio 24H (Básico)</h4>
                        <div className="space-y-3">
                            <Field label="Desayuno" value={data.recall24h.breakfast} editing={isEditing} onChange={v => setData({ ...data, recall24h: { ...data.recall24h, breakfast: v } })} />
                            <Field label="Comida" value={data.recall24h.lunch} editing={isEditing} onChange={v => setData({ ...data, recall24h: { ...data.recall24h, lunch: v } })} />
                            <Field label="Cena" value={data.recall24h.dinner} editing={isEditing} onChange={v => setData({ ...data, recall24h: { ...data.recall24h, dinner: v } })} />
                        </div>
                    </div>
                </div>
            </div>

        </div>
    );
}

const Field = ({ label, value, editing, onChange, type = "text" }: any) => (
    <div>
        <label className="text-xs text-slate-500 font-bold block mb-1">{label}</label>
        {editing ? (
            <input
                type={type}
                className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none transition-colors"
                value={value || ''}
                onChange={e => onChange(e.target.value)}
            />
        ) : (
            <p className="text-sm text-slate-200 border-b border-slate-800 pb-1 h-[30px] flex items-center">{value || '-'}</p>
        )}
    </div>
);

const Checkbox = ({ label, checked, editing, onChange }: any) => (
    <label className={`flex items-center gap-2 ${editing ? 'cursor-pointer group' : 'cursor-default opacity-80'}`}>
        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-[var(--primary)] border-[var(--primary)]' : 'bg-slate-800 border-slate-600 group-hover:border-[var(--primary)]'}`}>
            {checked && <X size={12} className="text-white" />}
        </div>
        <span className={`text-sm ${checked ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{label}</span>
        {/* Hidden input for semantics */}
        <input type="checkbox" disabled={!editing} checked={checked || false} onChange={e => onChange(e.target.checked)} className="hidden" />
    </label>
);