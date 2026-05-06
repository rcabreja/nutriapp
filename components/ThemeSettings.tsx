import React from 'react';
import { useNutri } from '../context';
import { Palette, Type, RefreshCcw, LayoutTemplate } from 'lucide-react';
import { ThemeConfig } from '../types';
import DataSettings from './DataSettings';

const DEFAULT_THEME: ThemeConfig = {
    appBg: '#020617',
    cardBg: '#0f172a',
    textColor: '#f1f5f9',
    primaryColor: '#2563eb',
    fontFamily: "'Inter', sans-serif"
};

const PRESET_THEMES = [
    {
        name: 'Nocturno (Default)',
        config: DEFAULT_THEME
    },
    {
        name: 'Diurno (Claro)',
        config: {
            appBg: '#f1f5f9', // slate-100
            cardBg: '#ffffff', // white
            textColor: '#0f172a', // slate-900
            primaryColor: '#2563eb', // blue-600
            fontFamily: "'Inter', sans-serif"
        }
    },
    {
        name: 'Naturaleza',
        config: {
            appBg: '#052e16', // green-950
            cardBg: '#14532d', // green-900
            textColor: '#f0fdf4', // green-50
            primaryColor: '#22c55e', // green-500
            fontFamily: "'Inter', sans-serif"
        }
    },
    {
        name: 'Neón Cyber',
        config: {
            appBg: '#09090b', // zinc-950
            cardBg: '#18181b', // zinc-900
            textColor: '#e4e4e7', // zinc-200
            primaryColor: '#d946ef', // fuchsia-500
            fontFamily: "'Roboto Mono', monospace"
        }
    },
    {
        name: 'Océano Profundo',
        config: {
            appBg: '#082f49', // sky-950
            cardBg: '#0c4a6e', // sky-900
            textColor: '#f0f9ff', // sky-50
            primaryColor: '#0ea5e9', // sky-500
            fontFamily: "'Merriweather', serif"
        }
    }
];

export default function ThemeSettings() {
    const { theme, updateTheme } = useNutri();

    const handleChange = (key: keyof ThemeConfig, value: string) => {
        updateTheme({ ...theme, [key]: value });
    };

    const applyPreset = (presetConfig: ThemeConfig) => {
        updateTheme(presetConfig);
    };

    const resetTheme = () => {
        updateTheme(DEFAULT_THEME);
    };

    return (
        <div className="max-w-4xl mx-auto space-y-8 pb-12">
            <div className="flex justify-between items-center">
                <div>
                    <h2 className="text-3xl font-bold text-[#3c584b] mb-2">Diseño y Personalización</h2>
                    <p className="opacity-70">Personaliza la apariencia de la plataforma.</p>
                </div>
                <button
                    onClick={resetTheme}
                    className="flex items-center gap-2 px-4 py-2 rounded-lg bg-[#fdf7e7] text-[#3c584b] hover:opacity-80 transition-opacity border border-[#cbd9ce]"
                >
                    <RefreshCcw size={16} /> Restaurar Predeterminado
                </button>
            </div>

            {/* PRESET THEMES SECTION */}
            <div className="space-y-4">
                <h3 className="text-xl font-bold text-[#3c584b] flex items-center gap-2 border-b border-[#cbd9ce] pb-2">
                    <LayoutTemplate size={20} className="text-[#cbd9ce]" /> Temas Predeterminados
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {PRESET_THEMES.map((preset, idx) => (
                        <button
                            key={idx}
                            onClick={() => applyPreset(preset.config)}
                            className="relative group rounded-xl overflow-hidden border border-[#cbd9ce] hover:border-[#cbd9ce] transition-all text-left shadow-lg hover:shadow-xl hover:-translate-y-1"
                        >
                            {/* Color Preview */}
                            <div className="h-20 w-full flex">
                                <div className="w-1/3 h-full" style={{ backgroundColor: preset.config.appBg }}></div>
                                <div className="w-1/3 h-full" style={{ backgroundColor: preset.config.cardBg }}></div>
                                <div className="w-1/3 h-full flex items-center justify-center" style={{ backgroundColor: preset.config.cardBg }}>
                                    <div className="w-6 h-6 rounded-full" style={{ backgroundColor: preset.config.primaryColor }}></div>
                                </div>
                            </div>
                            <div className="p-3 bg-[#fdf7e7]">
                                <p className="text-sm font-bold text-[#3c584b]">{preset.name}</p>
                                <p className="text-[#3c584b] opacity-60">
                                    {preset.config.fontFamily.split(',')[0].replace(/'/g, '')}
                                </p>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Colors */}
                <div className="bg-[#cbd9ce] border border-[#cbd9ce] rounded-xl p-6 space-y-6 shadow-sm">
                    <h3 className="text-xl font-bold text-[#3c584b] flex items-center gap-2 mb-4 pb-2 border-b border-[#cbd9ce]">
                        <Palette size={20} className="text-[#cbd9ce]" /> Ajuste Manual de Colores
                    </h3>

                    <div className="space-y-4">
                        <ColorInput
                            label="Fondo Principal"
                            desc="El color de fondo de toda la aplicación."
                            value={theme.appBg}
                            onChange={v => handleChange('appBg', v)}
                        />
                        <ColorInput
                            label="Fondo de Tarjetas"
                            desc="Color de los paneles, modales y barras laterales."
                            value={theme.cardBg}
                            onChange={v => handleChange('cardBg', v)}
                        />
                        <ColorInput
                            label="Color Primario"
                            desc="Botones principales, enlaces y acentos."
                            value={theme.primaryColor}
                            onChange={v => handleChange('primaryColor', v)}
                        />
                        <ColorInput
                            label="Color de Texto"
                            desc="Color principal de la tipografía."
                            value={theme.textColor}
                            onChange={v => handleChange('textColor', v)}
                        />
                    </div>
                </div>

                {/* Typography */}
                <div className="bg-[#cbd9ce] border border-[#cbd9ce] rounded-xl p-6 space-y-6 h-fit shadow-sm">
                    <h3 className="text-xl font-bold text-[#3c584b] flex items-center gap-2 mb-4 pb-2 border-b border-[#cbd9ce]">
                        <Type size={20} className="text-[#cbd9ce]" /> Tipografía
                    </h3>

                    <div>
                        <label className="block text-sm font-bold text-[#3c584b] mb-2 opacity-80">Fuente Principal</label>
                        <select
                            value={theme.fontFamily}
                            onChange={e => handleChange('fontFamily', e.target.value)}
                            className="w-full bg-[#fdf7e7] border border-[#cbd9ce] rounded-lg p-3 text-[#3c584b] outline-none focus:border-[#cbd9ce] transition-colors"
                        >
                            <option value="'Inter', sans-serif">Inter (Moderno, Default)</option>
                            <option value="'Merriweather', serif">Merriweather (Elegante, Serif)</option>
                            <option value="'Roboto Mono', monospace">Roboto Mono (Técnico)</option>
                            <option value="system-ui, sans-serif">Sistema (Nativo del OS)</option>
                        </select>
                        <p className="text-xs opacity-60 mt-2">
                            La fuente seleccionada se aplicará a todos los textos de la aplicación.
                        </p>
                    </div>

                    <div className="mt-8 p-4 rounded-lg bg-[#fdf7e7] border border-[#cbd9ce]">
                        <h4 className="font-bold text-[#cbd9ce] mb-2">Vista Previa</h4>
                        <p className="text-[#3c584b] mb-4">
                            Así es como se visualiza el texto con la configuración actual. Los colores y la fuente reaccionan en tiempo real.
                        </p>
                        <button className="bg-[#cbd9ce] text-[#3c584b] px-4 py-2 rounded-lg font-medium shadow-lg hover:opacity-90">
                            Botón de Ejemplo
                        </button>
                    </div>
                </div>
            </div>

            {/* Data Management Section */}
            <DataSettings />
        </div>
    );
}

const ColorInput = ({ label, desc, value, onChange }: { label: string, desc: string, value: string, onChange: (v: string) => void }) => (
    <div className="flex items-center justify-between p-3 rounded-lg hover:bg-[#fdf7e7] dark:hover:bg-[#fdf7e7] transition-colors">
        <div>
            <p className="text-sm font-bold text-[#3c584b]">{label}</p>
            <p className="text-xs opacity-60">{desc}</p>
        </div>
        <div className="flex items-center gap-3">
            <span className="text-xs font-mono opacity-50 uppercase">{value}</span>
            <div className="relative overflow-hidden w-10 h-10 rounded border border-[#cbd9ce]">
                <input
                    type="color"
                    value={value}
                    onChange={e => onChange(e.target.value)}
                    className="absolute inset-0 w-[150%] h-[150%] -top-1/4 -left-1/4 cursor-pointer p-0 m-0"
                />
            </div>
        </div>
    </div>
);