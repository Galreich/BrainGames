import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { ProgressProvider } from './context/ProgressContext';
import Header from './components/Header';
import {
  Home,
  HebrewWordle,
  EnglishWordle,
  MathGame,
  Login,
  AdminPage
} from './pages';

import './App.css';

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
        <div className="error-boundary-fallback">
          <h1>❌ שגיאה בטעינה</h1>
          <pre>
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
            <div className="app-container">
              <Header />
              <main className="app-main">
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
