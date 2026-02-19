import React, { useState } from 'react';
import { useNutri } from '../context';
import { Link, useNavigate } from 'react-router-dom';
import { Search, Plus, Eye, Trash2, AlertTriangle } from 'lucide-react';
import { Patient } from '../types';
import CreatePatientWizard from './wizard/CreatePatientWizard';

export default function PatientsList() {
  const { patients, deletePatient } = useNutri();
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState('');

  // Modals State
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [patientToDelete, setPatientToDelete] = useState<string | null>(null);

  const filteredPatients = patients.filter(p =>
    p.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    p.email.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

      {/* CREATE PATIENT WIZARD */}
      {showCreateModal && (
        <CreatePatientWizard onClose={() => setShowCreateModal(false)} />
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
