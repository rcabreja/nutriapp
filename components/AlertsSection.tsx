import React from 'react';
import { Link } from 'react-router-dom';
import { Patient } from '../types';
import { Bell, Clock, Calendar } from 'lucide-react';
import { addDays, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

interface Props {
    patients: Patient[];
}

export default function AlertsSection({ patients }: Props) {
    const tomorrow = addDays(new Date(), 1);
    const tomorrowStr = format(tomorrow, 'yyyy-MM-dd');

    const upcomingAppointments = patients.flatMap(patient => {
        return patient.notes
            .filter(note => note.nextAppointment && note.nextAppointment.startsWith(tomorrowStr))
            .map(note => ({
                patient,
                appointmentDate: note.nextAppointment!
            }));
    });

    if (upcomingAppointments.length === 0) {
        return null;
    }

    return (
        <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
                <div className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-500 flex items-center justify-center animate-pulse">
                    <Bell size={18} />
                </div>
                <h2 className="text-xl font-bold text-white">Recordatorios para Mañana</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {upcomingAppointments.map((appt, idx) => {
                    const dateObj = parseISO(appt.appointmentDate);
                    const timeStr = format(dateObj, 'h:mm a');

                    return (
                        <Link
                            key={`${appt.patient.id}-${idx}`}
                            to={`/patients/${appt.patient.id}`}
                            className="bg-slate-900 border border-amber-500/30 hover:border-amber-500/60 rounded-xl p-4 flex items-center gap-4 transition-all group"
                        >
                            <div className="w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-xl font-bold text-amber-500 shrink-0">
                                {appt.patient.name.charAt(0)}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-white truncate group-hover:text-amber-400 transition-colors">
                                    {appt.patient.name}
                                </p>
                                <div className="flex items-center gap-3 text-sm text-slate-400 mt-1">
                                    <span className="flex items-center gap-1 bg-amber-500/10 text-amber-500 px-2 py-0.5 rounded text-xs font-bold">
                                        <Clock size={12} /> {timeStr}
                                    </span>
                                    <span className="text-xs">Cita de Seguimiento</span>
                                </div>
                            </div>
                        </Link>
                    );
                })}
            </div>
        </div>
    );
}
