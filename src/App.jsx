// src/App.jsx
import React, { useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { auth } from './firebase/firebaseConfig';
import { onAuthStateChanged } from 'firebase/auth';
import Galaxy from './components/animations/Galaxy';
import Navbar from './components/navbar/Navbar';
import Home from './pages/Home';
import CompanyPage from './pages/CompanyPage';
import AddExperience from './pages/AddExperience';
import Profile from './pages/Profile';
import Login from './components/auth/Login';
import Signup from './components/auth/Signup';
import './styles/globals.css';
import CompanyDetails from './components/company/CompanyDetails';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      setUser(user);
      setLoading(false);
    });

    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-white text-2xl">Loading...</div>
      </div>
    );
  }

  const navItems = [
    { label: 'Home', href: '/' },
    { label: 'Companies', href: '/companies' },
    { label: 'Add Experience', href: user ? '/add-experience' : '/login' },
    { label: 'Profile', href: user ? '/profile' : '/login' }
  ];

  return (
    <AuthProvider>
      <Router>
        <div className="relative min-h-screen bg-gray-900 text-white overflow-hidden">
          <Galaxy
            className="fixed inset-0 z-0"
            starSpeed={0.5}
            density={1}
            hueShift={140}
            speed={1.0}
            glowIntensity={0.3}
            saturation={0.0}
            mouseRepulsion={true}
            twinkleIntensity={0.3}
            rotationSpeed={0.1}
            transparent={true}
          />
          <div className="relative z-10">
            <header className="bg-gray-900/80 backdrop-blur-md shadow-lg sticky top-0 z-50">
              <div className="container mx-auto px-4 py-4">
                <div className="flex justify-center">
                  <Navbar items={navItems} />
                </div>
              </div>
            </header>
            <main>
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/companies" element={<CompanyPage />} />
                <Route path="/company/:id" element={<CompanyDetails />} />
                <Route 
                  path="/add-experience" 
                  element={user ? <AddExperience /> : <Navigate to="/login" />} 
                />
                <Route 
                  path="/profile" 
                  element={user ? <Profile /> : <Navigate to="/login" />} 
                />
                <Route path="/login" element={<Login />} />
                <Route path="/signup" element={<Signup />} />
              </Routes>
            </main>
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;