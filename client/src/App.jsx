import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider, ProgressProvider } from './context';
import { Header } from './components';
import {
  Home,
  HebrewWordle,
  EnglishWordle,
  MathGame,
  Login,
  AdminPage
} from './pages';

import './App.css';
import i18n from './i18n';
import { Emojis } from './utils/Emojis';

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
          <h1>{Emojis.CloseCross} {i18n.t('Error_Loading')}</h1>
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
