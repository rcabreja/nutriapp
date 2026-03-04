import React, { useState } from 'react';
import { HashRouter as Router, Routes, Route, Navigate, useLocation, Link } from 'react-router-dom';
import { NutriProvider, useNutri } from './context';
import { LayoutDashboard, Users, LogOut, Menu, UserCircle, X, Palette } from 'lucide-react';
import Dashboard from './components/Dashboard';
import PatientsList from './components/PatientsList';
import PatientDetail from './components/PatientDetail';

import ThemeSettings from './components/ThemeSettings';
import Login from './components/Login';

const Sidebar = ({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) => {
  const { currentUser, logout } = useNutri();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path ? 'bg-[#cbd9ce] text-[#3c584b]' : 'text-[#3c584b] hover:bg-[#fdf7e7] hover:text-[#3c584b]';

  const closeMenu = () => setIsOpen(false);

  return (
    <>
      {/* Mobile Overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-[#fdf7e7] z-40 md:hidden backdrop-blur-sm"
          onClick={closeMenu}
        />
      )}

      {/* Sidebar Container */}
      <div className={`
        fixed top-0 left-0 h-full w-64 bg-[#fdf7e7] border-r border-[#cbd9ce] flex flex-col z-50 transition-transform duration-300 ease-in-out
        ${isOpen ? 'translate-x-0' : '-translate-x-full'} md:translate-x-0
      `}>
        <div className="p-6 flex justify-between items-center">
          <div>
            <h1 className="text-xl font-bold text-[#3c584b] flex items-center gap-2">
              <span className="bg-[#cbd9ce] px-2 py-1 rounded text-sm">N</span> NutriClinical
            </h1>
            <p className="text-xs text-[#3c584b] mt-1 uppercase tracking-wider font-semibold ml-8">Pro System</p>
          </div>
          {/* Close button for mobile */}
          <button onClick={closeMenu} className="md:hidden text-[#3c584b] hover:text-[#3c584b]">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 px-4 space-y-2 overflow-y-auto">
          {currentUser?.role === 'admin' && (
            <>
              <Link to="/dashboard" onClick={closeMenu} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/dashboard')}`}>
                <LayoutDashboard size={20} />
                <span>Dashboard</span>
              </Link>
              <Link to="/patients" onClick={closeMenu} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/patients')}`}>
                <Users size={20} />
                <span>Pacientes</span>
              </Link>
            </>
          )}

          {currentUser?.role === 'patient' && (
            <Link to={`/patients/${currentUser.patientId}`} onClick={closeMenu} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive(`/patients/${currentUser.patientId}`)}`}>
              <UserCircle size={20} />
              <span>Mi Perfil</span>
            </Link>
          )}



          {currentUser?.role === 'admin' && (
            <Link to="/settings" onClick={closeMenu} className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${isActive('/settings')}`}>
              <Palette size={20} />
              <span>Diseño</span>
            </Link>
          )}
        </nav>

        <div className="p-4 border-t border-[#cbd9ce]">
          <div className="flex items-center gap-3 px-4 py-2 mb-2">
            <div className="w-8 h-8 rounded-full bg-[#cbd9ce] flex items-center justify-center text-[#3c584b] font-bold shrink-0">
              {currentUser?.name.charAt(0)}
            </div>
            <div className="overflow-hidden">
              <p className="text-sm font-medium text-[#3c584b] truncate">{currentUser?.name}</p>
              <p className="text-xs text-[#3c584b] capitalize">{currentUser?.role}</p>
            </div>
          </div>
          <button onClick={logout} className="flex items-center gap-2 w-full px-4 py-2 text-[#3c584b] hover:bg-[#cbd9ce] rounded-lg transition-colors text-sm">
            <LogOut size={16} />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>
    </>
  );
};

const PrivateRoute = ({ children, adminOnly = false }: { children?: React.ReactNode, adminOnly?: boolean }) => {
  const { currentUser } = useNutri();

  if (!currentUser) return <Navigate to="/" />;
  if (adminOnly && currentUser.role !== 'admin') return <Navigate to={`/patients/${currentUser.patientId}`} />;

  return <>{children}</>;
};

const MainLayout = ({ children }: { children?: React.ReactNode }) => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="min-h-screen bg-[#fdf7e7] text-[#3c584b] font-[family-name:var(--font-family)]">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />

      {/* Mobile Header for Menu Toggle */}
      <div className="md:hidden bg-[#fdf7e7] border-b border-[#cbd9ce] p-4 flex items-center justify-between sticky top-0 z-30">
        <h1 className="text-lg font-bold text-[#3c584b] flex items-center gap-2">
          <span className="bg-[#cbd9ce] px-2 py-1 rounded text-xs">N</span> NutriClinical
        </h1>
        <button onClick={() => setIsSidebarOpen(true)} className="text-[#3c584b] hover:text-[#3c584b]">
          <Menu size={24} />
        </button>
      </div>

      <main className="p-4 md:p-8 md:pl-72 transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

const AppContent = () => {
  const { currentUser } = useNutri();

  return (
    <Routes>
      <Route path="/" element={!currentUser ? <Login /> : <Navigate to={currentUser.role === 'admin' ? "/dashboard" : `/patients/${currentUser.patientId}`} />} />
      <Route path="/dashboard" element={<PrivateRoute><MainLayout><Dashboard /></MainLayout></PrivateRoute>} />
      <Route path="/patients" element={<PrivateRoute><MainLayout><PatientsList /></MainLayout></PrivateRoute>} />
      <Route path="/patients/:id" element={<PrivateRoute><MainLayout><PatientDetail /></MainLayout></PrivateRoute>} />

      <Route path="/settings" element={<PrivateRoute adminOnly><MainLayout><ThemeSettings /></MainLayout></PrivateRoute>} />
    </Routes>
  );
};

export default function App() {
  return (
    <NutriProvider>
      <Router>
        <AppContent />
      </Router>
    </NutriProvider>
  );
}