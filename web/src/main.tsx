import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

import './index.css';
import { Shell } from './components/Shell';
import { LoginPage } from './routes/Login';
import { DashboardPage } from './routes/Dashboard';
import { OrdersPage } from './routes/Orders';
import { OrderDetailPage } from './routes/OrderDetail';
import { OrderNewPage } from './routes/OrderNew';
import { KanbanPage } from './routes/Kanban';
import { CarnetLayout, CarnetWall, PourMoiPage, ComposerPage, PostDetailPage } from './routes/Carnet';
import { CustomersPage, CustomerDetailPage } from './routes/Customers';
import { CashPage } from './routes/Cash';
import { TeamPage } from './routes/Team';
import { ScanPage } from './routes/Scan';
import { TrackPage } from './routes/Track';
import { ProfilePage } from './routes/Profile';
import { useAuth } from './store/auth';

const queryClient = new QueryClient();

function Protected({ children }: { children: React.ReactNode }) {
  const token = useAuth((s) => s.token);
  if (!token) return <Navigate to="/login" replace />;
  return <Shell>{children}</Shell>;
}

function AdminOnly({ children }: { children: React.ReactNode }) {
  const user = useAuth((s) => s.user);
  if (user?.role !== 'ADMIN') return <Navigate to="/" replace />;
  return <>{children}</>;
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public */}
        <Route path="/track/:code" element={<TrackPage />} />
        <Route path="/login" element={<LoginPage />} />

        {/* Authenticated */}
        <Route path="/" element={<Protected><DashboardPage /></Protected>} />
        <Route path="/kanban" element={<Protected><KanbanPage /></Protected>} />
        <Route path="/orders" element={<Protected><OrdersPage /></Protected>} />
        <Route path="/orders/new" element={<Protected><OrderNewPage /></Protected>} />
        <Route path="/orders/:id" element={<Protected><OrderDetailPage /></Protected>} />
        <Route path="/scan" element={<Protected><ScanPage /></Protected>} />
        <Route path="/customers" element={<Protected><CustomersPage /></Protected>} />
        <Route path="/customers/:id" element={<Protected><CustomerDetailPage /></Protected>} />
        <Route path="/cash" element={<Protected><AdminOnly><CashPage /></AdminOnly></Protected>} />
        <Route path="/team" element={<Protected><AdminOnly><TeamPage /></AdminOnly></Protected>} />
        <Route path="/profile" element={<Protected><ProfilePage /></Protected>} />

        <Route path="/carnet" element={<Protected><CarnetLayout /></Protected>}>
          <Route index element={<CarnetWall />} />
          <Route path="inbox" element={<PourMoiPage />} />
          <Route path="new" element={<ComposerPage />} />
          <Route path="post/:id" element={<PostDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
