import React, { useMemo, useState } from 'react';
import { useNutri } from '../context';
import { Users, Calendar, ArrowRight, Clock, ChevronLeft, ChevronRight, TrendingUp, CalendarDays, Activity } from 'lucide-react';
import { Bar } from 'react-chartjs-2';
import { Link } from 'react-router-dom';

const KPICard = ({ title, value, icon: Icon, color }: { title: string, value: string | number, icon: any, color: string }) => (
  <div className="bg-[var(--card-bg)] border border-slate-800 p-6 rounded-xl flex items-center justify-between">
    <div>
      <p className="text-slate-400 text-sm font-medium mb-1">{title}</p>
      <h3 className="text-3xl font-bold text-white">{value}</h3>
    </div>
    <div className={`p-3 rounded-lg bg-opacity-10 ${color.replace('text-', 'bg-')} ${color}`}>
      <Icon size={24} />
    </div>
  </div>
);

import AlertsSection from './AlertsSection';

export default function Dashboard() {
  const { patients } = useNutri();
  const [selectedDate, setSelectedDate] = useState(new Date().toISOString().split('T')[0]);

  // --- HELPER: Get Current Week Days ---
  const getCurrentWeekDays = () => {
    const curr = new Date();
    const first = curr.getDate() - curr.getDay() + 1; // First day is the day of the month - the day of the week + 1 (Monday)
    const days = [];
    for (let i = 0; i < 7; i++) {
      const next = new Date(curr.setDate(first + i));
      days.push(next.toISOString().split('T')[0]);
    }
    return days; // Array of YYYY-MM-DD strings for current week (Mon-Sun)
  };

  const weekDays = useMemo(() => getCurrentWeekDays(), []);

  // --- CHART DATA: Calculate Consultations per Day for Current Week ---
  const weeklyActivityData = useMemo(() => {
    const counts = weekDays.map(day => 0);

    patients.forEach(p => {
      p.notes.forEach(n => {
        const noteDate = n.date.split('T')[0]; // Extract YYYY-MM-DD
        const dayIndex = weekDays.indexOf(noteDate);
        if (dayIndex !== -1) {
          counts[dayIndex]++;
        }
      });
    });
    return counts;
  }, [patients, weekDays]);

  const totalWeeklyConsults = weeklyActivityData.reduce((a, b) => a + b, 0);

  // --- AGENDA LOGIC (Calendar Widget) ---
  const agendaPatients = useMemo(() => {
    return patients.filter(p => {
      // Check if any note has nextAppointment matching selectedDate (ignoring time)
      return p.notes.some(n => n.nextAppointment && n.nextAppointment.split('T')[0] === selectedDate);
    }).map(p => {
      const note = p.notes.find(n => n.nextAppointment && n.nextAppointment.split('T')[0] === selectedDate);
      return { ...p, appointmentNote: note };
    }).sort((a, b) => {
      // Chronological Sort
      const timeA = new Date(a.appointmentNote?.nextAppointment || '').getTime();
      const timeB = new Date(b.appointmentNote?.nextAppointment || '').getTime();
      return timeA - timeB;
    });
  }, [patients, selectedDate]);

  // --- UPCOMING APPOINTMENTS LOGIC (Global List) ---
  const upcomingAppointments = useMemo(() => {
    const today = new Date().toISOString().split('T')[0];
    const appointments: any[] = [];

    patients.forEach(p => {
      p.notes.forEach(n => {
        if (n.nextAppointment && n.nextAppointment >= today) {
          appointments.push({
            patientId: p.id,
            patientName: p.name,
            avatarUrl: p.avatarUrl,
            date: n.nextAppointment,
            objective: n.objective
          });
        }
      });
    });

    // Sort by date ascending
    return appointments.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()).slice(0, 5);
  }, [patients]);


  const changeDate = (days: number) => {
    const d = new Date(selectedDate);
    d.setDate(d.getDate() + days);
    setSelectedDate(d.toISOString().split('T')[0]);
  };

  // Mock data calculations
  const totalPatients = patients.length;

  const chartData = {
    labels: ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'],
    datasets: [{
      label: 'Consultas',
      data: weeklyActivityData,
      backgroundColor: '#3b82f6',
      borderRadius: 4,
      hoverBackgroundColor: '#2563eb'
    }]
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { display: false },
      title: { display: false }
    },
    scales: {
      y: {
        beginAtZero: true,
        ticks: { stepSize: 1, color: '#94a3b8' },
        grid: { color: '#1e293b' }
      },
      x: {
        ticks: { color: '#94a3b8' },
        grid: { display: false }
      }
    }
  };

  const displayDate = new Date(selectedDate + 'T12:00:00');

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-bold text-white">Panel General</h2>

      <AlertsSection patients={patients} />

      {/* 1. KPIs Section */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <KPICard title="PACIENTES TOTALES" value={totalPatients} icon={Users} color="text-blue-500" />
        <KPICard title="CONSULTAS SEMANA ACTUAL" value={totalWeeklyConsults} icon={Activity} color="text-green-500" />
      </div>

      {/* 2. Chart Section (Weekly Activity) */}
      <div className="bg-[var(--card-bg)] border border-slate-800 rounded-xl p-6">
        <div className="flex justify-between items-center mb-6">
          <h3 className="text-lg font-semibold text-white flex items-center gap-2">
            <TrendingUp size={20} className="text-blue-500" /> Actividad de la Semana
          </h3>
          <span className="text-xs text-slate-500 bg-slate-800 px-3 py-1 rounded-full border border-slate-700">
            {new Date(weekDays[0]).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })} - {new Date(weekDays[6]).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' })}
          </span>
        </div>
        <div className="h-64 w-full">
          <Bar data={chartData} options={chartOptions} />
        </div>
      </div>

      {/* 3. Bottom Grid: Agenda, Upcoming, Recent */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

        {/* COL 1: Agenda / Calendar Widget */}
        <div className="bg-[var(--card-bg)] border border-slate-800 rounded-xl flex flex-col h-[400px]">
          <div className="p-4 border-b border-slate-800 bg-slate-900/50 rounded-t-xl">
            <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Calendar size={18} className="text-purple-400" /> Agenda del Día
            </h3>
            <div className="flex items-center justify-between bg-slate-800 p-2 rounded-lg border border-slate-700">
              <button onClick={() => changeDate(-1)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><ChevronLeft size={20} /></button>
              <div className="text-center">
                <span className="block text-white font-bold capitalize text-sm">{displayDate.toLocaleDateString('es-ES', { weekday: 'long' })}</span>
                <span className="block text-xs text-slate-400">{displayDate.toLocaleDateString('es-ES', { day: 'numeric', month: 'long' })}</span>
              </div>
              <button onClick={() => changeDate(1)} className="p-1 hover:bg-slate-700 rounded text-slate-400 hover:text-white"><ChevronRight size={20} /></button>
            </div>
          </div>

          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
            {agendaPatients.length > 0 ? (
              agendaPatients.map(patient => (
                <div key={patient.id} className="flex items-center justify-between p-3 bg-slate-800/40 border border-slate-800 rounded-lg hover:border-purple-500/50 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold text-slate-300">
                      {patient.avatarUrl ? <img src={patient.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" /> : patient.name.charAt(0)}
                    </div>
                    <div>
                      <p className="text-sm font-bold text-white leading-tight">{patient.name}</p>
                      <p className="text-[10px] text-purple-400 flex items-center gap-1 mt-0.5">
                        <Clock size={10} />
                        {patient.appointmentNote?.nextAppointment
                          ? new Date(patient.appointmentNote.nextAppointment).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })
                          : 'Pendiente'}
                      </p>
                    </div>
                  </div>
                  <Link to={`/patients/${patient.id}`} className="p-1.5 text-slate-500 hover:text-white hover:bg-purple-600 rounded-lg transition-colors">
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500 flex flex-col items-center">
                <Calendar size={32} className="mb-2 opacity-20" />
                <p className="text-sm">Sin citas para este día.</p>
              </div>
            )}
          </div>
        </div>

        {/* COL 2: Upcoming Appointments List */}
        <div className="bg-[var(--card-bg)] border border-slate-800 rounded-xl flex flex-col h-[400px]">
          <div className="p-4 border-b border-slate-800 rounded-t-xl">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <CalendarDays size={18} className="text-blue-400" /> Próximas Citas
            </h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
            {upcomingAppointments.length > 0 ? (
              upcomingAppointments.map((apt, idx) => (
                <div key={`${apt.patientId}-${idx}`} className="flex items-start gap-3 p-3 bg-slate-800/20 border border-slate-800 rounded-lg">
                  <div className="bg-blue-900/30 text-blue-400 rounded-lg px-2 py-1 text-center min-w-[50px] border border-blue-900/50">
                    <span className="block text-xs font-bold uppercase">{new Date(apt.date).toLocaleDateString('es-ES', { month: 'short' })}</span>
                    <span className="block text-lg font-bold leading-none">{new Date(apt.date).getDate()}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-white truncate">{apt.patientName}</h4>
                    <div className="flex justify-between items-center mt-1">
                      <p className="text-xs text-slate-400 truncate">{apt.objective || 'Revisión'}</p>
                      <span className="text-[10px] bg-slate-800 px-1.5 py-0.5 rounded text-slate-300">
                        {new Date(apt.date).toLocaleTimeString('es-ES', { hour: '2-digit', minute: '2-digit' })}
                      </span>
                    </div>
                  </div>
                  <Link to={`/patients/${apt.patientId}`} className="text-slate-500 hover:text-blue-400 pt-1">
                    <ArrowRight size={16} />
                  </Link>
                </div>
              ))
            ) : (
              <div className="text-center py-12 text-slate-500">
                <p className="text-sm">No hay citas futuras registradas.</p>
              </div>
            )}
          </div>
        </div>

        {/* COL 3: Recent Patients */}
        <div className="bg-[var(--card-bg)] border border-slate-800 rounded-xl flex flex-col h-[400px]">
          <div className="p-4 border-b border-slate-800 rounded-t-xl">
            <h3 className="text-lg font-semibold text-white flex items-center gap-2">
              <Users size={18} className="text-slate-400" /> Recientes
            </h3>
          </div>
          <div className="p-4 flex-1 overflow-y-auto custom-scrollbar space-y-3">
            {patients.slice(0, 5).map(patient => (
              <div key={patient.id} className="flex items-center justify-between p-3 bg-slate-800/20 rounded-lg hover:bg-slate-800 transition-colors group">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-slate-700 flex items-center justify-center text-xs font-bold border border-slate-600">
                    {patient.avatarUrl ? <img src={patient.avatarUrl} alt="" className="w-full h-full object-cover rounded-full" /> : patient.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-white">{patient.name}</p>
                    <p className="text-[10px] text-slate-500">
                      {patient.notes.length > 0
                        ? `Última: ${new Date(patient.notes[0].date).toLocaleDateString()}`
                        : 'Nuevo ingreso'}
                    </p>
                  </div>
                </div>
                <Link to={`/patients/${patient.id}`} className="p-2 text-slate-500 hover:text-white hover:bg-slate-700 rounded-full transition-colors opacity-0 group-hover:opacity-100">
                  <ArrowRight size={14} />
                </Link>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}