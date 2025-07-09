import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { GoogleOAuthProvider } from '@react-oauth/google';
import Header from './components/Header';
import Footer from './components/Footer';
import LandingPage from './pages/LandingPage';
import SignUp from './pages/SignUp';
import SignIn from './pages/SignIn';
import ProductSearch from './pages/ProductSearch';
import Dashboard from './pages/Dashboard';
import Profile from './pages/Profile';
import Wishlist from './pages/Wishlist';
import Contact from './pages/Contact';
import About from './pages/About';
import AdminDashboard from './pages/AdminDashboard';
import { AuthProvider } from './contexts/AuthContext';

function App() {
  return (
      <GoogleOAuthProvider clientId="370908799853-lsocbk1j2rcqh9atl4etren40squisko.apps.googleusercontent.com">
        <AuthProvider>
          <Router>
            <div className="min-h-screen bg-gray-900 text-white">
              <Header />
              <main className="flex-1">
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/signup" element={<SignUp />} />
                  <Route path="/signin" element={<SignIn />} />
                  <Route path="/search" element={<ProductSearch />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/profile" element={<Profile />} />
                  <Route path="/wishlist" element={<Wishlist />} />
                  <Route path="/contact" element={<Contact />} />
                  <Route path="/about" element={<About />} />
                  <Route path="/admin" element={<AdminDashboard />} />
                </Routes>
              </main>
              <Footer />
            </div>
          </Router>
        </AuthProvider>
      </GoogleOAuthProvider>
  );
}

export default App;
