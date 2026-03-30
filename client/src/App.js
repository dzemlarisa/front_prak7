import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { auth } from './api/apiClient';
import Navbar from './components/Navbar';
import Login from './components/Login';
import Register from './components/Register';
import Products from './components/Products';
import ProductDetail from './components/ProductDetail';
import Users from './components/Users';

function App() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      try {
        const response = await auth.getMe();
        setUser(response.data);
      } catch (err) {
        localStorage.removeItem('accessToken');
        localStorage.removeItem('refreshToken');
      }
    }
    setLoading(false);
  };

  if (loading) {
    return <div style={styles.loading}>Загрузка...</div>;
  }

  return (
    <Router>
      <Navbar user={user} setUser={setUser} />
      <Routes>
        <Route path="/login" element={
          !user ? <Login setUser={setUser} /> : <Navigate to="/products" />
        } />
        <Route path="/register" element={
          !user ? <Register /> : <Navigate to="/products" />
        } />
        <Route path="/products" element={
          user ? <Products user={user} /> : <Navigate to="/login" />
        } />
        <Route path="/products/:id" element={
          user ? <ProductDetail user={user} /> : <Navigate to="/login" />
        } />
        <Route path="/products/:id/edit" element={
          user ? <ProductDetail user={user} /> : <Navigate to="/login" />
        } />
        <Route path="/users" element={
          user?.role === 'admin' ? <Users /> : <Navigate to="/products" />
        } />
        <Route path="/" element={<Navigate to="/products" />} />
      </Routes>
    </Router>
  );
}

const styles = {
  loading: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    fontSize: '1.5rem',
  },
};

export default App;