import React, { useState, useRef } from 'react';
import { Patient, LabResult } from '../../types';
import { Plus, Edit2, Trash2, Calendar, X, Upload, Image as ImageIcon, Eye, AlertTriangle } from 'lucide-react';

interface Props {
    patient: Patient;
    updatePatient: (id: string, data: Partial<Patient>) => void;
    readOnly: boolean;
}

export default function LabsTab({ patient, updatePatient, readOnly }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Image Viewer State
    const [viewingImage, setViewingImage] = useState<string | null>(null);

    // Form State
    const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
    const [name, setName] = useState('');

    // Specific Markers
    const [glucose, setGlucose] = useState('');
    const [cholesterol, setCholesterol] = useState('');
    const [triglycerides, setTriglycerides] = useState('');
    const [hemoglobin, setHemoglobin] = useState('');
    const [hematocrit, setHematocrit] = useState('');

    const [attachments, setAttachments] = useState<string[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        setEditingId(null);
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setDate(now.toISOString().slice(0, 16));

        setName('');
        setGlucose('');
        setCholesterol('');
        setTriglycerides('');
        setHemoglobin('');
        setHematocrit('');
        setAttachments([]);
    };

    const handleOpenEdit = (lab: LabResult) => {
        setEditingId(lab.id);
        setDate(lab.date);
        setName(lab.name);
        setAttachments(lab.attachments || []);

        // Map markers to state
        const getVal = (n: string) => lab.markers.find(m => m.name === n)?.value || '';
        setGlucose(getVal('Glucosa'));
        setCholesterol(getVal('Colesterol'));
        setTriglycerides(getVal('Triglicéridos'));
        setHemoglobin(getVal('Hemoglobina'));
        setHematocrit(getVal('Hematocrito'));

        setShowModal(true);
    };

    const confirmDelete = () => {
        if (deleteId) {
            const updatedLabs = patient.labs.filter(l => l.id !== deleteId);
            updatePatient(patient.id, { labs: updatedLabs });
            setDeleteId(null);
        }
    };

    const handleSave = () => {
        const markers = [
            { name: 'Glucosa', value: glucose, unit: 'mg/dL' },
            { name: 'Colesterol', value: cholesterol, unit: 'mg/dL' },
            { name: 'Triglicéridos', value: triglycerides, unit: 'mg/dL' },
            { name: 'Hemoglobina', value: hemoglobin, unit: 'g/dL' },
            { name: 'Hematocrito', value: hematocrit, unit: '%' },
        ].filter(m => m.value !== ''); // Remove empty

        if (editingId) {
            // Edit
            const updatedLabs = patient.labs.map(l => l.id === editingId ? {
                ...l, name, date, markers, attachments
            } : l);
            updatePatient(patient.id, { labs: updatedLabs });
        } else {
            // Create
            const newLab: LabResult = {
                id: Date.now().toString(),
                name: name || 'Nuevo Análisis',
                date,
                markers,
                attachments
            };
            updatePatient(patient.id, { labs: [newLab, ...patient.labs] });
        }
        setShowModal(false);
        resetForm();
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                setAttachments([...attachments, reader.result as string]);
            };
            reader.readAsDataURL(file);
        }
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-[#3c584b]">Analíticas y Laboratorios</h3>
                {!readOnly && (
                    <button
                        onClick={() => { resetForm(); setShowModal(true); }}
                        className="bg-[#cbd9ce] hover:bg-[#cbd9ce] text-[#3c584b] px-4 py-2 rounded-lg flex items-center gap-2"
                    >
                        <Plus size={16} /> Nuevo Análisis
                    </button>
                )}
            </div>

            <div className="flex flex-col gap-6">
                {patient.labs.map(lab => (
                    <div key={lab.id} className="bg-[#cbd9ce] border border-[#cbd9ce] rounded-xl p-6 hover:border-[#cbd9ce] transition-all">
                        {/* Header */}
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h4 className="font-bold text-[#3c584b] text-xl capitalize">{lab.name}</h4>
                                <div className="flex items-center gap-2 text-[#3c584b] mt-1 text-sm">
                                    <Calendar size={14} />
                                    {new Date(lab.date).toLocaleDateString('es-ES', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </div>
                            </div>
                            {!readOnly && (
                                <div className="flex gap-2">
                                    <button onClick={() => handleOpenEdit(lab)} className="p-2 text-[#3c584b] hover:text-[#3c584b] hover:bg-[#fdf7e7] rounded-lg transition-colors">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => setDeleteId(lab.id)} className="p-2 text-[#3c584b] hover:text-[#3c584b] hover:bg-[#fdf7e7] rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Grid of Values */}
                        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-6">
                            <MarkerCard name="Glucosa" lab={lab} />
                            <MarkerCard name="Colesterol" lab={lab} />
                            <MarkerCard name="Triglicéridos" lab={lab} />
                            <MarkerCard name="Hemoglobina" lab={lab} />
                            <MarkerCard name="Hematocrito" lab={lab} />
                        </div>

                        {/* Attachments */}
                        {(lab.attachments && lab.attachments.length > 0) && (
                            <div className="border-t border-[#cbd9ce] pt-4">
                                <p className="text-xs font-bold text-[#3c584b] uppercase mb-3 flex items-center gap-2">
                                    <ImageIcon size={14} /> Archivos del Análisis
                                </p>
                                <div className="flex gap-3 overflow-x-auto pb-2">
                                    {lab.attachments.map((url, idx) => (
                                        <div key={idx} className="relative group flex-shrink-0 cursor-pointer" onClick={() => setViewingImage(url)}>
                                            <img src={url} alt={`Adjunto ${idx}`} className="w-20 h-20 object-cover rounded-lg border border-[#cbd9ce] transition-transform group-hover:scale-105" />
                                            <div className="absolute inset-0 bg-[#fdf7e7] opacity-0 group-hover:opacity-100 flex items-center justify-center text-[#3c584b] text-xs rounded-lg transition-opacity backdrop-blur-[1px]">
                                                <Eye size={16} />
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
                    </div>
                ))}
                {patient.labs.length === 0 && (
                    <div className="text-center py-12 text-[#3c584b] bg-[#fdf7e7] rounded-xl border border-dashed border-[#cbd9ce]">
                        No hay analíticas registradas.
                    </div>
                )}
            </div>

            {/* DELETE CONFIRMATION MODAL */}
            {deleteId && (
                <div className="fixed inset-0 bg-[#fdf7e7] backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-[#cbd9ce] border border-[#cbd9ce] rounded-xl p-8 max-w-sm w-full shadow-2xl text-center animate-in fade-in zoom-in duration-200">
                        <div className="w-16 h-16 bg-[#cbd9ce] text-[#3c584b] rounded-full flex items-center justify-center mx-auto mb-6 border border-red-500/20">
                            <AlertTriangle size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-[#3c584b] mb-2">¿Eliminar Análisis?</h3>
                        <p className="text-[#3c584b] text-sm mb-8 leading-relaxed">
                            Esta acción eliminará permanentemente este reporte de laboratorio de la ficha del paciente.
                        </p>
                        <div className="flex gap-3 justify-center">
                            <button
                                onClick={() => setDeleteId(null)}
                                className="px-5 py-2.5 text-[#3c584b] hover:text-[#3c584b] font-medium hover:bg-[#fdf7e7] rounded-lg transition-colors"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="bg-[#cbd9ce] hover:bg-[#cbd9ce] text-[#3c584b] px-6 py-2.5 rounded-lg font-bold shadow-lg shadow-md transition-all active:scale-95"
                            >
                                Sí, Eliminar
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Image Viewer Modal */}
            {viewingImage && (
                <div className="fixed inset-0 bg-[#fdf7e7] z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewingImage(null)}>
                    <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
                        <img src={viewingImage} alt="Analisis Full" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border border-[#cbd9ce]" onClick={(e) => e.stopPropagation()} />
                        <button
                            onClick={() => setViewingImage(null)}
                            className="absolute -top-12 right-0 text-[#3c584b] hover:text-[#3c584b] p-2 rounded-full hover:bg-[#fdf7e7] transition-colors"
                        >
                            <X size={32} />
                        </button>
                        <p className="text-[#3c584b] text-sm mt-4">Clic fuera para cerrar</p>
                    </div>
                </div>
            )}

            {/* Edit/Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-[#fdf7e7] backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#cbd9ce] border border-[#cbd9ce] rounded-xl w-full max-w-2xl shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200">
                        <div className="bg-[#cbd9ce] p-4 flex justify-between items-center">
                            <h3 className="text-[#3c584b] font-bold text-lg">{editingId ? 'Editar Análisis' : 'Nuevo Análisis'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-[#3c584b] hover:text-[#3c584b] transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputGroup label="FECHA Y HORA">
                                    <div className="relative">
                                        <input
                                            type="datetime-local"
                                            value={date}
                                            onChange={e => setDate(e.target.value)}
                                            className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded-lg p-2.5 text-[#3c584b] outline-none focus:border-[#cbd9ce]"
                                        />
                                        <Calendar className="absolute right-3 top-3 text-[#3c584b] pointer-events-none" size={16} />
                                    </div>
                                </InputGroup>
                                <InputGroup label="PERFIL">
                                    <input
                                        type="text"
                                        placeholder="Ej. Perfil Bioquímico"
                                        value={name}
                                        onChange={e => setName(e.target.value)}
                                        className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded-lg p-2.5 text-[#3c584b] outline-none focus:border-[#cbd9ce] placeholder-slate-500"
                                    />
                                </InputGroup>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                                <InputMetric label="GLUCOSA (MG/DL)" value={glucose} onChange={setGlucose} />
                                <InputMetric label="COLESTEROL (MG/DL)" value={cholesterol} onChange={setCholesterol} />
                                <InputMetric label="TRIGLICÉRIDOS" value={triglycerides} onChange={setTriglycerides} />
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <InputMetric label="HEMOGLOBINA" value={hemoglobin} onChange={setHemoglobin} />
                                <InputMetric label="HEMATOCRITO" value={hematocrit} onChange={setHematocrit} />
                            </div>

                            {/* File Upload */}
                            <div>
                                <label className="block text-xs font-bold text-[#3c584b] uppercase mb-2 flex items-center gap-2">
                                    <ImageIcon size={14} /> ARCHIVOS
                                </label>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileUpload} />

                                <div className="flex gap-4">
                                    <div
                                        onClick={() => fileInputRef.current?.click()}
                                        className="w-24 h-24 border-2 border-dashed border-[#cbd9ce] rounded-lg flex items-center justify-center cursor-pointer hover:border-[#cbd9ce] hover:bg-[#fdf7e7] transition-colors text-[#3c584b] hover:text-[#3c584b]"
                                    >
                                        <Upload size={24} />
                                    </div>
                                    {attachments.map((url, i) => (
                                        <div key={i} className="w-24 h-24 relative group">
                                            <img src={url} alt="" className="w-full h-full object-cover rounded-lg border border-[#cbd9ce]" />
                                            <button
                                                onClick={() => setAttachments(attachments.filter((_, idx) => idx !== i))}
                                                className="absolute top-1 right-1 bg-[#cbd9ce] text-[#3c584b] rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                                            >
                                                <X size={12} />
                                            </button>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="pt-2">
                                <button onClick={handleSave} className="w-full bg-[#cbd9ce] hover:bg-[#cbd9ce] text-[#3c584b] font-bold py-3 rounded-lg transition-colors shadow-lg shadow-md">
                                    {editingId ? 'Guardar Cambios' : 'Guardar Análisis'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const MarkerCard = ({ name, lab }: { name: string, lab: LabResult }) => {
    const marker = lab.markers.find(m => m.name === name);
    const value = marker?.value || '-';
    const unit = marker?.unit || (name === 'Hematocrito' ? '%' : (name === 'Hemoglobina' ? 'g/dL' : 'mg/dL')); // Fallback units

    return (
        <div className="bg-[#fdf7e7] rounded-lg p-4 border border-[#cbd9ce]">
            <p className="text-xs font-bold text-[#3c584b] uppercase mb-1">{name}</p>
            <div className="flex items-baseline gap-1">
                <span className="text-2xl font-bold text-[#3c584b]">{value}</span>
                <span className="text-xs text-[#3c584b]">{value !== '-' ? unit : ''}</span>
            </div>
        </div>
    )
}

const InputGroup = ({ label, children }: { label: string, children?: React.ReactNode }) => (
    <div>
        <label className="block text-xs font-bold text-[#3c584b] uppercase mb-1.5">{label}</label>
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
            className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded-lg p-2.5 text-[#3c584b] outline-none focus:border-[#cbd9ce]"
        />
    </InputGroup>
)