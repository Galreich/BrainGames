import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import Header from './components/Header';
import Home from './pages/Home';
import HebrewWordle from './pages/HebrewWordle';
import EnglishWordle from './pages/EnglishWordle';
import MathGame from './pages/MathGame';
import Login from './pages/Login';
import AdminPage from './pages/AdminPage';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }
  static getDerivedStateFromError(error) {
    return { error };
  }
  render() {
    if (this.state.error) {
      return (
        <div style={{ padding: '40px', fontFamily: 'monospace', background: '#1a1a2e', color: '#ff7675', minHeight: '100vh' }}>
          <h1 style={{ color: '#ff7675', marginBottom: '20px' }}>❌ שגיאה בטעינה</h1>
          <pre style={{ background: '#0f0f1a', padding: '20px', borderRadius: '8px', whiteSpace: 'pre-wrap', color: '#fab1a0' }}>
            {this.state.error.toString()}
            {'\n\n'}
            {this.state.error.stack}
          </pre>
        </div>
      );
    }
    return this.props.children;
  }
}

const App = () => {
  return (
    <ErrorBoundary>
      <AuthProvider>
        <ProgressProvider>
          <Router>
            <div style={{ minHeight: '100vh', display: 'flex', flexDirection: 'column' }}>
              <Header />
              <main style={{ flex: 1 }}>
                <Routes>
                  <Route path="/" element={<Home />} />
                  <Route path="/hebrew-wordle" element={<HebrewWordle />} />
                  <Route path="/english-wordle" element={<EnglishWordle />} />
                  <Route path="/math" element={<MathGame />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/admin" element={<AdminPage />} />
                </Routes>
              </main>
            </div>
          </Router>
        </ProgressProvider>
      </AuthProvider>
    </ErrorBoundary>
  );
};

export default App;
