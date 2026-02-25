import { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider, CssBaseline } from '@mui/material';
import { AuthProvider } from './contexts/AuthContext';
import { ProtectedRoute } from './components/ProtectedRoute';
import getTheme from './theme/theme';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import PosBillingPage from './pages/pos/PosBillingPage';
import Products from './pages/Products';
import Customers from './pages/Customers';
import Purchases from './pages/Purchases';
import Stock from './pages/Stock';
import Ledger from './pages/Ledger';

function AppContent() {
  const [themeMode, setThemeMode] = useState(() => localStorage.getItem('theme') || 'light');
  const theme = useMemo(() => getTheme(themeMode), [themeMode]);

  const toggleTheme = () => {
    const next = themeMode === 'dark' ? 'light' : 'dark';
    setThemeMode(next);
    localStorage.setItem('theme', next);
    document.documentElement.classList.toggle('dark', next === 'dark');
  };

  useEffect(() => {
    document.documentElement.classList.toggle('dark', themeMode === 'dark');
  }, [themeMode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <MainLayout themeMode={themeMode} onThemeToggle={toggleTheme} />
              </ProtectedRoute>
            }
          >
            <Route index element={<Dashboard />} />
            <Route path="pos" element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'CASHIER']}><PosBillingPage /></ProtectedRoute>} />
            <Route path="products" element={<Products />} />
            <Route path="customers" element={<Customers />} />
            <Route path="purchases" element={<ProtectedRoute roles={['ADMIN', 'MANAGER']}><Purchases /></ProtectedRoute>} />
            <Route path="stock" element={<Stock />} />
            <Route path="ledger" element={<ProtectedRoute roles={['ADMIN', 'MANAGER', 'CASHIER']}><Ledger /></ProtectedRoute>} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </BrowserRouter>
    </ThemeProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}
