import React, { useRef } from 'react';
import { useNutri } from '../context';
import { Download, Upload, FileJson, FileSpreadsheet, Database, AlertTriangle } from 'lucide-react';
import { AppState, Patient } from '../types';

export default function DataSettings() {
    const { users, patients, theme, importData } = useNutri();
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleExportJSON = () => {
        const data: AppState = {
            currentUser: null, // Don't export current session
            users,
            patients,
            theme
        };

        const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `nutriclinical_backup_${new Date().toISOString().split('T')[0]}.json`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    const handleImportJSON = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const json = JSON.parse(e.target?.result as string);
                if (importData(json)) {
                    alert('Datos restaurados correctamente.');
                    window.location.reload(); // Reload to refresh all state cleanly
                } else {
                    alert('Error: El archivo no tiene el formato correcto.');
                }
            } catch (err) {
                console.error(err);
                alert('Error al leer el archivo.');
            }
        };
        reader.readAsText(file);
        // Reset input
        if (fileInputRef.current) fileInputRef.current.value = '';
    };

    const handleExportCSV = () => {
        if (patients.length === 0) {
            alert('No hay pacientes para exportar.');
            return;
        }

        // Flatten patient data for CSV
        // We'll export basic info + latest stats
        const headers = ['ID', 'Nombre', 'Email', 'Teléfono', 'Edad', 'Género', 'Ocupación', 'Último Peso', 'Último IMC', 'Próxima Cita'];

        const rows = patients.map(p => {
            const lastAnthro = p.anthropometry.length > 0 ? p.anthropometry[p.anthropometry.length - 1] : null;
            // Calculate Age
            const age = new Date().getFullYear() - new Date(p.dob).getFullYear();

            return [
                p.id,
                `"${p.name}"`, // Quote to handle commas
                p.email,
                p.phone,
                age,
                p.gender,
                `"${p.occupation}"`,
                lastAnthro?.weight || '-',
                lastAnthro?.imc || '-',
                '-' // Next appointment placeholder
            ].join(',');
        });

        const csvContent = [headers.join(','), ...rows].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.href = url;
        link.download = `pacientes_export_${new Date().toISOString().split('T')[0]}.csv`;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    return (
        <div className="bg-[var(--card-bg)] border border-slate-700/30 rounded-xl p-6 space-y-6 shadow-sm">
            <h3 className="text-xl font-bold text-[var(--text-main)] flex items-center gap-2 mb-4 pb-2 border-b border-slate-700/30">
                <Database size={20} className="text-[var(--primary)]" /> Gestión de Datos
            </h3>

            <div className="space-y-4">

                {/* Backup Selection */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">

                    {/* JSON Export */}
                    <div className="p-4 rounded-lg bg-[var(--app-bg)] border border-slate-700/30 flex flex-col justify-between group hover:border-[var(--primary)] transition-colors">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-[var(--primary)]">
                                <FileJson size={24} />
                                <h4 className="font-bold">Copia de Seguridad (JSON)</h4>
                            </div>
                            <p className="text-sm opacity-70 mb-4">
                                Guarda una copia completa de todos los datos (pacientes, notas, configuración) en un archivo JSON.
                            </p>
                        </div>
                        <button
                            onClick={handleExportJSON}
                            className="w-full py-2 bg-[var(--primary)] text-white rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            <Download size={16} /> Descargar Respaldo
                        </button>
                    </div>

                    {/* CSV Export */}
                    <div className="p-4 rounded-lg bg-[var(--app-bg)] border border-slate-700/30 flex flex-col justify-between group hover:border-green-500 transition-colors">
                        <div>
                            <div className="flex items-center gap-2 mb-2 text-green-500">
                                <FileSpreadsheet size={24} />
                                <h4 className="font-bold">Exportar Pacientes (CSV)</h4>
                            </div>
                            <p className="text-sm opacity-70 mb-4">
                                Genera una lista de pacientes compatible con Excel/Google Sheets. (Solo datos básicos).
                            </p>
                        </div>
                        <button
                            onClick={handleExportCSV}
                            className="w-full py-2 bg-green-600 text-white rounded-lg flex items-center justify-center gap-2 hover:opacity-90 transition-opacity"
                        >
                            <Download size={16} /> Exportar Excel/CSV
                        </button>
                    </div>
                </div>

                {/* Restore Section */}
                <div className="mt-6 pt-6 border-t border-slate-700/30">
                    <h4 className="font-bold text-[var(--text-main)] mb-2 flex items-center gap-2">
                        <Upload size={18} /> Restaurar Datos
                    </h4>
                    <div className="bg-orange-500/10 border border-orange-500/20 rounded-lg p-4 mb-4">
                        <div className="flex gap-3">
                            <AlertTriangle className="text-orange-500 shrink-0" size={20} />
                            <p className="text-sm text-orange-200">
                                <span className="font-bold">Atención:</span> Importar un archivo reemplazará <strong>todos</strong> los datos actuales. Asegúrate de hacer una copia de seguridad antes de continuar.
                            </p>
                        </div>
                    </div>

                    <div className="flex gap-4">
                        <input
                            type="file"
                            accept=".json"
                            ref={fileInputRef}
                            onChange={handleImportJSON}
                            className="hidden"
                        />
                        <button
                            onClick={() => fileInputRef.current?.click()}
                            className="px-4 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors flex items-center gap-2"
                        >
                            <Upload size={16} /> Seleccionar Archivo de Respaldo (.json)
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
}
