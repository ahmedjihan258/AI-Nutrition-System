import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Login } from './pages/Login';
import { Register } from './pages/Register';
import { Dashboard } from './pages/Dashboard';
import { FoodLogging } from './pages/FoodLogging';
import { FoodImageAnalysis } from './pages/FoodImageAnalysis';
import { MealTextAnalysis } from './pages/MealTextAnalysis';
import { Recommendations } from './pages/Recommendations';
import { Profile } from './pages/Profile';
import './App.css';

// Route guard to check user session
const ProtectedLayout = ({ children }) => {
  const { user } = useAuth();

  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col md:flex-row bg-[#050510]">
      {/* Sidebar Navigation */}
      <Navbar />

      {/* Main Panel Content */}
      <main className="flex-1 px-6 py-8 md:pl-72 max-w-7xl mx-auto w-full transition-all duration-300">
        {children}
      </main>
    </div>
  );
};

// Layout for guests/authentication pages
const PublicRoute = ({ children }) => {
  const { user } = useAuth();

  if (user) {
    return <Navigate to="/dashboard" replace />;
  }

  return children;
};

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Guest/Auth Routes */}
          <Route
            path="/login"
            element={
              <PublicRoute>
                <Login />
              </PublicRoute>
            }
          />
          <Route
            path="/register"
            element={
              <PublicRoute>
                <Register />
              </PublicRoute>
            }
          />

          {/* Secure Application Routes */}
          <Route
            path="/dashboard"
            element={
              <ProtectedLayout>
                <Dashboard />
              </ProtectedLayout>
            }
          />
          <Route
            path="/log"
            element={
              <ProtectedLayout>
                <FoodLogging />
              </ProtectedLayout>
            }
          />
          <Route
            path="/image-analysis"
            element={
              <ProtectedLayout>
                <FoodImageAnalysis />
              </ProtectedLayout>
            }
          />
          <Route
            path="/text-analysis"
            element={
              <ProtectedLayout>
                <MealTextAnalysis />
              </ProtectedLayout>
            }
          />
          <Route
            path="/recommendations"
            element={
              <ProtectedLayout>
                <Recommendations />
              </ProtectedLayout>
            }
          />
          <Route
            path="/profile"
            element={
              <ProtectedLayout>
                <Profile />
              </ProtectedLayout>
            }
          />

          {/* Fallback Redirects */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
