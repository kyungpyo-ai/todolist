import { Navigate } from 'react-router-dom';
import { useAuthStore } from '../stores/authStore';
import Header from './Header';
import IconNav from './IconNav';
import './layout.css';

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated());

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="app-layout">
      <Header />
      <div className="app-body">
        <IconNav />
        <main className="app-main">{children}</main>
      </div>
    </div>
  );
}
