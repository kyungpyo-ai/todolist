import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Layout from './components/Layout';
import LoginPage from './pages/LoginPage';
import SignupPage from './pages/SignupPage';
import TodoListPage from './pages/TodoListPage';
import CategoryPage from './pages/CategoryPage';
import CalendarPage from './pages/CalendarPage';
import ProfilePage from './pages/ProfilePage';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path="/signup" element={<SignupPage />} />
          <Route
            path="/todos"
            element={
              <Layout>
                <TodoListPage />
              </Layout>
            }
          />
          <Route
            path="/categories"
            element={
              <Layout>
                <CategoryPage />
              </Layout>
            }
          />
          <Route
            path="/calendar"
            element={
              <Layout>
                <CalendarPage />
              </Layout>
            }
          />
          <Route
            path="/profile"
            element={
              <Layout>
                <ProfilePage />
              </Layout>
            }
          />
          <Route path="/" element={<Navigate to="/todos" replace />} />
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  );
}
