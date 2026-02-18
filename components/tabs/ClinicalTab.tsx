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

  const foodGroups = [
      'Verduras', 'Frutas', 'Cereales', 'Tubérculos', 'Leguminosas', 
      'Carnes Rojas', 'Pollo / Pavo', 'Pescados', 'Huevo', 'Embutidos', 
      'Lácteos', 'Grasas', 'Azúcares'
  ];
  const frequencies = ['Diario', 'Semanal', 'Quincenal', 'Ocasional', 'Nunca'];

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
                        <Field label="Motivo Consulta" value={data.background.motive} editing={isEditing} onChange={v => setData({...data, background: {...data.background, motive: v}})} />
                        <Field label="Medicamentos" value={data.background.medications} editing={isEditing} onChange={v => setData({...data, background: {...data.background, medications: v}})} />
                        <Field label="Heredofamiliares" value={data.background.familyHistory} editing={isEditing} onChange={v => setData({...data, background: {...data.background, familyHistory: v}})} />
                        <Field label="Otros" value={data.background.pathological?.others} editing={isEditing} onChange={v => setData({...data, background: {...data.background, pathological: {...data.background.pathological!, others: v}}})} />
                        <Field label="Alergias (Clínicas)" value={data.background.pathological?.allergies} editing={isEditing} onChange={v => setData({...data, background: {...data.background, pathological: {...data.background.pathological!, allergies: v}}})} />
                    </div>
                </div>

                {/* Pathological Checkboxes */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-blue-400 mb-4 uppercase border-b border-slate-800 pb-2">Patologías</h4>
                    <div className="grid grid-cols-2 gap-y-3 gap-x-4">
                         <Checkbox label="Diabetes" checked={data.background.pathological?.diabetes} editing={isEditing} onChange={c => setData({...data, background: {...data.background, pathological: {...data.background.pathological!, diabetes: c}}})} />
                         <Checkbox label="Cáncer" checked={data.background.pathological?.cancer} editing={isEditing} onChange={c => setData({...data, background: {...data.background, pathological: {...data.background.pathological!, cancer: c}}})} />
                         <Checkbox label="Dislipidemia" checked={data.background.pathological?.dislipidemia} editing={isEditing} onChange={c => setData({...data, background: {...data.background, pathological: {...data.background.pathological!, dislipidemia: c}}})} />
                         <Checkbox label="Anemia" checked={data.background.pathological?.anemia} editing={isEditing} onChange={c => setData({...data, background: {...data.background, pathological: {...data.background.pathological!, anemia: c}}})} />
                         <Checkbox label="Hipertensión" checked={data.background.pathological?.hypertension} editing={isEditing} onChange={c => setData({...data, background: {...data.background, pathological: {...data.background.pathological!, hypertension: c}}})} />
                         <Checkbox label="Enf. Renales" checked={data.background.pathological?.renal} editing={isEditing} onChange={c => setData({...data, background: {...data.background, pathological: {...data.background.pathological!, renal: c}}})} />
                    </div>
                </div>
            </div>
            
            <div className="space-y-6">
                 {/* Gyneco */}
                 <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-purple-400 mb-4 uppercase border-b border-slate-800 pb-2">Gineco-obstétricos</h4>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <Field label="G" value={data.gyneco?.g} editing={isEditing} onChange={v => setData({...data, gyneco: {...data.gyneco!, g: v}})} />
                        <Field label="P" value={data.gyneco?.p} editing={isEditing} onChange={v => setData({...data, gyneco: {...data.gyneco!, p: v}})} />
                        <Field label="C" value={data.gyneco?.c} editing={isEditing} onChange={v => setData({...data, gyneco: {...data.gyneco!, c: v}})} />
                        <Field label="A" value={data.gyneco?.a} editing={isEditing} onChange={v => setData({...data, gyneco: {...data.gyneco!, a: v}})} />
                    </div>
                    <div className="space-y-3">
                         <Field label="FUM" value={data.gyneco?.fum} editing={isEditing} type="date" onChange={v => setData({...data, gyneco: {...data.gyneco!, fum: v}})} />
                         <Field label="Anticonceptivos" value={data.gyneco?.contraception} editing={isEditing} onChange={v => setData({...data, gyneco: {...data.gyneco!, contraception: v}})} />
                    </div>
                 </div>

                <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                    <h4 className="text-sm font-bold text-blue-400 mb-4 uppercase border-b border-slate-800 pb-2">Recordatorio 24H (Básico)</h4>
                    <div className="space-y-3">
                        <Field label="Desayuno" value={data.recall24h.breakfast} editing={isEditing} onChange={v => setData({...data, recall24h: {...data.recall24h, breakfast: v}})} />
                        <Field label="Comida" value={data.recall24h.lunch} editing={isEditing} onChange={v => setData({...data, recall24h: {...data.recall24h, lunch: v}})} />
                        <Field label="Cena" value={data.recall24h.dinner} editing={isEditing} onChange={v => setData({...data, recall24h: {...data.recall24h, dinner: v}})} />
                    </div>
                </div>
            </div>
       </div>

       <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 overflow-hidden">
            <h4 className="text-sm font-bold text-blue-400 mb-3 uppercase">Frecuencia de Consumo</h4>
            <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                    <thead>
                        <tr className="text-slate-500 border-b border-slate-800">
                            <th className="text-left py-2">Grupo</th>
                            {frequencies.map(f => <th key={f} className="text-center py-2">{f}</th>)}
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                        {foodGroups.map(group => (
                            <tr key={group}>
                                <td className="py-2 text-slate-300 font-medium">{group}</td>
                                {frequencies.map(freq => (
                                    <td key={freq} className="text-center py-2">
                                        <div 
                                            onClick={() => isEditing && setData({...data, frequencies: {...data.frequencies, [group]: freq}})}
                                            className={`w-4 h-4 rounded-full mx-auto border cursor-pointer ${data.frequencies[group] === freq ? 'bg-green-500 border-green-500' : 'border-slate-600'} ${!isEditing && 'cursor-default'}`}
                                        ></div>
                                    </td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
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