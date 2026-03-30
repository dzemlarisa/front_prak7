import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { auth } from '../api/apiClient';

const Login = ({ setUser }) => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await auth.login(formData.email, formData.password);
      const { accessToken, refreshToken } = response.data;
      
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      
      const meResponse = await auth.getMe();
      setUser(meResponse.data);
      
      navigate('/products');
    } catch (err) {
      setError(err.response?.data?.error || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.formContainer}>
        <h2 style={styles.title}>Авторизация</h2>
        
        {error && <div style={styles.error}>{error}</div>}
        
        <form onSubmit={handleSubmit}>
          <div style={styles.formGroup}>
            <label style={styles.label}>Email:</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          
          <div style={styles.formGroup}>
            <label style={styles.label}>Пароль:</label>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              required
              style={styles.input}
            />
          </div>
          
          <button type="submit" disabled={loading} style={styles.button}>
            {loading ? 'Загрузка...' : 'Войти'}
          </button>
        </form>
        
        <p style={styles.linkText}>
          Нет аккаунта? <Link to="/register" style={styles.link}>Зарегистрироваться</Link>
        </p>
        
        <div style={styles.testAccounts}>
          <h4 style={styles.testTitle}>Тестовые аккаунты:</h4>
          <p style={styles.testItem}>admin@example.com / admin</p>
          <p style={styles.testItem}>seller@example.com / seller</p>
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#08141b',
    padding: '2rem',
  },
  formContainer: {
    backgroundColor: '#1e1924',
    padding: '2rem',
    borderRadius: '16px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    width: '100%',
    maxWidth: '400px',
  },
  title: {
    color: '#ffffff',
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    fontWeight: '600',
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: '1rem',
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontSize: '0.85rem',
    fontWeight: '500',
    color: '#e0e0e0',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#2d2637',
    border: '1px solid #382f45',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#e0e0e0',
    outline: 'none',
    transition: 'border-color 0.2s ease',
    ':focus': {
      borderColor: '#3c19d9',
    },
  },
  button: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#1a7630',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    fontSize: '0.9rem',
    fontWeight: '500',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    marginTop: '0.5rem',
    ':hover': {
      backgroundColor: '#1e7e34',
    },
    ':disabled': {
      opacity: 0.6,
      cursor: 'not-allowed',
    },
  },
  error: {
    backgroundColor: '#3d1a1a',
    color: '#f44336',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    textAlign: 'center',
    fontSize: '0.85rem',
  },
  linkText: {
    marginTop: '1.5rem',
    textAlign: 'center',
    color: '#e0e0e0',
    fontSize: '0.9rem',
  },
  link: {
    color: '#4caf50',
    textDecoration: 'none',
    fontWeight: '500',
    transition: 'color 0.2s ease',
    ':hover': {
      color: '#45a049',
      textDecoration: 'underline',
    },
  },
  testAccounts: {
    marginTop: '2rem',
    padding: '1rem',
    backgroundColor: '#2d2735',
    borderRadius: '8px',
    fontSize: '0.85rem',
  },
  testTitle: {
    color: '#e0e0e0',
    fontSize: '0.9rem',
    marginBottom: '0.5rem',
    fontWeight: '600',
  },
  testItem: {
    color: '#888',
    margin: '0.25rem 0',
    fontSize: '0.8rem',
  },
};

export default Login;