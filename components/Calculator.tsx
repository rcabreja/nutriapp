import React, { useState } from 'react';

export default function Calculator() {
  const [weight, setWeight] = useState(70);
  const [height, setHeight] = useState(170);
  const [age, setAge] = useState(30);
  const [gender, setGender] = useState('male');
  const [activity, setActivity] = useState(1.2);
  const [goal, setGoal] = useState('maintain');

  // Mifflin-St Jeor
  const bmr = (10 * weight) + (6.25 * height) - (5 * age) + (gender === 'male' ? 5 : -161);
  const tdee = Math.round(bmr * activity);
  
  let target = tdee;
  if(goal === 'lose') target -= 500;
  if(goal === 'gain') target += 300;

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <h2 className="text-3xl font-bold text-white">Calculadora Energética</h2>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
            <h3 className="text-lg font-bold text-blue-400">Datos Personales</h3>
            <div className="grid grid-cols-2 gap-4">
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Peso (kg)</label>
                    <input type="number" value={weight} onChange={e => setWeight(Number(e.target.value))} className="w-full bg-slate-800 p-2 rounded text-white mt-1 border border-slate-700" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Altura (cm)</label>
                    <input type="number" value={height} onChange={e => setHeight(Number(e.target.value))} className="w-full bg-slate-800 p-2 rounded text-white mt-1 border border-slate-700" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Edad</label>
                    <input type="number" value={age} onChange={e => setAge(Number(e.target.value))} className="w-full bg-slate-800 p-2 rounded text-white mt-1 border border-slate-700" />
                </div>
                <div>
                    <label className="text-xs font-bold text-slate-500 uppercase">Género</label>
                    <select value={gender} onChange={e => setGender(e.target.value)} className="w-full bg-slate-800 p-2 rounded text-white mt-1 border border-slate-700">
                        <option value="male">Masculino</option>
                        <option value="female">Femenino</option>
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Actividad</label>
                    <select value={activity} onChange={e => setActivity(Number(e.target.value))} className="w-full bg-slate-800 p-2 rounded text-white mt-1 border border-slate-700">
                        <option value={1.2}>Sedentario</option>
                        <option value={1.375}>Ligero (1-3 días)</option>
                        <option value={1.55}>Moderado (3-5 días)</option>
                        <option value={1.725}>Alto (6-7 días)</option>
                    </select>
                </div>
                <div className="col-span-2">
                    <label className="text-xs font-bold text-slate-500 uppercase">Objetivo</label>
                    <select value={goal} onChange={e => setGoal(e.target.value)} className="w-full bg-slate-800 p-2 rounded text-white mt-1 border border-slate-700">
                        <option value="lose">Perder Grasa (-500kcal)</option>
                        <option value="maintain">Mantenimiento</option>
                        <option value="gain">Ganar Músculo (+300kcal)</option>
                    </select>
                </div>
            </div>
        </div>

        <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-600 to-blue-900 rounded-xl p-8 text-center text-white shadow-lg">
                <p className="text-blue-200 font-medium mb-2">CALORÍAS OBJETIVO</p>
                <div className="text-6xl font-bold mb-2">{Math.round(target)}</div>
                <p className="text-sm opacity-80">kcal / día</p>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
                <h3 className="text-lg font-bold text-white mb-4">Distribución de Macros (Demo)</h3>
                <div className="space-y-3">
                    <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Proteína (2g/kg)</span>
                        <span className="text-white font-bold">{weight * 2}g</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-blue-500 h-full w-1/3"></div>
                    </div>

                    <div className="flex justify-between text-sm mt-4">
                        <span className="text-slate-400">Grasas (1g/kg)</span>
                        <span className="text-white font-bold">{weight * 1}g</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-yellow-500 h-full w-1/4"></div>
                    </div>
                    
                    <div className="flex justify-between text-sm mt-4">
                        <span className="text-slate-400">Carbohidratos (Resto)</span>
                        <span className="text-white font-bold">{Math.round((target - (weight*2*4) - (weight*9)) / 4)}g</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-green-500 h-full w-1/2"></div>
                    </div>
                </div>
            </div>
        </div>
      </div>
    </div>
  );
}