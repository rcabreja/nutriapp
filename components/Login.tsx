import React, { useState } from 'react';
import { useNutri } from '../context';
import { Lock, Mail } from 'lucide-react';

export default function Login() {
  const { login } = useNutri();
  const [email, setEmail] = useState('admin@nutri.com');
  const [password, setPassword] = useState('admin123');
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!login(email, password)) {
      setError('Credenciales inválidas');
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-8 w-full max-w-md shadow-2xl">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">NutriClinical</h1>
          <p className="text-slate-400">Pro System Login</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-3 text-slate-500" size={20} />
              <input 
                type="email" 
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="correo@ejemplo.com"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-300 mb-2">Contraseña</label>
            <div className="relative">
              <Lock className="absolute left-3 top-3 text-slate-500" size={20} />
              <input 
                type="password" 
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full bg-slate-800 border border-slate-700 rounded-lg py-3 pl-10 pr-4 text-white focus:outline-none focus:border-blue-500 transition-colors"
                placeholder="••••••••"
              />
            </div>
          </div>

          {error && <p className="text-red-400 text-sm text-center">{error}</p>}

          <button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-lg transition-colors">
            Iniciar Sesión
          </button>
        </form>

        <div className="mt-8 p-4 bg-slate-800/50 rounded-lg text-xs text-slate-400">
          <p className="font-bold mb-2">Credenciales Demo:</p>
          <div className="grid grid-cols-2 gap-2">
            <div>Admin: <br/><span className="text-slate-300">admin@nutri.com</span> / admin123</div>
            <div>Paciente: <br/><span className="text-slate-300">ana@paciente.com</span> / ana123</div>
          </div>
        </div>
      </div>
    </div>
  );
}