import React, { useState } from 'react';
import {
    format,
    startOfMonth,
    endOfMonth,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    isSameMonth,
    isSameDay,
    addMonths,
    subMonths,
    isToday,
    parseISO
} from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { ChevronLeft, ChevronRight, Calendar as CalendarIcon, X } from 'lucide-react';
import { Note } from '../types';

interface CalendarFilterProps {
    notes: Note[];
    selectedDate: string | null;
    onSelectDate: (date: string | null) => void;
}

export default function CalendarFilter({ notes, selectedDate, onSelectDate }: CalendarFilterProps) {
    const [currentMonth, setCurrentMonth] = useState(new Date());

    // Extract dates with events
    const noteDates = notes.map(n => n.date.split('T')[0]);
    const appointmentDates = notes
        .filter(n => n.nextAppointment)
        .map(n => n.nextAppointment?.split('T')[0]);

    const hasNote = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return noteDates.includes(dateStr);
    };

    const hasAppointment = (date: Date) => {
        const dateStr = format(date, 'yyyy-MM-dd');
        return appointmentDates.includes(dateStr);
    };

    const nextMonth = () => setCurrentMonth(addMonths(currentMonth, 1));
    const prevMonth = () => setCurrentMonth(subMonths(currentMonth, 1));
    const resetDate = () => onSelectDate(null);

    const renderHeader = () => {
        return (
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-white font-bold text-lg capitalize flex items-center gap-2">
                    <CalendarIcon size={18} className="text-blue-500" />
                    {format(currentMonth, 'MMMM yyyy', { locale: es })}
                </h3>
                <div className="flex gap-1">
                    <button onClick={prevMonth} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <ChevronLeft size={20} />
                    </button>
                    <button onClick={nextMonth} className="p-1 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-white transition-colors">
                        <ChevronRight size={20} />
                    </button>
                </div>
            </div>
        );
    };

    const renderDays = () => {
        const days = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'];
        return (
            <div className="grid grid-cols-7 mb-2">
                {days.map(day => (
                    <div key={day} className="text-center text-xs font-bold text-slate-500 uppercase tracking-widest py-1">
                        {day}
                    </div>
                ))}
            </div>
        );
    };

    const renderCells = () => {
        const monthStart = startOfMonth(currentMonth);
        const monthEnd = endOfMonth(monthStart);
        const startDate = startOfWeek(monthStart);
        const endDate = endOfWeek(monthEnd);

        const dateFormat = "d";
        const rows = [];
        let days = [];
        let day = startDate;
        let formattedDate = "";

        const daysInMonth = eachDayOfInterval({
            start: startDate,
            end: endDate
        });

        return (
            <div className="grid grid-cols-7 gap-1">
                {daysInMonth.map((dayItem, idx) => {
                    const isSelected = selectedDate ? isSameDay(dayItem, parseISO(selectedDate)) : false;
                    const isCurrentMonth = isSameMonth(dayItem, monthStart);
                    const isDayToday = isToday(dayItem);
                    const hasNoteEvent = hasNote(dayItem);
                    const hasApptEvent = hasAppointment(dayItem);

                    return (
                        <div
                            key={dayItem.toString()}
                            className={`
                            relative h-10 w-full flex items-center justify-center rounded-lg cursor-pointer transition-all border
                            ${!isCurrentMonth ? 'text-slate-600 border-transparent hover:bg-slate-800/30' : 'text-slate-300 border-slate-800/50 hover:bg-slate-800'}
                            ${isSelected ? 'bg-blue-600 text-white border-blue-500 shadow-lg shadow-blue-900/50 scale-105 z-10' : ''}
                            ${isDayToday && !isSelected ? 'bg-slate-800 text-blue-400 border-blue-500/30' : ''}
                        `}
                            onClick={() => onSelectDate(format(dayItem, 'yyyy-MM-dd'))}
                        >
                            <span className="text-sm font-medium">{format(dayItem, 'd')}</span>

                            {/* Indicators */}
                            <div className="absolute bottom-1 flex gap-0.5">
                                {hasNoteEvent && (
                                    <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-blue-500'}`}></div>
                                )}
                                {hasApptEvent && (
                                    <div className={`w-1 h-1 rounded-full ${isSelected ? 'bg-white' : 'bg-green-500'}`}></div>
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        );
    };

    return (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-fit">
            {renderHeader()}
            {renderDays()}
            {renderCells()}

            {selectedDate && (
                <div className="mt-4 pt-4 border-t border-slate-800 flex justify-between items-center animate-in fade-in slide-in-from-top-2">
                    <span className="text-sm text-slate-300">
                        Filtro: <span className="font-bold text-white">{format(parseISO(selectedDate), "dd 'de' MMMM", { locale: es })}</span>
                    </span>
                    <button
                        onClick={resetDate}
                        className="text-xs flex items-center gap-1 bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-1 rounded transition-colors"
                    >
                        <X size={12} /> Limpiar
                    </button>
                </div>
            )}

            {!selectedDate && (
                <div className="mt-4 pt-4 border-t border-slate-800 flex gap-4 justify-center text-[10px] text-slate-500 uppercase font-bold tracking-wider">
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-blue-500"></div> Visita
                    </div>
                    <div className="flex items-center gap-1">
                        <div className="w-2 h-2 rounded-full bg-green-500"></div> Cita
                    </div>
                </div>
            )}
        </div>
    );
}
