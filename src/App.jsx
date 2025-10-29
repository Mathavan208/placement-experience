import React, { useState, useEffect } from "react";
import {
  HashRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { auth } from "./firebase/firebaseConfig";
import { onAuthStateChanged } from "firebase/auth";
import Galaxy from "./components/animations/Galaxy";
import Navbar from "./components/navbar/Navbar";
import Home from "./pages/Home";
import CompanyPage from "./pages/CompanyPage";
import AddExperience from "./pages/AddExperience";
import Profile from "./pages/Profile";
import Login from "./components/auth/Login";
import Signup from "./components/auth/Signup";
import "./styles/globals.css";
import { db } from "./firebase/firebaseConfig";
import { doc, getDoc } from "firebase/firestore";
import CompanyDetails from "./components/company/CompanyDetails";
import TermsModal from "./components/common/TermsModal";

import ChatBot from "./components/chatbot/ChatBot";   

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showTermsModal, setShowTermsModal] = useState(false);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setUser(user);
      setLoading(false);

      if (user) {
        const docRef = doc(db, "users", user.uid);
        const snap = await getDoc(docRef);
        if (!snap?.data()?.termsAccepted) {
          setShowTermsModal(true);
        }
      }
    });
    return unsubscribe;
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-gray-900">
        <div className="text-2xl text-white">Loading...</div>
      </div>
    );
  }

  const navItems = [
    { label: "Home", href: "/" },
    { label: "Companies", href: "/companies" },
    { label: "Add Experience", href: user ? "/add-experience" : "/login" },
    { label: "Profile", href: user ? "/profile" : "/login" },
  ];

  return (
    <AuthProvider>
      {showTermsModal && user && (
        <TermsModal user={user} onClose={() => setShowTermsModal(false)} />
      )}

      <Router>
        <div className="relative min-h-screen overflow-hidden text-white bg-gray-900">
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
            <header className="sticky top-0 z-50 shadow-lg bg-gray-900/80 backdrop-blur-md">
              <div className="container px-4 py-4 mx-auto">
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

          
            <ChatBot />
          </div>
        </div>
      </Router>
    </AuthProvider>
  );
}

export default App;
