import React, { useState } from 'react';
import { useNutri } from '../context';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Trash2, X, Save, AlertTriangle } from 'lucide-react';
import { Patient } from '../types';

export default function PatientsList() {
  const { patients, deletePatient, addPatient } = useNutri();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');
  
  // Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);

  // New Patient Form State
  const initialFormState = {
    // Personal
    name: '',
    dob: '',
    gender: 'F',
    maritalStatus: '',
    occupation: '',
    address: '',
    phone: '',
    email: '',
    motive: '',
    
    // Pathological
    diabetes: false,
    cancer: false,
    dislipidemia: false,
    anemia: false,
    hypertension: false,
    renal: false,
    others: '',
    allergies: '',

    // Gyneco
    g: '',
    p: '',
    c: '',
    a: '', // Abortos
    fum: '',
    contraception: '',

    // Lifestyle
    sleepHours: '',
    stress: '',
    bowel: '', // Estreñimiento
    alcohol: false,
    tobacco: false,
    exercise: ''
  };

  const [formData, setFormData] = useState(initialFormState);

  const filteredPatients = patients.filter(p => 
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreateChange = (field: string, value: any) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSavePatient = () => {
    const newId = Date.now().toString();
    // Construct the Patient Object based on types.ts
    const newPatient: Patient = {
        id: newId,
        name: formData.name,
        email: formData.email,
        phone: formData.phone,
        dob: formData.dob,
        gender: formData.gender as 'M' | 'F',
        occupation: formData.occupation,
        maritalStatus: formData.maritalStatus,
        address: formData.address,
        avatarUrl: '', // Default empty, user can add later
        notes: [],
        anthropometry: [],
        plans: [],
        adherence: [],
        labs: [],
        
        // Map Lifestyle
        lifestyle: {
            activity: { regular: !!formData.exercise, details: formData.exercise },
            sleep: { hours: formData.sleepHours, stress: formData.stress },
            diet: { meals: '', water: '', alcohol: formData.alcohol, tobacco: formData.tobacco },
            bowelMovement: formData.bowel,
            foodAllergies: [], // Initialize empty array
            foodIntolerances: [], // Initialize empty array
            preferences: { likes: '', dislikes: '', budget: 'Medio', access: '', eatingOut: '' }
        },

        // Map Clinical
        clinical: {
            background: {
                motive: formData.motive,
                medications: '',
                familyHistory: '',
                pathological: {
                    diabetes: formData.diabetes,
                    cancer: formData.cancer,
                    dislipidemia: formData.dislipidemia,
                    anemia: formData.anemia,
                    hypertension: formData.hypertension,
                    renal: formData.renal,
                    others: formData.others,
                    allergies: formData.allergies
                }
            },
            gyneco: {
                g: formData.g,
                p: formData.p,
                c: formData.c,
                a: formData.a,
                fum: formData.fum,
                contraception: formData.contraception
            },
            recall24h: { breakfast: '', snackAM: '', lunch: '', snackPM: '', dinner: '' },
            frequencies: {}
        }
    };

    addPatient(newPatient);
    setShowCreateModal(false);
    setFormData(initialFormState);
    
    // Redirect to the new patient's detail view
    navigate(`/patients/${newId}`);
  };

  const confirmDelete = () => {
    if (patientToDelete) {
        deletePatient(patientToDelete);
        setPatientToDelete(null);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <h2 className="text-2xl font-bold text-white">Pacientes</h2>
        <button 
            onClick={() => setShowCreateModal(true)}
            className="w-full sm:w-auto bg-[var(--primary)] hover:opacity-90 text-white px-4 py-2 rounded-lg flex items-center justify-center gap-2 transition-colors"
        >
          <Plus size={18} /> Nuevo Paciente
        </button>
      </div>

      <div className="bg-[var(--card-bg)] border border-slate-800 rounded-xl overflow-hidden">
        <div className="p-4 border-b border-slate-800">
          <div className="relative w-full sm:max-w-md">
            <Search className="absolute left-3 top-3 text-slate-500" size={18} />
            <input 
              type="text" 
              placeholder="Buscar por nombre o email..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 rounded-lg py-2.5 pl-10 pr-4 text-white focus:outline-none focus:border-[var(--primary)] transition-colors"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left whitespace-nowrap">
            <thead className="bg-slate-800 text-slate-400 text-xs uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-semibold">Paciente</th>
                <th className="px-6 py-4 font-semibold hidden md:table-cell">Email</th>
                <th className="px-6 py-4 font-semibold hidden sm:table-cell">Teléfono</th>
                <th className="px-6 py-4 font-semibold hidden sm:table-cell">Edad</th>
                <th className="px-6 py-4 font-semibold text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800">
              {filteredPatients.map((patient) => (
                <tr key={patient.id} className="hover:bg-slate-800/50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-blue-900/50 text-blue-200 flex items-center justify-center text-sm font-bold overflow-hidden shrink-0">
                        {patient.avatarUrl ? <img src={patient.avatarUrl} alt="" className="w-full h-full object-cover" /> : patient.name.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="font-medium text-white">{patient.name}</span>
                        <span className="text-xs text-slate-500 md:hidden">{patient.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-slate-400 hidden md:table-cell">{patient.email}</td>
                  <td className="px-6 py-4 text-slate-400 hidden sm:table-cell">{patient.phone}</td>
                  <td className="px-6 py-4 text-slate-400 hidden sm:table-cell">
                    {patient.dob ? new Date().getFullYear() - new Date(patient.dob).getFullYear() : '-'} años
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link to={`/patients/${patient.id}`} className="p-2 text-blue-400 hover:bg-blue-400/10 rounded-lg transition-colors">
                        <Eye size={18} />
                      </Link>
                      <button 
                        onClick={() => setPatientToDelete(patient.id)}
                        className="p-2 text-red-400 hover:bg-red-400/10 rounded-lg transition-colors"
                      >
                        <Trash2 size={18} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredPatients.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-slate-500">
                    No se encontraron pacientes.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* CREATE PATIENT MODAL */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-[var(--card-bg)] border border-slate-700 rounded-xl w-full max-w-6xl shadow-2xl flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="bg-[var(--primary)] p-4 flex justify-between items-center shrink-0 rounded-t-xl">
                    <h3 className="text-white font-bold text-lg flex items-center gap-2"><Plus size={20}/> Nuevo Paciente</h3>
                    <button onClick={() => setShowCreateModal(false)} className="text-white/80 hover:text-white transition-colors">
                        <X size={24} />
                    </button>
                </div>

                {/* Body (Scrollable) */}
                <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                        
                        {/* LEFT COLUMN: DATOS PERSONALES */}
                        <div className="lg:col-span-5 space-y-6">
                            <div className="bg-slate-800/40 p-4 md:p-5 rounded-xl border border-slate-700">
                                <h4 className="text-white font-bold mb-4 border-b border-slate-700 pb-2">Datos Personales</h4>
                                <div className="space-y-4">
                                    <Input label="Nombre Completo" value={formData.name} onChange={v => handleCreateChange('name', v)} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Fecha Nac." type="date" value={formData.dob} onChange={v => handleCreateChange('dob', v)} />
                                        <div>
                                            <label className="block text-xs font-bold text-slate-400 mb-1">Sexo</label>
                                            <select 
                                                value={formData.gender} 
                                                onChange={e => handleCreateChange('gender', e.target.value)}
                                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-[var(--primary)] outline-none"
                                            >
                                                <option value="F">Femenino</option>
                                                <option value="M">Masculino</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Estado Civil" value={formData.maritalStatus} onChange={v => handleCreateChange('maritalStatus', v)} />
                                        <Input label="Ocupación" value={formData.occupation} onChange={v => handleCreateChange('occupation', v)} />
                                    </div>
                                    <Input label="Dirección" value={formData.address} onChange={v => handleCreateChange('address', v)} />
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <Input label="Teléfono" value={formData.phone} onChange={v => handleCreateChange('phone', v)} />
                                        <Input label="Email" type="email" value={formData.email} onChange={v => handleCreateChange('email', v)} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 mb-1">Motivo Consulta</label>
                                        <textarea 
                                            value={formData.motive}
                                            onChange={e => handleCreateChange('motive', e.target.value)}
                                            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm h-20 resize-none focus:border-[var(--primary)] outline-none"
                                        />
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* RIGHT COLUMN: CLINICAL & LIFESTYLE */}
                        <div className="lg:col-span-7 space-y-6">
                            {/* Antecedentes Patológicos */}
                            <div className="bg-slate-800/40 p-4 md:p-5 rounded-xl border border-slate-700">
                                <h4 className="text-white font-bold mb-4 border-b border-slate-700 pb-2">Antecedentes Patológicos</h4>
                                <div className="grid grid-cols-2 gap-y-3 gap-x-4 mb-4">
                                    <Checkbox label="Diabetes" checked={formData.diabetes} onChange={c => handleCreateChange('diabetes', c)} />
                                    <Checkbox label="Cáncer" checked={formData.cancer} onChange={c => handleCreateChange('cancer', c)} />
                                    <Checkbox label="Dislipidemia" checked={formData.dislipidemia} onChange={c => handleCreateChange('dislipidemia', c)} />
                                    <Checkbox label="Anemia" checked={formData.anemia} onChange={c => handleCreateChange('anemia', c)} />
                                    <Checkbox label="Hipertensión" checked={formData.hypertension} onChange={c => handleCreateChange('hypertension', c)} />
                                    <Checkbox label="Enf. Renales" checked={formData.renal} onChange={c => handleCreateChange('renal', c)} />
                                </div>
                                <div className="space-y-3">
                                    <Input label="Otros Antecedentes" value={formData.others} onChange={v => handleCreateChange('others', v)} />
                                    <Input label="Alergias" value={formData.allergies} onChange={v => handleCreateChange('allergies', v)} />
                                </div>
                            </div>

                            {/* Gineco-obstétricos */}
                            <div className="bg-slate-800/40 p-4 md:p-5 rounded-xl border border-slate-700">
                                <h4 className="text-white font-bold mb-4 border-b border-slate-700 pb-2">Gineco-obstétricos</h4>
                                <div className="grid grid-cols-2 sm:grid-cols-5 gap-4 mb-4">
                                    <Input label="G" value={formData.g} onChange={v => handleCreateChange('g', v)} />
                                    <Input label="P" value={formData.p} onChange={v => handleCreateChange('p', v)} />
                                    <Input label="C" value={formData.c} onChange={v => handleCreateChange('c', v)} />
                                    <Input label="A" value={formData.a} onChange={v => handleCreateChange('a', v)} />
                                    <Input label="FUM" type="date" value={formData.fum} onChange={v => handleCreateChange('fum', v)} />
                                </div>
                                <Input label="Método Anticonceptivo" value={formData.contraception} onChange={v => handleCreateChange('contraception', v)} />
                            </div>

                            {/* Estilo de Vida */}
                            <div className="bg-slate-800/40 p-4 md:p-5 rounded-xl border border-slate-700">
                                <h4 className="text-white font-bold mb-4 border-b border-slate-700 pb-2">Estilo de Vida</h4>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                                    <Input label="Sueño (hrs)" value={formData.sleepHours} onChange={v => handleCreateChange('sleepHours', v)} />
                                    <Input label="Estrés" value={formData.stress} onChange={v => handleCreateChange('stress', v)} />
                                    <Input label="Estreñimiento" value={formData.bowel} onChange={v => handleCreateChange('bowel', v)} />
                                    <Input label="Ejercicio" value={formData.exercise} onChange={v => handleCreateChange('exercise', v)} />
                                </div>
                                <div className="grid grid-cols-2 gap-4 mt-2">
                                    <Checkbox label="Consumo Alcohol" checked={formData.alcohol} onChange={c => handleCreateChange('alcohol', c)} />
                                    <Checkbox label="Consumo Tabaco" checked={formData.tobacco} onChange={c => handleCreateChange('tobacco', c)} />
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer Buttons */}
                <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-[var(--card-bg)] shrink-0 rounded-b-xl">
                    <button onClick={() => setShowCreateModal(false)} className="px-6 py-2 text-slate-400 hover:text-white font-medium">Cancelar</button>
                    <button onClick={handleSavePatient} className="bg-[var(--primary)] hover:opacity-90 text-white px-8 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                        <Save size={18} /> Guardar
                    </button>
                </div>
            </div>
        </div>
      )}

      {/* DELETE CONFIRMATION MODAL */}
      {patientToDelete && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-[70] p-4">
            <div className="bg-[var(--card-bg)] border border-slate-700 rounded-xl p-8 max-w-sm w-full shadow-2xl text-center animate-in fade-in zoom-in duration-200">
                <div className="w-16 h-16 bg-red-500/10 text-red-500 rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                    <AlertTriangle size={32} />
                </div>
                <h3 className="text-xl font-bold text-white mb-2">¿Eliminar Paciente?</h3>
                <p className="text-slate-400 text-sm mb-8 leading-relaxed">
                    Esta acción eliminará <strong>permanentemente</strong> el perfil del paciente y todos sus registros asociados.
                </p>
                <div className="flex gap-3 justify-center">
                    <button 
                    onClick={() => setPatientToDelete(null)} 
                    className="px-5 py-2.5 text-slate-400 hover:text-white font-medium hover:bg-slate-800 rounded-lg transition-colors"
                    >
                        Cancelar
                    </button>
                    <button 
                    onClick={confirmDelete} 
                    className="bg-red-600 hover:bg-red-700 text-white px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-red-900/20 transition-all active:scale-95"
                    >
                        Sí, Eliminar
                    </button>
                </div>
            </div>
        </div>
      )}

    </div>
  );
}

// Reusable Components for Form
const Input = ({ label, value, onChange, type = "text" }: any) => (
    <div>
        <label className="block text-xs font-bold text-slate-400 mb-1">{label}</label>
        <input 
            type={type} 
            value={value} 
            onChange={e => onChange(e.target.value)}
            className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2 text-white text-sm focus:border-[var(--primary)] outline-none transition-colors"
        />
    </div>
);

const Checkbox = ({ label, checked, onChange }: any) => (
    <label className="flex items-center gap-2 cursor-pointer group">
        <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${checked ? 'bg-[var(--primary)] border-[var(--primary)]' : 'bg-slate-800 border-slate-600 group-hover:border-[var(--primary)]'}`}>
            {checked && <X size={12} className="text-white" />}
        </div>
        <span className={`text-sm ${checked ? 'text-white' : 'text-slate-400 group-hover:text-slate-300'}`}>{label}</span>
        {/* Hidden input for semantics */}
        <input type="checkbox" checked={checked} onChange={e => onChange(e.target.checked)} className="hidden" />
    </label>
);