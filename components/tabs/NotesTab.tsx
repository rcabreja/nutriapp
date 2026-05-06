import React, { useState, useRef } from 'react';
import CalendarFilter from '../CalendarFilter';
import { Patient, Note } from '../../types';
import { Plus, Trash, Edit2, Image as ImageIcon, X, Upload, Calendar, Maximize2, Trash2, Clock } from 'lucide-react';

interface Props {
    patient: Patient;
    updatePatient: (id: string, data: Partial<Patient>) => void;
    readOnly: boolean;
}

export default function NotesTab({ patient, updatePatient, readOnly }: Props) {
    const [showModal, setShowModal] = useState(false);
    const [editingNoteId, setEditingNoteId] = useState<string | null>(null);

    // Viewers State
    const [viewingImage, setViewingImage] = useState<string | null>(null);
    const [deleteId, setDeleteId] = useState<string | null>(null);

    // Form State: Initialize with current datetime sliced to YYYY-MM-DDTHH:mm
    const [date, setDate] = useState(new Date().toISOString().slice(0, 16));
    const [objective, setObjective] = useState('');
    const [observations, setObservations] = useState('');
    const [nextAppointment, setNextAppointment] = useState('');
    const [images, setImages] = useState<string[]>([]); // Array of images
    const [evolution, setEvolution] = useState<any>({}); // New Evolution State
    const fileInputRef = useRef<HTMLInputElement>(null);

    const resetForm = () => {
        // Current time in local timezone offset for input
        const now = new Date();
        now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
        setDate(now.toISOString().slice(0, 16));

        setObjective('');
        setObservations('');
        setNextAppointment('');
        setImages([]);
        setEvolution({});
        setEditingNoteId(null);
    };

    const handleOpenNew = () => {
        resetForm();
        setShowModal(true);
    };

    const handleOpenEdit = (note: Note) => {
        setEditingNoteId(note.id);
        setDate(note.date);
        setObjective(note.objective);
        setObservations(note.observations);
        setNextAppointment(note.nextAppointment || '');
        setEvolution(note.evolution || {});
        const imgs = note.images || ((note as any).imageUrl ? [(note as any).imageUrl] : []);
        setImages(imgs);
        setShowModal(true);
    };

    const handleSave = () => {
        if (editingNoteId) {
            // Update existing note
            const updatedNotes = patient.notes.map(n =>
                n.id === editingNoteId
                    ? { ...n, date, objective, observations, images, nextAppointment, evolution }
                    : n
            );
            updatePatient(patient.id, { notes: updatedNotes });
        } else {
            // Create new note
            const newNote: Note = {
                id: Date.now().toString(),
                date,
                objective,
                observations,
                images,
                nextAppointment,
                evolution
            };
            const updatedNotes = [newNote, ...patient.notes];
            updatePatient(patient.id, { notes: updatedNotes });
        }
        setShowModal(false);
        resetForm();
    };

    const handleDeleteClick = (noteId: string) => {
        setDeleteId(noteId);
    };

    const confirmDelete = () => {
        if (deleteId) {
            const updatedNotes = patient.notes.filter(n => n.id !== deleteId);
            updatePatient(patient.id, { notes: updatedNotes });
            setDeleteId(null);
        }
    };

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files && e.target.files.length > 0) {
            const files = Array.from(e.target.files) as File[];
            const base64Promises = files.map(file => {
                return new Promise<string>((resolve) => {
                    const reader = new FileReader();
                    reader.onloadend = () => resolve(reader.result as string);
                    reader.readAsDataURL(file);
                });
            });
            const newUrls = await Promise.all(base64Promises);
            setImages(prev => [...prev, ...newUrls]);
        }
    };

    const removeImage = (indexToRemove: number) => {
        setImages(prev => prev.filter((_, idx) => idx !== indexToRemove));
    };

    const triggerFileInput = () => {
        fileInputRef.current?.click();
    };

    const [selectedDateFilter, setSelectedDateFilter] = useState<string | null>(null);

    const filteredNotes = selectedDateFilter
        ? patient.notes.filter(n => {
            const noteDate = n.date.split('T')[0];
            const apptDate = n.nextAppointment ? n.nextAppointment.split('T')[0] : null;
            return noteDate === selectedDateFilter || apptDate === selectedDateFilter;
        })
        : patient.notes;

    return (
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Left Column: Calendar */}
            <div className="lg:col-span-1 space-y-6">
                <CalendarFilter
                    notes={patient.notes}
                    selectedDate={selectedDateFilter}
                    onSelectDate={setSelectedDateFilter}
                />
            </div>

            {/* Right Column: Notes List */}
            <div className="lg:col-span-3 space-y-6">
                {!readOnly && (
                    <div className="bg-[#cbd9ce] border border-[#cbd9ce] rounded-xl p-4 flex justify-between items-center">
                        <div>
                            <h3 className="text-[#3c584b] font-bold">Seguimiento por Visitas</h3>
                            <p className="text-[#3c584b] text-sm">Registro clínico de objetivos y observaciones.</p>
                        </div>
                        <button onClick={handleOpenNew} className="bg-[#cbd9ce] hover:bg-[#cbd9ce] text-[#3c584b] px-4 py-2 rounded-lg flex items-center gap-2 transition-colors">
                            <Plus size={18} /> Nueva Nota
                        </button>
                    </div>
                )}

                <div className="space-y-4">
                    {filteredNotes.map(note => {
                        const noteImages = note.images || ((note as any).imageUrl ? [(note as any).imageUrl] : []);

                        return (
                            <div key={note.id} className="bg-[#cbd9ce] border border-[#cbd9ce] rounded-xl p-6 relative group hover:border-[#cbd9ce] transition-all">
                                <div className="flex flex-col md:flex-row gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center justify-between border-b border-[#cbd9ce] pb-2 mb-2">
                                            <div className="flex items-center gap-2 text-[#3c584b]">
                                                <CalendarIcon date={note.date} />
                                            </div>
                                            <span className="text-xs text-[#3c584b] font-mono">ID: {note.id}</span>
                                        </div>

                                        <div className="grid grid-cols-1 gap-4">
                                            <div>
                                                <p className="text-xs uppercase text-[#3c584b] font-bold mb-1">OBJETIVO DE LA VISITA</p>
                                                <p className="text-[#3c584b] font-medium">{note.objective}</p>
                                            </div>
                                            <div>
                                                <p className="text-xs uppercase text-[#3c584b] font-bold mb-1">OBSERVACIONES / ANÁLISIS CLÍNICO</p>
                                                <p className="text-[#3c584b] whitespace-pre-wrap text-sm leading-relaxed">{note.observations}</p>
                                            </div>
                                            <div className="grid grid-cols-1 gap-4 bg-[#fdf7e7] p-4 rounded-lg border border-[#cbd9ce]">
                                                <div className="text-xs uppercase text-[#3c584b] font-bold border-b border-[#cbd9ce] pb-1 mb-1">
                                                    Cuestionario de Evolución
                                                </div>
                                                {note.evolution?.feelingWithPlan && <div><span className="text-[#3c584b] text-xs block">Sentimiento c/ Plan:</span> <span className="text-[#3c584b] text-sm">{note.evolution.feelingWithPlan}</span></div>}
                                                {note.evolution?.adherence && <div><span className="text-[#3c584b] text-xs block">Apego:</span> <span className="text-[#3c584b] text-sm">{note.evolution.adherence}</span></div>}
                                                {note.evolution?.hungerOrAnxiety && <div><span className="text-[#3c584b] text-xs block">Hambre/Ansiedad:</span> <span className="text-[#3c584b] text-sm">{note.evolution.hungerOrAnxiety}</span></div>}
                                                {note.evolution?.inflammation && <div><span className="text-[#3c584b] text-xs block">Inflamación:</span> <span className="text-[#3c584b] text-sm">{note.evolution.inflammation}</span></div>}
                                                {note.evolution?.constipation && <div><span className="text-[#3c584b] text-xs block">Estreñimiento:</span> <span className="text-[#3c584b] text-sm">{note.evolution.constipation}</span></div>}
                                                {note.evolution?.stress && <div><span className="text-[#3c584b] text-xs block">Estrés por cambios:</span> <span className="text-[#3c584b] text-sm">{note.evolution.stress}</span></div>}
                                                {note.evolution?.sleep && <div><span className="text-[#3c584b] text-xs block">Sueño:</span> <span className="text-[#3c584b] text-sm">{note.evolution.sleep}</span></div>}
                                                {note.evolution?.water && <div><span className="text-[#3c584b] text-xs block">Consumo de Agua:</span> <span className="text-[#3c584b] text-sm">{note.evolution.water}</span></div>}
                                                {note.evolution?.eatingOut && <div><span className="text-[#3c584b] text-xs block">Comidas fuera:</span> <span className="text-[#3c584b] text-sm">{note.evolution.eatingOut}</span></div>}
                                                {note.evolution?.exercise && <div><span className="text-[#3c584b] text-xs block">Ejercicio:</span> <span className="text-[#3c584b] text-sm">{note.evolution.exercise}</span></div>}
                                                {note.evolution?.modifications && <div><span className="text-[#3c584b] text-xs block">Modificaciones:</span> <span className="text-[#3c584b] text-sm">{note.evolution.modifications}</span></div>}
                                                {note.evolution?.management && <div className="border-t border-[#cbd9ce] pt-2"><span className="text-[#3c584b] text-xs font-bold block">PLAN / MANEJO:</span> <span className="text-[#3c584b] text-sm">{note.evolution.management}</span></div>}
                                            </div>

                                            {note.nextAppointment && (
                                                <div>
                                                    <p className="text-xs uppercase text-[#3c584b] font-bold mb-1 flex items-center gap-1">
                                                        <Clock size={12} /> PRÓXIMA CITA AGENDADA
                                                    </p>
                                                    <p className="text-[#3c584b] font-medium text-sm">
                                                        {new Date(note.nextAppointment).toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                                    </p>
                                                </div>
                                            )}
                                        </div>

                                        {noteImages.length > 0 && (
                                            <div className="mt-4 pt-4 border-t border-[#cbd9ce]">
                                                <p className="text-xs uppercase text-[#3c584b] font-bold mb-2 flex items-center gap-2">
                                                    <ImageIcon size={14} /> EVIDENCIA FOTOGRÁFICA
                                                </p>
                                                <div className="flex flex-wrap gap-3">
                                                    {noteImages.map((img, idx) => (
                                                        <div
                                                            key={idx}
                                                            className="relative inline-block group/img cursor-pointer rounded-lg overflow-hidden border border-[#cbd9ce] w-32 h-32"
                                                            onClick={() => setViewingImage(img)}
                                                        >
                                                            <img src={img} alt="Evidencia" className="w-full h-full object-cover transition-transform group-hover/img:scale-105" />
                                                            <div className="absolute inset-0 bg-[#fdf7e7] opacity-0 group-hover/img:opacity-100 flex items-center justify-center text-[#3c584b] text-xs font-bold transition-opacity backdrop-blur-sm">
                                                                <Maximize2 size={16} />
                                                            </div>
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {!readOnly && (
                                    <div className="absolute top-4 right-4 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <button
                                            onClick={() => handleOpenEdit(note)}
                                            className="p-2 text-[#3c584b] hover:text-[#3c584b] hover:bg-[#fdf7e7] rounded-lg transition-colors"
                                            title="Editar Nota"
                                        >
                                            <Edit2 size={18} />
                                        </button>
                                        <button
                                            onClick={() => handleDeleteClick(note.id)}
                                            className="p-2 text-[#3c584b] hover:text-[#3c584b] hover:bg-[#fdf7e7] rounded-lg transition-colors"
                                            title="Eliminar Nota"
                                        >
                                            <Trash size={18} />
                                        </button>
                                    </div>
                                )}
                            </div>
                        );
                    })}

                    {filteredNotes.length === 0 && (
                        <div className="text-center py-12 text-[#3c584b] bg-[#fdf7e7] rounded-xl border border-dashed border-[#cbd9ce]">
                            {selectedDateFilter
                                ? "No hay notas ni citas para la fecha seleccionada."
                                : "No hay notas registradas."
                            }
                        </div>
                    )}
                </div>
            </div>

            {/* Existing Modals and Dialogs remain outside the grid to overlay properly */}
            {viewingImage && (
                <div className="fixed inset-0 bg-[#fdf7e7] z-[60] flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setViewingImage(null)}>
                    <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
                        <img src={viewingImage} alt="Evidencia Full" className="max-w-full max-h-[85vh] rounded-lg shadow-2xl border border-[#cbd9ce]" onClick={(e) => e.stopPropagation()} />
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

            {/* Delete Confirmation Modal */}
            {deleteId && (
                <div className="fixed inset-0 bg-[#fdf7e7] backdrop-blur-sm flex items-center justify-center z-[70] p-4">
                    <div className="bg-[#cbd9ce] border border-[#cbd9ce] rounded-xl p-8 max-w-sm w-full shadow-2xl text-center transform transition-all scale-100">
                        <div className="w-16 h-16 bg-[#cbd9ce] text-[#3c584b] rounded-full flex items-center justify-center mx-auto mb-6">
                            <Trash size={32} />
                        </div>
                        <h3 className="text-xl font-bold text-[#3c584b] mb-2">¿Eliminar nota?</h3>
                        <p className="text-[#3c584b] text-sm mb-8 leading-relaxed">
                            Esta acción eliminará permanentemente la nota de evolución y no se puede deshacer.
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

            {/* Edit/Create Modal */}
            {showModal && (
                <div className="fixed inset-0 bg-[#fdf7e7] backdrop-blur-sm flex items-center justify-center z-50 p-4">
                    <div className="bg-[#cbd9ce] border border-[#cbd9ce] rounded-xl w-full max-w-lg shadow-2xl overflow-hidden animate-in fade-in zoom-in duration-200 flex flex-col max-h-[90vh]">
                        {/* Header */}
                        <div className="bg-[#cbd9ce] p-4 flex justify-between items-center shrink-0">
                            <h3 className="text-[#3c584b] font-bold text-lg">{editingNoteId ? 'Editar Nota de Evolución' : 'Nueva Nota de Evolución'}</h3>
                            <button onClick={() => setShowModal(false)} className="text-[#3c584b] hover:text-[#3c584b] transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
                            {/* Date Input */}
                            <div>
                                <label className="block text-xs font-bold text-[#3c584b] uppercase mb-1">FECHA Y HORA VISITA</label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        value={date}
                                        onChange={e => setDate(e.target.value)}
                                        className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded-lg p-3 text-[#3c584b] focus:border-[#cbd9ce] focus:ring-1 focus:ring-[#cbd9ce] outline-none transition-all"
                                    />
                                    <Calendar className="absolute right-3 top-3 text-[#3c584b] pointer-events-none" size={18} />
                                </div>
                            </div>

                            {/* Next Appointment Input */}
                            <div>
                                <label className="block text-xs font-bold text-[#3c584b] uppercase mb-1 flex items-center gap-1">
                                    <Clock size={12} /> FECHA Y HORA PRÓXIMA CITA
                                </label>
                                <div className="relative">
                                    <input
                                        type="datetime-local"
                                        value={nextAppointment}
                                        onChange={e => setNextAppointment(e.target.value)}
                                        className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded-lg p-3 text-[#3c584b] focus:border-[#cbd9ce] focus:ring-1 focus:ring-[#cbd9ce] outline-none transition-all"
                                    />
                                    <Calendar className="absolute right-3 top-3 text-[#3c584b] pointer-events-none" size={18} />
                                </div>
                            </div>

                            {/* Objective Input */}
                            <div>
                                <label className="block text-xs font-bold text-[#3c584b] uppercase mb-1">OBJETIVO DE LA VISITA</label>
                                <input
                                    type="text"
                                    placeholder="Ej. Revisión de apego, Ajuste calórico..."
                                    value={objective}
                                    onChange={e => setObjective(e.target.value)}
                                    className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded-lg p-3 text-[#3c584b] placeholder-slate-500 focus:border-[#cbd9ce] focus:ring-1 focus:ring-[#cbd9ce] outline-none transition-all"
                                />
                            </div>

                            {/* Evolution Questionnaire */}
                            <div className="bg-[#cbd9ce] border border-[#cbd9ce] p-4 rounded-xl space-y-4">
                                <h4 className="text-sm font-bold text-[#3c584b] uppercase border-b border-[#cbd9ce] pb-2">Cuestionario de Evolución</h4>

                                <div className="grid grid-cols-1 gap-4">
                                    <InputQ label="¿Cómo te sentiste con el plan? (Gustos/Disgustos)" value={evolution.feelingWithPlan} onChange={v => setEvolution({ ...evolution, feelingWithPlan: v })} />
                                    <InputQ label="¿Apego al plan?" value={evolution.adherence} onChange={v => setEvolution({ ...evolution, adherence: v })} />

                                    <InputQ label="¿Hambre o Ansiedad?" value={evolution.hungerOrAnxiety} onChange={v => setEvolution({ ...evolution, hungerOrAnxiety: v })} />
                                    <InputQ label="¿Inflamación?" value={evolution.inflammation} onChange={v => setEvolution({ ...evolution, inflammation: v })} />

                                    <InputQ label="¿Estreñimiento?" value={evolution.constipation} onChange={v => setEvolution({ ...evolution, constipation: v })} />
                                    <InputQ label="¿Estrés por cambios?" value={evolution.stress} onChange={v => setEvolution({ ...evolution, stress: v })} />

                                    <InputQ label="¿Calidad de Sueño?" value={evolution.sleep} onChange={v => setEvolution({ ...evolution, sleep: v })} />
                                    <InputQ label="¿Consumo de Agua?" value={evolution.water} onChange={v => setEvolution({ ...evolution, water: v })} />

                                    <InputQ label="¿Comidas fuera?" value={evolution.eatingOut} onChange={v => setEvolution({ ...evolution, eatingOut: v })} />
                                    <InputQ label="¿Ejercicio?" value={evolution.exercise} onChange={v => setEvolution({ ...evolution, exercise: v })} />

                                    <div>
                                        <InputQ label="¿Modificaciones deseadas?" value={evolution.modifications} onChange={v => setEvolution({ ...evolution, modifications: v })} />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-[#3c584b] uppercase mb-1">PLAN / MANEJO</label>
                                        <textarea
                                            value={evolution.management || ''}
                                            onChange={e => setEvolution({ ...evolution, management: e.target.value })}
                                            className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded-lg p-2 text-[#3c584b] text-sm h-20"
                                            placeholder="Plan de acción..."
                                        ></textarea>
                                    </div>
                                </div>
                            </div>

                            {/* Observations Textarea */}
                            <div>
                                <label className="block text-xs font-bold text-[#3c584b] uppercase mb-1">OBSERVACIONES / ANÁLISIS CLÍNICO</label>
                                <textarea
                                    placeholder="Ej. Paciente refiere sentirse con más energía..."
                                    value={observations}
                                    onChange={e => setObservations(e.target.value)}
                                    className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded-lg p-3 text-[#3c584b] placeholder-slate-500 h-32 focus:border-[#cbd9ce] focus:ring-1 focus:ring-[#cbd9ce] outline-none transition-all resize-none"
                                ></textarea>
                            </div>

                            {/* Image Upload Box */}
                            <div>
                                <label className="block text-xs font-bold text-[#3c584b] uppercase mb-1 flex items-center gap-2">
                                    <ImageIcon size={14} /> IMÁGENES DE EVOLUCIÓN
                                </label>
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    multiple
                                    onChange={handleImageUpload}
                                />

                                <div className="space-y-3">
                                    {images.length === 0 ? (
                                        <div
                                            onClick={triggerFileInput}
                                            className="border-2 border-dashed border-[#cbd9ce] rounded-xl p-6 flex flex-col items-center justify-center cursor-pointer hover:bg-[#fdf7e7] hover:border-[#cbd9ce] transition-all group"
                                        >
                                            <div className="w-10 h-10 rounded-full bg-[#fdf7e7] flex items-center justify-center mb-2 group-hover:bg-[#cbd9ce] text-[#3c584b] group-hover:text-[#3c584b] transition-colors">
                                                <Upload size={20} />
                                            </div>
                                            <span className="text-xs font-bold text-[#3c584b] group-hover:text-[#3c584b] uppercase tracking-wider">SUBIR IMÁGENES</span>
                                        </div>
                                    ) : (
                                        <div className="flex gap-2">
                                            <button
                                                onClick={triggerFileInput}
                                                className="w-24 h-24 flex flex-col items-center justify-center border-2 border-dashed border-[#cbd9ce] rounded-lg hover:border-[#cbd9ce] hover:bg-[#fdf7e7] transition-colors text-[#3c584b] hover:text-[#3c584b]"
                                            >
                                                <Plus size={20} />
                                                <span className="text-[#3c584b] font-bold mt-1">AGREGAR</span>
                                            </button>

                                            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-thin">
                                                {images.map((img, idx) => (
                                                    <div key={idx} className="w-24 h-24 relative group flex-shrink-0">
                                                        <img src={img} alt="Preview" className="w-full h-full object-cover rounded-lg border border-[#cbd9ce]" />
                                                        <button
                                                            onClick={() => removeImage(idx)}
                                                            className="absolute -top-2 -right-2 bg-[#cbd9ce] text-[#3c584b] rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg"
                                                        >
                                                            <X size={12} />
                                                        </button>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>

                            {/* Footer Button */}
                            <div className="pt-2">
                                <button onClick={handleSave} className="w-full bg-[#cbd9ce] hover:bg-[#cbd9ce] text-[#3c584b] font-bold py-3.5 rounded-lg transition-colors shadow-lg shadow-md">
                                    {editingNoteId ? 'Guardar Cambios' : 'Guardar Nota'}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const CalendarIcon = ({ date }: { date: string }) => {
    // Check if it has time
    const hasTime = date.includes('T');
    const d = new Date(date);

    return (
        <div className="flex items-center gap-2 font-semibold">
            <Calendar size={18} className="text-[#3c584b]" />
            <span className="capitalize">
                {d.toLocaleDateString('es-ES', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
                {hasTime && <span className="normal-case text-[#3c584b] ml-1"> {d.toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}</span>}
            </span>
        </div>
    )
}

const InputQ = ({ label, value, onChange }: any) => (
    <div>
        <label className="block text-[#3c584b] font-bold text-[#3c584b] uppercase mb-1">{label}</label>
        <input
            type="text"
            value={value || ''}
            onChange={e => onChange(e.target.value)}
            className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded p-2 text-[#3c584b] text-sm focus:border-[#cbd9ce] outline-none"
        />
    </div>
);