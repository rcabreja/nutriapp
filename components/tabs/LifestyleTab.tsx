import React, { useState } from 'react';
import { Patient, Lifestyle } from '../../types';
import { Edit2, Coffee, Moon, Activity, DollarSign, Utensils, ShoppingCart, AlertCircle, Plus, X } from 'lucide-react';

interface Props {
    patient: Patient;
    updatePatient: (id: string, data: Partial<Patient>) => void;
    readOnly: boolean;
}

const Section = ({ title, icon: Icon, children }: { title: string, icon: any, children?: React.ReactNode }) => (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
        <div className="flex items-center gap-2 mb-4 text-blue-400">
            <Icon size={20} />
            <h3 className="font-bold uppercase tracking-wider text-sm">{title}</h3>
        </div>
        {children}
    </div>
);

export default function LifestyleTab({ patient, updatePatient, readOnly }: Props) {
    const [isEditing, setIsEditing] = useState(false);
    const [data, setData] = useState<Lifestyle>(patient.lifestyle);

    const handleSave = () => {
        updatePatient(patient.id, { lifestyle: data });
        setIsEditing(false);
    };

    const addItem = (field: 'foodAllergies' | 'foodIntolerances', value: string) => {
        if (!value.trim()) return;
        const currentList = data[field] || [];
        setData({ ...data, [field]: [...currentList, value.trim()] });
    };

    const removeItem = (field: 'foodAllergies' | 'foodIntolerances', index: number) => {
        const currentList = data[field] || [];
        setData({ ...data, [field]: currentList.filter((_, i) => i !== index) });
    };

    return (
        <div className="space-y-6">
            <div className="flex justify-between items-center">
                <h3 className="text-xl font-bold text-white">Estilo de Vida y Hábitos</h3>
                {!readOnly && (
                    isEditing ? (
                        <div className="flex gap-2">
                            <button onClick={() => setIsEditing(false)} className="px-4 py-2 text-slate-400 hover:text-white transition-colors">Cancelar</button>
                            <button onClick={handleSave} className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-colors">Guardar</button>
                        </div>
                    ) : (
                        <button onClick={() => setIsEditing(true)} className="bg-slate-800 hover:bg-slate-700 text-blue-400 px-4 py-2 rounded-lg flex items-center gap-2 transition-colors border border-slate-700">
                            <Edit2 size={16} /> Editar
                        </button>
                    )
                )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Activity */}
                <Section title="Actividad Física" icon={Activity}>
                    <div className="space-y-4">
                        <label className="flex items-center gap-3 p-3 bg-slate-800/50 rounded-lg cursor-pointer">
                            <input
                                type="checkbox"
                                checked={data.activity.regular}
                                disabled={!isEditing}
                                onChange={e => setData({ ...data, activity: { ...data.activity, regular: e.target.checked } })}
                                className="w-5 h-5 rounded border-slate-600 bg-slate-700 text-blue-600 focus:ring-blue-500"
                            />
                            <span className="text-slate-200">Realiza Actividad Física regularmente</span>
                        </label>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Tipo de Ejercicio</label>
                                <input
                                    disabled={!isEditing}
                                    value={data.activity.type}
                                    onChange={e => setData({ ...data, activity: { ...data.activity, type: e.target.value } })}
                                    placeholder="Ej. Pesas, Cardio..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Frecuencia</label>
                                <input
                                    disabled={!isEditing}
                                    value={data.activity.frequency}
                                    onChange={e => setData({ ...data, activity: { ...data.activity, frequency: e.target.value } })}
                                    placeholder="Ej. 3 veces/sem..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Duración Promedio</label>
                                <input
                                    disabled={!isEditing}
                                    value={data.activity.duration}
                                    onChange={e => setData({ ...data, activity: { ...data.activity, duration: e.target.value } })}
                                    placeholder="Ej. 45 min..."
                                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <p className="text-xs uppercase text-slate-500 font-bold mb-1">Detalles Adicionales</p>
                            {isEditing ? (
                                <textarea
                                    value={data.activity.details}
                                    onChange={e => setData({ ...data, activity: { ...data.activity, details: e.target.value } })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none transition-colors"
                                />
                            ) : (
                                <p className="p-3 bg-slate-800 rounded-lg text-slate-300 text-sm border border-slate-800">{data.activity.details || 'Sin detalles'}</p>
                            )}
                        </div>
                    </div>
                </Section>

                {/* Sleep & Stress */}
                <Section title="Sueño, Estrés y Sustancias" icon={Moon}>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase">Horas Sueño</label>
                            <input
                                disabled={!isEditing}
                                value={data.sleep.hours}
                                onChange={e => setData({ ...data, sleep: { ...data.sleep, hours: e.target.value } })}
                                className="w-full bg-slate-800 border border-slate-700 rounded text-white text-sm mt-1 p-2 focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase">Nivel Estrés (General)</label>
                            {isEditing ? (
                                <select
                                    value={data.sleep.stress}
                                    onChange={e => setData({ ...data, sleep: { ...data.sleep, stress: e.target.value } })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded text-white text-sm mt-1 p-2 focus:border-blue-500 outline-none transition-colors"
                                >
                                    <option value="Bajo">Bajo</option>
                                    <option value="Medio">Medio</option>
                                    <option value="Alto">Alto</option>
                                </select>
                            ) : (
                                <div className="w-full bg-slate-800 border border-slate-800 rounded text-white text-sm mt-1 p-2">
                                    {data.sleep.stress || 'No especificado'}
                                </div>
                            )}
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-slate-500 font-bold uppercase">Nivel Estrés (Diario)</label>
                            <input
                                disabled={!isEditing}
                                value={data.stressLevel}
                                placeholder="Ej. Del 1 al 10..."
                                onChange={e => setData({ ...data, stressLevel: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded text-white text-sm mt-1 p-2 focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                        <div className="col-span-2">
                            <label className="text-xs text-slate-500 font-bold uppercase">Horarios Comida</label>
                            <input
                                disabled={!isEditing}
                                value={data.diet.meals}
                                onChange={e => setData({ ...data, diet: { ...data.diet, meals: e.target.value } })}
                                className="w-full bg-slate-800 border border-slate-700 rounded text-white text-sm mt-1 p-2 focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>

                        {/* Separated Alcohol and Tobacco */}
                        <div className="col-span-2 grid grid-cols-2 gap-4 mt-2">
                            <div className={`p-3 rounded-lg border flex flex-col gap-2 transition-colors ${data.diet.alcohol ? 'bg-red-500/10 border-red-500/30' : 'bg-slate-800 border-slate-700'}`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-300">Alcohol</span>
                                    <input
                                        type="checkbox"
                                        disabled={!isEditing}
                                        checked={data.diet.alcohol}
                                        onChange={e => setData({ ...data, diet: { ...data.diet, alcohol: e.target.checked } })}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-red-500 focus:ring-red-500"
                                    />
                                </div>
                                {data.diet.alcohol && (
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        <div>
                                            <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Tipo</label>
                                            <input
                                                disabled={!isEditing}
                                                value={data.diet.alcoholType || ''}
                                                onChange={e => setData({ ...data, diet: { ...data.diet, alcoholType: e.target.value } })}
                                                placeholder="Ej. Cerveza, Vino..."
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs focus:border-red-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Frecuencia</label>
                                            <input
                                                disabled={!isEditing}
                                                value={data.diet.alcoholFrequency || ''}
                                                onChange={e => setData({ ...data, diet: { ...data.diet, alcoholFrequency: e.target.value } })}
                                                placeholder="Ej. Fines de sem..."
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs focus:border-red-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                            <div className={`p-3 rounded-lg border flex flex-col gap-2 transition-colors ${data.diet.tobacco ? 'bg-orange-500/10 border-orange-500/30' : 'bg-slate-800 border-slate-700'}`}>
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-bold text-slate-300">Tabaco</span>
                                    <input
                                        type="checkbox"
                                        disabled={!isEditing}
                                        checked={data.diet.tobacco}
                                        onChange={e => setData({ ...data, diet: { ...data.diet, tobacco: e.target.checked } })}
                                        className="w-4 h-4 rounded border-slate-600 bg-slate-700 text-orange-500 focus:ring-orange-500"
                                    />
                                </div>
                                {data.diet.tobacco && (
                                    <div className="grid grid-cols-2 gap-2 mt-1">
                                        <div>
                                            <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Tipo</label>
                                            <input
                                                disabled={!isEditing}
                                                value={data.diet.tobaccoType || ''}
                                                onChange={e => setData({ ...data, diet: { ...data.diet, tobaccoType: e.target.value } })}
                                                placeholder="Ej. Cigarrillo..."
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs focus:border-orange-500 outline-none"
                                            />
                                        </div>
                                        <div>
                                            <label className="text-xs text-slate-500 font-bold uppercase mb-1 block">Frecuencia</label>
                                            <input
                                                disabled={!isEditing}
                                                value={data.diet.tobaccoFrequency || ''}
                                                onChange={e => setData({ ...data, diet: { ...data.diet, tobaccoFrequency: e.target.value } })}
                                                placeholder="Ej. 1 cajetilla/día"
                                                className="w-full bg-slate-900 border border-slate-700 rounded p-2 text-white text-xs focus:border-orange-500 outline-none"
                                            />
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Habits & Routine Section */}
                <Section title="Hábitos y Rutina Diaria" icon={Coffee}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Suplementación Actual</label>
                                <textarea
                                    disabled={!isEditing}
                                    value={data.supplementation}
                                    onChange={e => setData({ ...data, supplementation: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded text-white text-sm p-2 focus:border-blue-500 outline-none h-20 resize-none"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Medicamentos Peso / Sustancias</label>
                                <textarea
                                    disabled={!isEditing}
                                    value={data.weightLossMeds}
                                    placeholder="Uso previo de medicamentos para bajar de peso..."
                                    onChange={e => setData({ ...data, weightLossMeds: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded text-white text-sm p-2 focus:border-blue-500 outline-none h-20 resize-none mb-2"
                                />
                                <input
                                    disabled={!isEditing}
                                    value={data.toxicSubstances}
                                    placeholder="Consumo de otras sustancias (drogas)..."
                                    onChange={e => setData({ ...data, toxicSubstances: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded text-white text-sm p-2 focus:border-blue-500 outline-none"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Rutina Diaria (Resumen)</label>
                            <textarea
                                disabled={!isEditing}
                                value={data.dailyRoutine}
                                placeholder="Descripción breve de un día típico..."
                                onChange={e => setData({ ...data, dailyRoutine: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded text-white text-sm p-2 focus:border-blue-500 outline-none h-20 resize-none"
                            />
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Horas Sentado</label>
                                <input
                                    disabled={!isEditing}
                                    value={data.sittingHours}
                                    onChange={e => setData({ ...data, sittingHours: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Hora despertar</label>
                                <input
                                    type="time"
                                    disabled={!isEditing}
                                    value={data.wakeUpTime}
                                    onChange={e => setData({ ...data, wakeUpTime: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Hora acostarse</label>
                                <input
                                    type="time"
                                    disabled={!isEditing}
                                    value={data.bedTime}
                                    onChange={e => setData({ ...data, bedTime: e.target.value })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase block mb-1">Nivel energía (Día)</label>
                                {isEditing ? (
                                    <select
                                        value={data.energyLevel}
                                        onChange={e => setData({ ...data, energyLevel: e.target.value as any })}
                                        className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm"
                                    >
                                        <option value="">Seleccionar</option>
                                        <option value="Activo">Activo</option>
                                        <option value="Cansado">Cansado</option>
                                        <option value="Variable">Variable</option>
                                    </select>
                                ) : (
                                    <div className="w-full bg-slate-800 border border-slate-800 rounded text-white text-sm p-2">
                                        {data.energyLevel || '-'}
                                    </div>
                                )}
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase block mb-1">¿Cuidas tu salud de otra manera?</label>
                            <input
                                disabled={!isEditing}
                                value={data.otherHealthCare}
                                onChange={e => setData({ ...data, otherHealthCare: e.target.value })}
                                className="w-full bg-slate-800 border border-slate-700 rounded text-white text-sm p-2 focus:border-blue-500 outline-none"
                            />
                        </div>
                    </div>
                </Section>

                {/* Preferences */}
                <Section title="Preferencias y Economía" icon={DollarSign}>
                    <div className="space-y-4">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase">Preferencias</label>
                                <input
                                    disabled={!isEditing}
                                    value={data.preferences.likes}
                                    onChange={e => setData({ ...data, preferences: { ...data.preferences, likes: e.target.value } })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded text-white text-sm mt-1 p-2 focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase">Aversiones</label>
                                <input
                                    disabled={!isEditing}
                                    value={data.preferences.dislikes}
                                    onChange={e => setData({ ...data, preferences: { ...data.preferences, dislikes: e.target.value } })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded text-white text-sm mt-1 p-2 focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase">Presupuesto</label>
                                <select
                                    disabled={!isEditing}
                                    value={data.preferences.budget}
                                    onChange={e => setData({ ...data, preferences: { ...data.preferences, budget: e.target.value as any } })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded text-white text-sm mt-1 p-2 focus:border-blue-500 outline-none transition-colors"
                                >
                                    <option value="Bajo">Bajo</option>
                                    <option value="Medio">Medio</option>
                                    <option value="Alto">Alto</option>
                                </select>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold uppercase">Acceso a Alimentos</label>
                                <input
                                    disabled={!isEditing}
                                    value={data.preferences.access}
                                    placeholder="Ej. Súper, Mercado..."
                                    onChange={e => setData({ ...data, preferences: { ...data.preferences, access: e.target.value } })}
                                    className="w-full bg-slate-800 border border-slate-700 rounded text-white text-sm mt-1 p-2 focus:border-blue-500 outline-none transition-colors"
                                />
                            </div>
                        </div>

                        <div>
                            <label className="text-xs text-slate-500 font-bold uppercase flex items-center gap-1">
                                <Utensils size={12} /> Frecuencia de comer fuera
                            </label>
                            <input
                                disabled={!isEditing}
                                value={data.preferences.eatingOut}
                                placeholder="Ej. 2 veces por semana..."
                                onChange={e => setData({ ...data, preferences: { ...data.preferences, eatingOut: e.target.value } })}
                                className="w-full bg-slate-800 border border-slate-700 rounded text-white text-sm mt-1 p-2 focus:border-blue-500 outline-none transition-colors"
                            />
                        </div>
                    </div>
                </Section>

                {/* New Allergies/Intolerances Section */}
                <Section title="Alergias e Intolerancias" icon={AlertCircle}>
                    <div className="space-y-6">
                        <TagInput
                            label="Alergias Alimentarias"
                            placeholder="Ej. Cacahuates"
                            items={Array.isArray(data.foodAllergies) ? data.foodAllergies : (data.foodAllergies ? [data.foodAllergies] : [])}
                            onAdd={(v) => addItem('foodAllergies', v)}
                            onRemove={(i) => removeItem('foodAllergies', i)}
                            isEditing={isEditing}
                        />

                        <TagInput
                            label="Intolerancias Alimentarias"
                            placeholder="Ej. Lactosa"
                            items={Array.isArray(data.foodIntolerances) ? data.foodIntolerances : (data.foodIntolerances ? [data.foodIntolerances] : [])}
                            onAdd={(v) => addItem('foodIntolerances', v)}
                            onRemove={(i) => removeItem('foodIntolerances', i)}
                            isEditing={isEditing}
                        />
                    </div>
                </Section>
                {/* Nutritional Habits Section */}
                <Section title="Hábitos Alimenticios" icon={Utensils}>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-500 font-bold block mb-1">Tipo de dieta actual</label>
                                <input disabled={!isEditing} value={data.nutritionalHabits?.dietType || ''} onChange={e => setData({ ...data, nutritionalHabits: { ...data.nutritionalHabits, dietType: e.target.value } })} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold block mb-1">Número de comidas al día</label>
                                <input disabled={!isEditing} value={data.nutritionalHabits?.mealsPerDay || ''} onChange={e => setData({ ...data, nutritionalHabits: { ...data.nutritionalHabits, mealsPerDay: e.target.value } })} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold block mb-1">¿Quién cocina?</label>
                                <input disabled={!isEditing} value={data.nutritionalHabits?.cookingHabits || ''} onChange={e => setData({ ...data, nutritionalHabits: { ...data.nutritionalHabits, cookingHabits: e.target.value } })} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold block mb-1">Horarios para comer</label>
                                <input disabled={!isEditing} value={data.nutritionalHabits?.mealTimes || ''} onChange={e => setData({ ...data, nutritionalHabits: { ...data.nutritionalHabits, mealTimes: e.target.value } })} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold block mb-1">Compañía / Distractores al comer</label>
                                <input disabled={!isEditing} value={data.nutritionalHabits?.eatingCompany || ''} onChange={e => setData({ ...data, nutritionalHabits: { ...data.nutritionalHabits, eatingCompany: e.target.value } })} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none transition-colors" />
                            </div>
                        </div>
                        <div className="space-y-3">
                            <div>
                                <label className="text-xs text-slate-500 font-bold block mb-1">Recetas favoritas</label>
                                <input disabled={!isEditing} value={data.nutritionalHabits?.favoriteRecipes || ''} onChange={e => setData({ ...data, nutritionalHabits: { ...data.nutritionalHabits, favoriteRecipes: e.target.value } })} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none transition-colors" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs text-slate-500 font-bold block mb-1">Agua (vasos/litros)</label>
                                    <input disabled={!isEditing} value={data.nutritionalHabits?.waterConsumption || ''} onChange={e => setData({ ...data, nutritionalHabits: { ...data.nutritionalHabits, waterConsumption: e.target.value } })} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none transition-colors" />
                                </div>
                                <div>
                                    <label className="text-xs text-slate-500 font-bold block mb-1">Café (tazas)</label>
                                    <input disabled={!isEditing} value={data.nutritionalHabits?.coffeeConsumption || ''} onChange={e => setData({ ...data, nutritionalHabits: { ...data.nutritionalHabits, coffeeConsumption: e.target.value } })} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none transition-colors" />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold block mb-1">Frecuencia comer fuera / a domicilio</label>
                                <input disabled={!isEditing} value={data.nutritionalHabits?.eatingOutFrequency || ''} onChange={e => setData({ ...data, nutritionalHabits: { ...data.nutritionalHabits, eatingOutFrequency: e.target.value } })} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none transition-colors" />
                            </div>
                            <div>
                                <label className="text-xs text-slate-500 font-bold block mb-1">Frecuencia alimentos procesados</label>
                                <input disabled={!isEditing} value={data.nutritionalHabits?.processedFoodFrequency || ''} onChange={e => setData({ ...data, nutritionalHabits: { ...data.nutritionalHabits, processedFoodFrequency: e.target.value } })} className="w-full bg-slate-800 border border-slate-700 rounded p-2 text-white text-sm focus:border-blue-500 outline-none transition-colors" />
                            </div>
                        </div>
                    </div>
                </Section>
            </div>
        </div>
    );
}

const TagInput = ({ label, placeholder, items, onAdd, onRemove, isEditing }: { label: string, placeholder: string, items: string[], onAdd: (val: string) => void, onRemove: (idx: number) => void, isEditing: boolean }) => {
    const [input, setInput] = useState('');

    const handleKeyDown = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            onAdd(input);
            setInput('');
        }
    };

    return (
        <div>
            <label className="text-xs text-slate-500 font-bold uppercase mb-2 block">{label}</label>
            <div className="flex flex-wrap gap-2 mb-2 min-h-[40px]">
                {items.length === 0 && !isEditing && <p className="text-sm text-slate-400 italic">Ninguna registrada.</p>}
                {items.map((item, idx) => (
                    <span key={idx} className="bg-slate-800 text-slate-200 text-sm px-3 py-1 rounded-full border border-slate-700 flex items-center gap-2">
                        {item}
                        {isEditing && (
                            <button onClick={() => onRemove(idx)} className="text-slate-400 hover:text-red-400">
                                <X size={14} />
                            </button>
                        )}
                    </span>
                ))}
            </div>
            {isEditing && (
                <div className="flex gap-2">
                    <input
                        type="text"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        onKeyDown={handleKeyDown}
                        placeholder={placeholder}
                        className="flex-1 bg-slate-800 border border-slate-700 rounded-lg p-2 text-white text-sm focus:border-blue-500 outline-none transition-colors"
                    />
                    <button
                        onClick={() => { onAdd(input); setInput(''); }}
                        className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white p-2 rounded-lg transition-colors"
                    >
                        <Plus size={20} />
                    </button>
                </div>
            )}
        </div>
    )
};