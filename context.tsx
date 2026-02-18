import React, { createContext, useContext, useEffect, useState } from 'react';
import { AppState, Patient, User, Note, Anthropometry, ClinicalHistory, Plan, LabResult, Adherence, ThemeConfig } from './types';
import { format } from 'date-fns';

// Seed Data
const SEED_USERS: User[] = [
  { id: 'u1', email: 'admin@nutri.com', password: 'admin123', name: 'Dr. Nutri', role: 'admin' },
  { id: 'u2', email: 'ana@paciente.com', password: 'ana123', name: 'Ana García López', role: 'patient', patientId: 'p1' },
  { id: 'u3', email: 'carlos@paciente.com', password: 'carlos123', name: 'Carlos Rodríguez', role: 'patient', patientId: 'p2' },
];

const SEED_PATIENTS: Patient[] = [
  {
    id: 'p1',
    name: 'Ana García López',
    email: 'ana@paciente.com',
    phone: '555-0199',
    dob: '1989-05-15',
    gender: 'F',
    occupation: 'Arquitecta',
    avatarUrl: 'https://ui-avatars.com/api/?name=Ana+Garcia&background=cbd5e1&color=0f172a',
    notes: [
        { id: 'n1', date: '2023-08-31', objective: 'Evaluación inicial', observations: 'Paciente motivada. Refiere inflamación abdominal frecuente.', images: ['https://picsum.photos/200/200?random=1'] }
    ],
    lifestyle: {
        activity: { regular: true, details: 'Caminata 3x semana, 30 min' },
        sleep: { hours: '6', stress: 'Alto (laboral)' },
        diet: { meals: 'Desayuna 8am, Come 3pm, Cena 9pm', water: '1 litro', alcohol: true, tobacco: false },
        preferences: { likes: 'Pollo, Verduras, Frutas', dislikes: 'Hígado, Brócoli', budget: 'Medio', access: 'Supermercado', eatingOut: '3 veces por semana' }
    },
    anthropometry: [
        { 
            id: 'm1', date: '2023-09-01', weight: 75.5, height: 165, imc: 27.7, 
            circumference: { waist: 88, hip: 105, abdomen: 92, chest: 98, armR: 30, armL: 30, thigh: 60, calf: 38 },
            folds: { tricipital: 20, bicipital: 10, subscapular: 18, suprailiac: 22, abdominal: 25, quadriceps: 15 },
            notes: 'Inicio de tratamiento.'
        }
    ],
    clinical: {
        background: { motive: 'Bajar de peso', medications: 'Omeprazol ocasional', familyHistory: 'Diabetes, Hipertensión' },
        recall24h: { breakfast: 'Café con leche y pan', snackAM: '-', lunch: 'Tacos de guisado', snackPM: 'Galletas', dinner: 'Cereal con leche' },
        frequencies: { 'Verduras': 'Ocasional', 'Frutas': 'Diario', 'Embutidos': 'Semanal' }
    },
    plans: [
        {
            id: 'pl1', name: 'Plan Anti-Inflamatorio', kcalTarget: 1600, active: true, createdAt: '2024-01-01',
            sections: [
                { title: 'Desayuno', options: [{ id: 'd1', name: 'Opción 1', description: '2 Huevos con espinacas + 1 pan' }, { id: 'd2', name: 'Opción 2', description: 'Avena con almendras y manzana' }] },
                { title: 'Almuerzo', options: [{ id: 'a1', name: 'Opción 1', description: '120g Pollo asado + Ensalada + Arroz' }] },
                { title: 'Cena', options: [{ id: 'c1', name: 'Opción 1', description: 'Atún con galletas' }] }
            ],
            supplements: 'Omega 3 (1g) con el desayuno.',
            avoid: 'Refrescos, Azúcar añadida.'
        }
    ],
    adherence: [],
    labs: [
        {
            id: 'l1', name: 'Perfil Bioquímico', date: '2026-01-20',
            attachments: ['https://picsum.photos/100/100?random=5'],
            markers: [
              { name: 'Glucosa', value: '95', unit: 'mg/dL', flag: 'normal' }, 
              { name: 'Colesterol', value: '220', unit: 'mg/dL', flag: 'high' },
              { name: 'Triglicéridos', value: '150', unit: 'mg/dL', flag: 'normal' },
              { name: 'Hemoglobina', value: '14', unit: 'g/dL', flag: 'normal' },
              { name: 'Hematocrito', value: '42', unit: '%', flag: 'normal' }
            ]
        }
    ]
  },
  {
    id: 'p2',
    name: 'Carlos Rodríguez',
    email: 'carlos@paciente.com',
    phone: '555-1234',
    dob: '1985-02-20',
    gender: 'M',
    occupation: 'Ingeniero',
    avatarUrl: 'https://ui-avatars.com/api/?name=Carlos+Rodriguez&background=cbd5e1&color=0f172a',
    notes: [],
    lifestyle: {
        activity: { regular: false, details: '' },
        sleep: { hours: '7', stress: 'Medio' },
        diet: { meals: 'Desordenado', water: '2 litros', alcohol: true, tobacco: true },
        preferences: { likes: 'Carnes rojas', dislikes: 'Pescado', budget: 'Alto', access: 'Restaurantes', eatingOut: 'Diario' }
    },
    anthropometry: [],
    clinical: {
        background: { motive: 'Mejorar salud', medications: '', familyHistory: '' },
        recall24h: { breakfast: '', snackAM: '', lunch: '', snackPM: '', dinner: '' },
        frequencies: {}
    },
    plans: [],
    adherence: [],
    labs: []
  }
];

const DEFAULT_THEME: ThemeConfig = {
    appBg: '#020617', // slate-950
    cardBg: '#0f172a', // slate-900
    textColor: '#f1f5f9', // slate-100
    primaryColor: '#2563eb', // blue-600
    fontFamily: "'Inter', sans-serif"
};

interface NutriContextType extends AppState {
  login: (email: string, pass: string) => boolean;
  logout: () => void;
  addPatient: (p: Patient) => void;
  updatePatient: (id: string, data: Partial<Patient>) => void;
  deletePatient: (id: string) => void;
  updateTheme: (t: ThemeConfig) => void;
  importData: (data: AppState) => boolean;
}

const NutriContext = createContext<NutriContextType | undefined>(undefined);

export const NutriProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [theme, setTheme] = useState<ThemeConfig>(DEFAULT_THEME);

  // Load from LS
  useEffect(() => {
    const lsUsers = localStorage.getItem('nutri_users');
    const lsPatients = localStorage.getItem('nutri_patients');
    const lsSession = localStorage.getItem('nutri_session');
    const lsTheme = localStorage.getItem('nutri_theme');

    if (lsUsers) setUsers(JSON.parse(lsUsers));
    else {
      setUsers(SEED_USERS);
      localStorage.setItem('nutri_users', JSON.stringify(SEED_USERS));
    }

    if (lsPatients) setPatients(JSON.parse(lsPatients));
    else {
      setPatients(SEED_PATIENTS);
      localStorage.setItem('nutri_patients', JSON.stringify(SEED_PATIENTS));
    }

    if (lsSession) setCurrentUser(JSON.parse(lsSession));

    if (lsTheme) setTheme(JSON.parse(lsTheme));
  }, []);

  // Apply Theme Effect
  useEffect(() => {
    const root = document.documentElement;
    root.style.setProperty('--app-bg', theme.appBg);
    root.style.setProperty('--card-bg', theme.cardBg);
    root.style.setProperty('--text-main', theme.textColor);
    root.style.setProperty('--primary', theme.primaryColor);
    root.style.setProperty('--font-family', theme.fontFamily);
  }, [theme]);

  const savePatients = (newPatients: Patient[]) => {
    setPatients(newPatients);
    localStorage.setItem('nutri_patients', JSON.stringify(newPatients));
  };

  const login = (email: string, pass: string) => {
    const user = users.find(u => u.email === email && u.password === pass);
    if (user) {
      setCurrentUser(user);
      localStorage.setItem('nutri_session', JSON.stringify(user));
      return true;
    }
    return false;
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('nutri_session');
  };

  const addPatient = (p: Patient) => {
    const updated = [...patients, p];
    savePatients(updated);
  };

  const updatePatient = (id: string, data: Partial<Patient>) => {
    const updated = patients.map(p => (p.id === id ? { ...p, ...data } : p));
    savePatients(updated);
  };

  const deletePatient = (id: string) => {
    const updated = patients.filter(p => p.id !== id);
    savePatients(updated);
  };

  const updateTheme = (newTheme: ThemeConfig) => {
      setTheme(newTheme);
      localStorage.setItem('nutri_theme', JSON.stringify(newTheme));
  };

  const refresh = () => {
      // Force re-read if needed, mainly mainly handled by state
  }

  const importData = (data: AppState) => {
    try {
        if (!data.users || !data.patients) return false;

        setUsers(data.users);
        localStorage.setItem('nutri_users', JSON.stringify(data.users));

        setPatients(data.patients);
        localStorage.setItem('nutri_patients', JSON.stringify(data.patients));

        if (data.theme) {
            setTheme(data.theme);
            localStorage.setItem('nutri_theme', JSON.stringify(data.theme));
        }

        return true;
    } catch (e) {
        console.error("Import failed", e);
        return false;
    }
  };

  return (
    <NutriContext.Provider value={{ currentUser, users, patients, theme, login, logout, addPatient, updatePatient, deletePatient, updateTheme, refresh, importData }}>
      {children}
    </NutriContext.Provider>
  );
};

export const useNutri = () => {
  const context = useContext(NutriContext);
  if (!context) throw new Error('useNutri must be used within NutriProvider');
  return context;
};