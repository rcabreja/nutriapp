import React, { useState } from 'react';
import { Patient, Plan, MealSection, Meal } from '../../types';
import { jsPDF } from 'jspdf';
import { FileDown, CheckCircle, Flame, Edit2, Plus, Trash2, X, Save, TrendingUp, ChevronLeft, ChevronRight } from 'lucide-react';
import { Bar, Line } from 'react-chartjs-2';

interface Props {
  patient: Patient;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  readOnly: boolean;
}

export default function PlansTab({ patient, updatePatient, readOnly }: Props) {
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);
  const [viewDate, setViewDate] = useState(new Date()); // State to track visible month
  const [showEditModal, setShowEditModal] = useState(false);
  
  // Get active plan or default empty
  const activePlan = patient.plans.find(p => p.active) || {
      id: 'new',
      name: 'Nuevo Plan Nutricional',
      kcalTarget: 2000,
      active: true,
      sections: [
          { title: 'Desayuno', options: [{ id: '1', name: 'Opción 1', description: '' }] },
          { title: 'Almuerzo', options: [{ id: '2', name: 'Opción 1', description: '' }] },
          { title: 'Cena', options: [{ id: '3', name: 'Opción 1', description: '' }] }
      ],
      supplements: '',
      avoid: '',
      createdAt: new Date().toISOString()
  } as Plan;

  // Edit State
  const [editedPlan, setEditedPlan] = useState<Plan>(activePlan);

  // --- ADHERENCE LOGIC ---
  const getAdherenceData = (date: string) => {
      return patient.adherence.find(a => a.date === date) || {
          date,
          completed: 0,
          total: 4,
          checks: { breakfast: false, lunch: false, dinner: false, supplements: false }
      };
  };

  const currentAdherence = getAdherenceData(selectedDate);
  const currentChecks = currentAdherence.checks || { breakfast: false, lunch: false, dinner: false, supplements: false };

  const handleCheck = (category: 'breakfast' | 'lunch' | 'dinner' | 'supplements') => {
      // Create new check state
      const newChecks = { ...currentChecks, [category]: !currentChecks[category] };
      
      // Calculate score
      let score = 0;
      if (newChecks.breakfast) score++;
      if (newChecks.lunch) score++;
      if (newChecks.dinner) score++;
      if (newChecks.supplements) score++;

      // Update Array
      const newAdherenceEntry = {
          date: selectedDate,
          completed: score,
          total: 4,
          checks: newChecks
      };

      const otherEntries = patient.adherence.filter(a => a.date !== selectedDate);
      updatePatient(patient.id, { adherence: [...otherEntries, newAdherenceEntry] });
  };

  // --- MAP PLAN TITLES TO KEYS ---
  const mapTitleToKey = (title: string): 'breakfast' | 'lunch' | 'dinner' | null => {
      const t = title.toLowerCase();
      if(t.includes('desayuno')) return 'breakfast';
      if(t.includes('almuerzo') || t.includes('comida')) return 'lunch';
      if(t.includes('cena')) return 'dinner';
      return null;
  };

  // --- CHARTS DATA ---
  // Get last 7 days or current month
  const chartDays = Array.from({length: 10}, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (9 - i));
      return d.toISOString().split('T')[0];
  });

  const adherenceChartData = {
      labels: chartDays.map(d => d.slice(5)), // MM-DD
      datasets: [
          {
              label: 'Cumplimiento Diario (%)',
              data: chartDays.map(date => {
                  const entry = patient.adherence.find(a => a.date === date);
                  return entry ? (entry.completed / 4) * 100 : 0;
              }),
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(59, 130, 246, 0.5)',
              tension: 0.4,
              fill: true
          }
      ]
  };

  const adherenceChartOptions = {
    responsive: true,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      y: { min: 0, max: 100, grid: { color: '#1e293b' } },
      x: { grid: { display: false } }
    }
  };

  // --- PDF GENERATION ---
  const generatePDF = () => {
    if (!activePlan) return;
    const doc = new jsPDF();
    
    doc.setFontSize(20);
    doc.setTextColor(0, 0, 0);
    doc.text(`Plan Nutricional: ${activePlan.name}`, 20, 20);
    
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(`Paciente: ${patient.name} | Kcal: ${activePlan.kcalTarget}`, 20, 28);
    
    let y = 40;
    activePlan.sections.forEach(sec => {
        doc.setFillColor(240, 248, 255); 
        doc.rect(20, y-6, 170, 10, 'F');
        doc.setFontSize(12);
        doc.setTextColor(0, 80, 150);
        doc.setFont('helvetica', 'bold');
        doc.text(sec.title.toUpperCase(), 25, y+1);
        y += 12;
        
        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);
        doc.setFont('helvetica', 'normal');
        
        sec.options.forEach(opt => {
            doc.setFont('helvetica', 'bold');
            doc.text(`${opt.name}:`, 25, y);
            doc.setFont('helvetica', 'normal');
            const splitDesc = doc.splitTextToSize(opt.description, 130);
            doc.text(splitDesc, 50, y);
            y += (splitDesc.length * 5) + 4;
        });
        y += 5;
    });

    y += 5;
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, y, 170, 25);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(0, 0, 150);
    doc.text('SUPLEMENTOS', 25, y+6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(doc.splitTextToSize(activePlan.supplements, 160), 25, y+12);

    y += 30;
    doc.setDrawColor(255, 200, 200);
    doc.setFillColor(255, 240, 240);
    doc.rect(20, y, 170, 25, 'FD');
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(150, 0, 0);
    doc.text('EVITAR', 25, y+6);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(50, 50, 50);
    doc.text(doc.splitTextToSize(activePlan.avoid, 160), 25, y+12);

    doc.save(`Plan_${patient.name.replace(/\s+/g, '_')}.pdf`);
  };

  const handleSavePlan = () => {
      let newPlans = [...patient.plans];
      const existingIndex = newPlans.findIndex(p => p.id === editedPlan.id);
      
      if(existingIndex >= 0) {
          newPlans[existingIndex] = editedPlan;
      } else {
          const finalPlan = { ...editedPlan, id: Date.now().toString() };
          newPlans = [finalPlan, ...newPlans.map(p => ({...p, active: false}))];
      }
      
      updatePatient(patient.id, { plans: newPlans });
      setShowEditModal(false);
  };

  // --- CALENDAR LOGIC ---
  const changeMonth = (offset: number) => {
    const newDate = new Date(viewDate.getFullYear(), viewDate.getMonth() + offset, 1);
    setViewDate(newDate);
  };

  const currentYear = viewDate.getFullYear();
  const currentMonth = viewDate.getMonth();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay(); // 0 = Sunday

  const calendarCells = [];
  
  // Padding for previous month
  for (let i = 0; i < firstDayOfMonth; i++) {
      calendarCells.push(<div key={`empty-${i}`} className="w-9 h-9"></div>);
  }

  // Days
  for (let d = 1; d <= daysInMonth; d++) {
      const dateStr = `${currentYear}-${String(currentMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const entry = patient.adherence.find(a => a.date === dateStr);
      const score = entry ? entry.completed : 0;
      
      let bg = 'bg-transparent text-slate-400 hover:bg-slate-800';
      if (score >= 4) bg = 'bg-[#0070b8] text-white shadow-lg shadow-blue-500/30'; // Excelent
      else if (score >= 2) bg = 'bg-[#4ade80] text-slate-900'; // Med
      else if (score > 0) bg = 'bg-[#bbf7d0] text-slate-900'; // Low
      
      const isSelected = selectedDate === dateStr;
      
      calendarCells.push(
          <button 
              key={dateStr}
              onClick={() => setSelectedDate(dateStr)}
              className={`w-9 h-9 mx-auto rounded-lg flex items-center justify-center text-sm transition-all font-medium ${bg} ${isSelected ? 'ring-2 ring-white ring-offset-2 ring-offset-slate-900 z-10' : ''}`}
          >
              {d}
          </button>
      );
  }

  return (
    <div className="space-y-8">
       {/* SECTION 1: ADHERENCE (Blue Card) */}
       <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h3 className="flex items-center gap-2 font-bold text-white mb-6 text-lg">
                <CheckCircle className="text-blue-500" size={24} /> Seguimiento y Adherencia
            </h3>
            
            <div className="flex flex-col xl:flex-row gap-8">
                {/* Left: Progress Card */}
                <div className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-6 text-slate-800 shadow-sm">
                    <h4 className="text-xs font-bold text-slate-500 uppercase mb-4 tracking-wider">PROGRESO DEL DÍA SELECCIONADO</h4>
                    
                    <div className="flex justify-between items-end mb-2">
                         <div className="text-xl font-bold capitalize text-slate-900">
                             {new Date(selectedDate + 'T12:00:00').toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                         </div>
                         <div className="text-3xl font-bold text-blue-600">{currentAdherence.completed}/4</div>
                    </div>
                    
                    <div className="w-full h-4 bg-slate-200 rounded-full overflow-hidden mb-3">
                         <div 
                             className="h-full bg-blue-500 transition-all duration-500 ease-out" 
                             style={{ width: `${(currentAdherence.completed / 4) * 100}%` }}
                         ></div>
                    </div>
                    
                    <p className="text-xs text-center text-slate-500 italic mb-6">Marca las casillas en el plan inferior para registrar tu progreso.</p>

                    {/* Chart within Adherence Card */}
                    <div className="mt-6 pt-6 border-t border-slate-200">
                        <h5 className="flex items-center gap-2 text-xs font-bold text-slate-500 uppercase mb-4">
                            <TrendingUp size={14} /> Tendencia (Últimos 10 días)
                        </h5>
                        <div className="h-32 w-full">
                            <Line data={adherenceChartData} options={adherenceChartOptions} />
                        </div>
                    </div>
                </div>

                {/* Right: Calendar & Legend */}
                <div className="flex-1 flex flex-col justify-between">
                    <div>
                        <div className="flex justify-between items-center mb-6 px-2 bg-slate-800 rounded-lg p-2">
                            <button onClick={() => changeMonth(-1)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                                <ChevronLeft size={20} />
                            </button>
                            <span className="font-bold text-white text-lg capitalize">
                                {viewDate.toLocaleDateString('es-ES', { month: 'long', year: 'numeric' })}
                            </span>
                            <button onClick={() => changeMonth(1)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white transition-colors">
                                <ChevronRight size={20} />
                            </button>
                        </div>
                        <div className="grid grid-cols-7 gap-y-4 gap-x-2 text-center mb-6">
                            {['D','L','M','M','J','V','S'].map(d => <div key={d} className="text-xs text-slate-500 font-bold">{d}</div>)}
                            {calendarCells}
                        </div>
                    </div>
                    
                    {/* Legend */}
                    <div className="border-t border-slate-800 pt-4">
                        <p className="text-xs font-bold text-slate-500 uppercase mb-3">LEYENDA DE CUMPLIMIENTO</p>
                        <div className="space-y-2">
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-[#bbf7d0]"></div>
                                <span className="text-xs text-slate-400">Cumplimiento Parcial (Bajo)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-[#4ade80]"></div>
                                <span className="text-xs text-slate-400">Cumplimiento Parcial (Medio)</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded bg-[#0070b8]"></div>
                                <span className="text-xs text-slate-400">Cumplimiento Total (Excelente)</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
       </div>

       {/* SECTION 2: PLAN DETAIL (White/Gray card style in Dark Mode) */}
       <div className="bg-slate-50 rounded-xl overflow-hidden border border-slate-200 shadow-xl">
           {/* Header */}
           <div className="bg-white p-6 border-b border-slate-200 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
               <div>
                   <h2 className="text-2xl font-bold text-slate-800 flex items-center gap-3">
                       {activePlan.name}
                       {!readOnly && (
                           <button onClick={() => { setEditedPlan(JSON.parse(JSON.stringify(activePlan))); setShowEditModal(true); }} className="text-slate-400 hover:text-blue-600 transition-colors">
                               <Edit2 size={18} />
                           </button>
                       )}
                   </h2>
                   <div className="mt-2 inline-flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide">
                        <Flame size={12} fill="currentColor" /> {activePlan.kcalTarget} kcal
                   </div>
               </div>
               
               <div className="flex gap-3">
                   {!readOnly && (
                       <button 
                        onClick={() => { setEditedPlan(JSON.parse(JSON.stringify(activePlan))); setShowEditModal(true); }}
                        className="px-4 py-2 rounded-lg border border-slate-300 text-slate-600 font-medium hover:bg-slate-50 flex items-center gap-2 transition-colors text-sm"
                       >
                           <Edit2 size={16} /> Editar
                       </button>
                   )}
                   <button 
                    onClick={generatePDF}
                    className="px-4 py-2 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 flex items-center gap-2 transition-colors text-sm shadow-lg shadow-slate-900/20"
                   >
                       <FileDown size={16} /> PDF
                   </button>
               </div>
           </div>

           {/* Plan Content */}
           <div className="p-8 space-y-8 bg-[#fafafa]">
               {activePlan.sections.map((sec, idx) => {
                   const key = mapTitleToKey(sec.title);
                   const isChecked = key ? currentChecks[key] : false;

                   return (
                   <div key={idx} className="relative">
                       <h4 className="flex items-center gap-2 text-sm font-bold text-slate-500 uppercase tracking-widest mb-4">
                           <div className={`w-3 h-3 rounded-full border-2 ${isChecked ? 'bg-green-500 border-green-500' : 'border-slate-400'}`}></div> 
                           {sec.title}
                           {isChecked && <span className="text-green-600 text-xs ml-2 bg-green-100 px-2 py-0.5 rounded">Completado</span>}
                       </h4>
                       <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                           {sec.options.map((opt, optIdx) => (
                               <div key={opt.id} className={`bg-white border rounded-lg p-5 shadow-sm hover:shadow-md transition-all relative ${isChecked ? 'border-green-200 ring-1 ring-green-100' : 'border-slate-200'}`}>
                                   <div className="flex justify-between items-start mb-2">
                                       <div className="text-xs font-bold text-[#0070b8] uppercase">Opción {optIdx + 1}:</div>
                                       
                                       {/* CHECKBOX FOR MEAL */}
                                       {key && (
                                           <div 
                                               onClick={() => handleCheck(key)}
                                               className={`cursor-pointer w-6 h-6 rounded border flex items-center justify-center transition-colors ${isChecked ? 'bg-green-500 border-green-500 text-white' : 'bg-slate-100 border-slate-300 text-transparent hover:border-blue-400'}`}
                                           >
                                               <CheckCircle size={14} />
                                           </div>
                                       )}
                                   </div>
                                   <p className="text-slate-700 font-medium leading-relaxed">{opt.description}</p>
                               </div>
                           ))}
                       </div>
                   </div>
               )})}

               {/* Footer Boxes */}
               <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                    <div className={`bg-blue-50 border rounded-xl p-5 relative transition-all ${currentChecks.supplements ? 'border-green-300 ring-1 ring-green-200' : 'border-blue-100'}`}>
                         <div className="flex justify-between items-start mb-2">
                             <h5 className="font-bold text-blue-800 text-xs uppercase flex items-center gap-2">
                                 💊 Suplementos
                             </h5>
                             <div 
                                onClick={() => handleCheck('supplements')}
                                className={`cursor-pointer w-6 h-6 rounded border flex items-center justify-center transition-colors ${currentChecks.supplements ? 'bg-green-500 border-green-500 text-white' : 'bg-white border-blue-200 text-transparent hover:border-blue-400'}`}
                             >
                                <CheckCircle size={14} />
                             </div>
                         </div>
                         <p className="text-sm text-blue-900/80 leading-relaxed">{activePlan.supplements || 'Sin suplementación.'}</p>
                    </div>
                    
                    <div className="bg-red-50 border border-red-100 rounded-xl p-5">
                         <h5 className="font-bold text-red-800 text-xs uppercase mb-2 flex items-center gap-2">
                             🚫 Evitar
                         </h5>
                         <p className="text-sm text-red-900/80 leading-relaxed">{activePlan.avoid || 'Ninguno.'}</p>
                    </div>
               </div>
           </div>
       </div>

       {/* EDIT MODAL */}
       {showEditModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-slate-900 border border-slate-700 rounded-xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl">
                {/* Header */}
                <div className="bg-[#0070b8] p-4 flex justify-between items-center shrink-0 rounded-t-xl">
                    <h3 className="text-white font-bold text-lg">Editar Plan Nutricional</h3>
                    <button onClick={() => setShowEditModal(false)} className="text-white/80 hover:text-white"><X size={24} /></button>
                </div>
                
                {/* Scrollable Body */}
                <div className="p-6 overflow-y-auto custom-scrollbar flex-1 space-y-8">
                    {/* Basic Info */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nombre del Plan</label>
                            <input 
                                type="text" 
                                value={editedPlan.name} 
                                onChange={e => setEditedPlan({...editedPlan, name: e.target.value})} 
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Kcal Objetivo</label>
                            <input 
                                type="number" 
                                value={editedPlan.kcalTarget} 
                                onChange={e => setEditedPlan({...editedPlan, kcalTarget: Number(e.target.value)})} 
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-2.5 text-white"
                            />
                        </div>
                    </div>

                    {/* Meal Sections */}
                    <div className="space-y-6">
                        <div className="flex justify-between items-center border-b border-slate-800 pb-2">
                            <h4 className="text-sm font-bold text-blue-400 uppercase">Comidas y Opciones</h4>
                            <button 
                                onClick={() => setEditedPlan({
                                    ...editedPlan, 
                                    sections: [...editedPlan.sections, { title: 'Nueva Comida', options: [] }]
                                })}
                                className="text-xs bg-slate-800 hover:bg-slate-700 text-white px-3 py-1.5 rounded flex items-center gap-1"
                            >
                                <Plus size={14} /> Agregar Tiempo de Comida
                            </button>
                        </div>
                        
                        {editedPlan.sections.map((section, sIdx) => (
                            <div key={sIdx} className="bg-slate-800/50 border border-slate-700 rounded-xl p-4">
                                <div className="flex justify-between items-center mb-3">
                                    <input 
                                        type="text" 
                                        value={section.title}
                                        onChange={e => {
                                            const newSections = [...editedPlan.sections];
                                            newSections[sIdx].title = e.target.value;
                                            setEditedPlan({...editedPlan, sections: newSections});
                                        }}
                                        className="bg-transparent border-b border-slate-600 text-white font-bold text-sm focus:border-blue-500 outline-none w-1/2"
                                    />
                                    <div className="flex gap-2">
                                        <button 
                                            onClick={() => {
                                                const newSections = [...editedPlan.sections];
                                                newSections[sIdx].options.push({ id: Date.now().toString(), name: `Opción ${section.options.length + 1}`, description: '' });
                                                setEditedPlan({...editedPlan, sections: newSections});
                                            }}
                                            className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                                        >
                                            <Plus size={12} /> Opción
                                        </button>
                                        <button 
                                            onClick={() => {
                                                const newSections = editedPlan.sections.filter((_, i) => i !== sIdx);
                                                setEditedPlan({...editedPlan, sections: newSections});
                                            }}
                                            className="text-xs text-red-400 hover:text-red-300"
                                        >
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 gap-3">
                                    {section.options.map((opt, oIdx) => (
                                        <div key={oIdx} className="flex gap-3 items-start">
                                            <div className="flex-1">
                                                <input 
                                                    type="text" 
                                                    value={opt.name}
                                                    onChange={e => {
                                                        const newSections = [...editedPlan.sections];
                                                        newSections[sIdx].options[oIdx].name = e.target.value;
                                                        setEditedPlan({...editedPlan, sections: newSections});
                                                    }}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded p-1.5 text-xs text-blue-300 mb-1"
                                                    placeholder="Nombre Opción"
                                                />
                                                <textarea 
                                                    value={opt.description}
                                                    onChange={e => {
                                                        const newSections = [...editedPlan.sections];
                                                        newSections[sIdx].options[oIdx].description = e.target.value;
                                                        setEditedPlan({...editedPlan, sections: newSections});
                                                    }}
                                                    className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-sm text-white resize-none h-20"
                                                    placeholder="Descripción de la comida..."
                                                />
                                            </div>
                                            <button 
                                                onClick={() => {
                                                    const newSections = [...editedPlan.sections];
                                                    newSections[sIdx].options = newSections[sIdx].options.filter((_, i) => i !== oIdx);
                                                    setEditedPlan({...editedPlan, sections: newSections});
                                                }}
                                                className="text-slate-600 hover:text-red-400 mt-2"
                                            >
                                                <X size={14} />
                                            </button>
                                        </div>
                                    ))}
                                    {section.options.length === 0 && <p className="text-xs text-slate-500 italic">Sin opciones.</p>}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Footer Info */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Suplementos</label>
                            <textarea 
                                value={editedPlan.supplements}
                                onChange={e => setEditedPlan({...editedPlan, supplements: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white h-24"
                            />
                        </div>
                        <div>
                            <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Evitar</label>
                            <textarea 
                                value={editedPlan.avoid}
                                onChange={e => setEditedPlan({...editedPlan, avoid: e.target.value})}
                                className="w-full bg-slate-800 border border-slate-600 rounded-lg p-3 text-white h-24"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer Actions */}
                <div className="p-4 border-t border-slate-800 flex justify-end gap-3 bg-slate-900 shrink-0 rounded-b-xl">
                    <button onClick={() => setShowEditModal(false)} className="px-6 py-2 text-slate-400 hover:text-white font-medium">Cancelar</button>
                    <button onClick={handleSavePlan} className="bg-[#0085db] hover:bg-[#0070b8] text-white px-6 py-2 rounded-lg font-bold flex items-center gap-2 shadow-lg">
                        <Save size={18} /> Guardar Plan
                    </button>
                </div>
            </div>
        </div>
       )}
    </div>
  );
}