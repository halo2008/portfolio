import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { AuthProvider } from './core/auth/AuthContext';
import { AdminPage } from './pages/Admin';
import './App.css';

// Tymczasowy komponent Homepage do testów nawigacji
function HomePage() {
  return (
    <div className="min-h-screen bg-gray-950 flex flex-col items-center justify-center text-white">
      <h1 className="text-4xl font-bold mb-4">Portfolio Konrad Sędkowski</h1>
      <p className="text-gray-400 mb-8">Witaj na stronie głównej.</p>
      <Link
        to="/admin"
        className="px-6 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg font-medium transition-colors"
      >
        Przejdź do Panelu Admina
      </Link>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/admin" element={<AdminPage />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
