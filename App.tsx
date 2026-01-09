import React from 'react';
import { HashRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom';
// { Bot } removido

// Contexts
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { AppDataProvider, useAppData } from './contexts/AppDataContext';
import { NotificationsProvider } from './contexts/NotificationsContext';

// Hooks
import { usePermissions, Permissions } from './hooks/usePermissions';
import { Role } from './types';

// Screens
import LoginScreen from './screens/LoginScreen';
import DashboardScreen from './screens/DashboardScreen';
import ReportsScreen from './screens/ReportsScreen';
import ProjectTimelineScreen from './screens/ProjectTimelineScreen';
import ProjectDetailScreen from './screens/ProjectDetailScreen';
import NewProjectScreen from './screens/NewProjectScreen';
import LeadsScreen from './screens/LeadsScreen';
import TeamScreen from './screens/TeamScreen';
import SettingsScreen from './screens/SettingsScreen';

// Components
// AIAssistant removido

/**
 * Componente de rota protegida
 * Redireciona para login se não autenticado
 */
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
};

/**
 * Componente de rota protegida por role
 * Redireciona para dashboard se não tiver permissão
 */
const RoleProtectedRoute: React.FC<{
  children: React.ReactNode;
  permission: keyof Permissions;
}> = ({ children, permission }) => {
  const { isAuthenticated } = useAuth();
  const permissions = usePermissions();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (!permissions[permission]) {
    return <Navigate to="/" replace />;
  }

  return <>{children}</>;
};

/**
 * Wrapper para o Assistente de IA com contexto do projeto atual
 */
// Wrapper de IA removido

/**
 * Componente interno do App que usa os contextos
 */
const AppContent: React.FC = () => {
  const { isAuthenticated } = useAuth();
  const { users } = useAppData();
  const permissions = usePermissions();
  const {
    organization,
    projects,
    leads,
    addProject,
    updateProject,
    addLead,
    updateLead
  } = useAppData();

  // State de IA removido

  return (
    <>
      <Routes>
        {/* Rota pública */}
        <Route path="/login" element={
          isAuthenticated ? <Navigate to="/" replace /> : <LoginScreen />
        } />

        {/* Rotas protegidas */}
        <Route path="/" element={
          <ProtectedRoute>
            <DashboardScreen projects={projects} leads={leads} onUpdateProject={updateProject} />
          </ProtectedRoute>
        } />

        <Route path="/projects" element={
          <ProtectedRoute>
            <ProjectTimelineScreen
              projects={projects}
              onSelect={(id) => window.location.hash = `#/projects/${id}`}
            />
          </ProtectedRoute>
        } />

        <Route path="/projects/new" element={
          <ProtectedRoute>
            <NewProjectScreen
              leads={leads}
              users={users}
              onCreate={addProject}
            />
          </ProtectedRoute>
        } />

        <Route path="/projects/:id" element={
          <ProtectedRoute>
            <ProjectDetailScreen
              projects={projects}
              onUpdateProject={updateProject}
            />
          </ProtectedRoute>
        } />

        <Route path="/leads" element={
          <RoleProtectedRoute permission="canViewLeads">
            <LeadsScreen
              leads={leads}
              onAdd={addLead}
              onUpdate={updateLead}
            />
          </RoleProtectedRoute>
        } />

        <Route path="/team" element={
          <RoleProtectedRoute permission="canViewTeam">
            <TeamScreen users={users} />
          </RoleProtectedRoute>
        } />

        <Route path="/settings" element={
          <RoleProtectedRoute permission="canViewSettings">
            <SettingsScreen org={organization} />
          </RoleProtectedRoute>
        } />

        <Route path="/reports" element={
          <RoleProtectedRoute permission="canViewFinance">
            <ReportsScreen />
          </RoleProtectedRoute>
        } />
      </Routes>

      {/* Assistente IA removido per request */}
    </>
  );
};

/**
 * Componente principal da aplicação
 * ShipeCode OS - Sistema Operacional para Agências Digitais
 */
const App: React.FC = () => {
  return (
    <HashRouter>
      <AuthProvider>
        <AppDataProvider>
          <NotificationsProvider>
            <AppContent />
          </NotificationsProvider>
        </AppDataProvider>
      </AuthProvider>
    </HashRouter>
  );
};


export default App;