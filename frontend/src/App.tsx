import { useEffect, useMemo, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Link, Navigate } from 'react-router-dom';
import Dashboard from './components/Dashboard';
import ChatbotWidget from './components/ChatbotWidget';
import ProjectList from './components/ProjectList';
import ProjectDetail from './components/ProjectDetail';
import './App.css';

type UserProfile = {
  name: string;
  email: string;
  role: string;
};

function App() {
  const [dashboardChatContext, setDashboardChatContext] = useState<{
    upcomingTasks: import('./types').TaskInstance[];
    projects: import('./types').Project[];
  }>({
    upcomingTasks: [],
    projects: []
  });
  const demoUser = useMemo<UserProfile>(() => ({
    name: 'Aarav Sharma',
    email: 'aarav.sharma@company.com',
    role: 'Compliance Manager'
  }), []);

  const [isAuthenticated, setIsAuthenticated] = useState(() => localStorage.getItem('compliance-tracker-auth') === 'true');
  const [credentials, setCredentials] = useState({
    email: demoUser.email,
    password: 'password123'
  });
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    if (isAuthenticated) {
      localStorage.setItem('compliance-tracker-auth', 'true');
    } else {
      localStorage.removeItem('compliance-tracker-auth');
    }
  }, [isAuthenticated]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();

    if (
      credentials.email.trim().toLowerCase() === demoUser.email.toLowerCase() &&
      credentials.password === 'password123'
    ) {
      setIsAuthenticated(true);
      setLoginError('');
      return;
    }

    setLoginError('Use the demo credentials shown below to access the tracker.');
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setCredentials({
      email: demoUser.email,
      password: 'password123'
    });
  };

  if (!isAuthenticated) {
    return (
      <div className="auth-shell">
        <div className="auth-card">
          <div className="auth-brand">
            <span className="auth-icon">📊</span>
            <div>
              <h1>Compliance Tracker</h1>
              <p>Log in to view projects, tasks, and compliance evidence schedules.</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="auth-form">
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                id="email"
                type="email"
                value={credentials.email}
                onChange={(e) => setCredentials({ ...credentials, email: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({ ...credentials, password: e.target.value })}
                required
              />
            </div>

            {loginError && <div className="auth-error">{loginError}</div>}

            <button type="submit" className="btn-primary auth-submit">
              Log In
            </button>
          </form>

          <div className="demo-credentials">
            <strong>Demo login</strong>
            <span>Email: {demoUser.email}</span>
            <span>Password: password123</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <Router>
      <div className="app">
        <nav className="navbar">
          <div className="nav-container">
            <div className="nav-left">
              <Link to="/" className="brand-link">
                <h1 className="nav-title">📊 Compliance Tracker</h1>
              </Link>
              <div className="nav-links">
                <Link to="/" className="nav-link">Dashboard</Link>
                <Link to="/projects" className="nav-link">Projects</Link>
              </div>
            </div>

            <div className="nav-right">
              <div className="profile-chip">
                <div className="profile-avatar">{demoUser.name.charAt(0)}</div>
                <div className="profile-meta">
                  <strong>{demoUser.name}</strong>
                  <span>{demoUser.role}</span>
                </div>
              </div>
              <button onClick={handleLogout} className="btn-secondary nav-action-btn">
                Logout
              </button>
            </div>
          </div>
        </nav>

        <main className="main-content">
          <Routes>
            <Route
              path="/"
              element={<Dashboard onChatContextChange={setDashboardChatContext} />}
            />
            <Route path="/projects" element={<ProjectList />} />
            <Route path="/projects/:id" element={<ProjectDetail />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <ChatbotWidget
          upcomingTasks={dashboardChatContext.upcomingTasks}
          projects={dashboardChatContext.projects}
        />
      </div>
    </Router>
  );
}

export default App;

// Made with Bob
