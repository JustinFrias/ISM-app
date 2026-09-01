import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { useUser, useAuth } from '@clerk/clerk-react';
import { useAuthStore } from './store/useAuthStore';
import { AppShell } from './components/layout/AppShell';
import { isClerkConfigured, resolveUserRole } from './services/clerk';

// Pages
import { LoginPage } from './pages/auth/LoginPage';
import { SignUpPage } from './pages/auth/SignUpPage';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { StaffDashboard } from './pages/staff/StaffDashboard';
import { MonthlyProfitReportPage } from './pages/admin/MonthlyProfitReportPage';
import { ReceivablesPayablesPage } from './pages/admin/ReceivablesPayablesPage';
import { ExpensesManagementPage } from './pages/admin/ExpensesManagementPage';
import { ActivityLogsPage } from './pages/admin/ActivityLogsPage';
import { AdminAccountsPage, StaffAccountsPage } from './pages/admin/UserManagementPage';
import { InventoryOverviewPage } from './pages/inventory/InventoryOverviewPage';
import { StocksMonitoringPage } from './pages/inventory/StocksMonitoringPage';
import { StockInOutPage } from './pages/inventory/StockInOutPage';
import { CriticalStockAlertsPage } from './pages/inventory/CriticalStockAlertsPage';
import { ExpiredProductsPage } from './pages/inventory/ExpiredProductsPage';
import { CategoriesPage } from './pages/inventory/CategoriesPage';
import { PrintInventoryReportPage } from './pages/inventory/PrintInventoryReportPage';
import { AddDeliveryPage } from './pages/delivery/AddDeliveryPage';
import { DeliveryReportsPage } from './pages/delivery/DeliveryReportsPage';
import { TotalProductsDeliveryPage } from './pages/delivery/TotalProductsDeliveryPage';
import { ReceivedProductsPage } from './pages/delivery/ReceivedProductsPage';
import { InvoicePrintPage } from './pages/delivery/InvoicePrintPage';

// Synchronizes Clerk user to zustand auth store
const ClerkAuthSync: React.FC = () => {
  const { user, isLoaded, isSignedIn } = useUser();
  const setClerkUser = useAuthStore(s => s.setClerkUser);

  useEffect(() => {
    if (!isLoaded) return;

    if (isSignedIn && user) {
      const role = resolveUserRole(user);
      setClerkUser({
        id: user.id,
        username: user.username || user.primaryEmailAddress?.emailAddress?.split('@')[0] || 'user',
        fullName: user.fullName || user.firstName || 'Authorized User',
        email: user.primaryEmailAddress?.emailAddress || '',
        role: role,
        isActive: true,
        createdAt: user.createdAt ? new Date(user.createdAt).toISOString() : new Date().toISOString(),
        lastLogin: new Date().toISOString(),
      });
    }
  }, [user, isLoaded, isSignedIn, setClerkUser]);

  return null;
};

// Route guards
const RequireAuth: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  return isAuthenticated ? <>{children}</> : <Navigate to="/login" replace />;
};

const RequireAdmin: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const currentUser = useAuthStore(s => s.currentUser);
  if (!currentUser) return <Navigate to="/login" replace />;
  if (currentUser.role !== 'ADMIN') return <Navigate to="/staff" replace />;
  return <>{children}</>;
};

const AuthedRoute: React.FC<{ element: React.ReactNode; adminOnly?: boolean }> = ({ element, adminOnly }) => (
  <RequireAuth>
    {adminOnly ? <RequireAdmin>{element}</RequireAdmin> : element}
  </RequireAuth>
);

function App() {
  const isAuthenticated = useAuthStore(s => s.isAuthenticated);
  const currentUser = useAuthStore(s => s.currentUser);

  return (
    <BrowserRouter>
      {isClerkConfigured && <ClerkAuthSync />}
      <Routes>
        {/* Public */}
        <Route path="/login/*" element={isAuthenticated
          ? <Navigate to={currentUser?.role === 'ADMIN' ? '/admin' : '/staff'} replace />
          : <LoginPage />
        } />
        <Route path="/sign-up/*" element={isAuthenticated
          ? <Navigate to={currentUser?.role === 'ADMIN' ? '/admin' : '/staff'} replace />
          : <SignUpPage />
        } />

        {/* Protected — with AppShell */}
        <Route path="/*" element={
          <RequireAuth>
            <AppShell>
              <Routes>
                <Route path="/" element={<Navigate to={currentUser?.role === 'ADMIN' ? '/admin' : '/staff'} replace />} />

                {/* Dashboards */}
                <Route path="/admin" element={<AuthedRoute element={<AdminDashboard />} adminOnly />} />
                <Route path="/staff" element={<AuthedRoute element={<StaffDashboard />} />} />

                {/* Finance — Admin only */}
                <Route path="/profit" element={<AuthedRoute element={<MonthlyProfitReportPage />} adminOnly />} />
                <Route path="/ledger" element={<AuthedRoute element={<ReceivablesPayablesPage />} adminOnly />} />
                <Route path="/expenses" element={<AuthedRoute element={<ExpensesManagementPage />} adminOnly />} />
                <Route path="/activity" element={<AuthedRoute element={<ActivityLogsPage />} adminOnly />} />
                <Route path="/admin-accounts" element={<AuthedRoute element={<AdminAccountsPage />} adminOnly />} />
                <Route path="/staff-accounts" element={<AuthedRoute element={<StaffAccountsPage />} adminOnly />} />

                {/* Inventory */}
                <Route path="/inventory" element={<AuthedRoute element={<InventoryOverviewPage />} />} />
                <Route path="/stocks" element={<AuthedRoute element={<StocksMonitoringPage />} />} />
                <Route path="/stock-io" element={<AuthedRoute element={<StockInOutPage />} />} />
                <Route path="/alerts" element={<AuthedRoute element={<CriticalStockAlertsPage />} />} />
                <Route path="/expired" element={<AuthedRoute element={<ExpiredProductsPage />} />} />
                <Route path="/categories" element={<AuthedRoute element={<CategoriesPage />} adminOnly />} />
                <Route path="/print-inventory" element={<AuthedRoute element={<PrintInventoryReportPage />} />} />

                {/* Deliveries */}
                <Route path="/deliveries" element={<AuthedRoute element={<DeliveryReportsPage />} />} />
                <Route path="/add-delivery" element={<AuthedRoute element={<AddDeliveryPage />} />} />
                <Route path="/total-delivery" element={<AuthedRoute element={<TotalProductsDeliveryPage />} />} />
                <Route path="/received" element={<AuthedRoute element={<ReceivedProductsPage />} />} />
                <Route path="/invoice" element={<AuthedRoute element={<InvoicePrintPage />} />} />

                {/* Fallback */}
                <Route path="*" element={<Navigate to="/" replace />} />
              </Routes>
            </AppShell>
          </RequireAuth>
        } />

        {/* Root redirect */}
        <Route path="/" element={<Navigate to={isAuthenticated ? (currentUser?.role === 'ADMIN' ? '/admin' : '/staff') : '/login'} replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
