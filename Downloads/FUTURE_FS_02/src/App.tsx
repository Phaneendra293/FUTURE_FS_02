import { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './lib/auth';
import LoginPage from './components/LoginPage';
import Dashboard from './components/Dashboard';
import LeadsList from './components/LeadsList';
import LeadDetail from './components/LeadDetail';
import ContactForm from './components/ContactForm';

type Page = 'login' | 'dashboard' | 'leads' | 'lead-detail' | 'contact';

function AppContent() {
  const { user, loading } = useAuth();
  const [page, setPage] = useState<Page>('dashboard');
  const [pageData, setPageData] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!loading && !user) {
      setPage('login');
    }
  }, [user, loading]);

  const navigate = (newPage: string, data?: Record<string, string>) => {
    setPage(newPage as Page);
    setPageData(data || {});
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  switch (page) {
    case 'dashboard':
      return <Dashboard onNavigate={navigate} />;
    case 'leads':
      return <LeadsList onNavigate={navigate} initialStatus={pageData.status} />;
    case 'lead-detail':
      return <LeadDetail leadId={pageData.id} onNavigate={navigate} />;
    case 'contact':
      return <ContactForm onNavigate={navigate} />;
    default:
      return <Dashboard onNavigate={navigate} />;
  }
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
