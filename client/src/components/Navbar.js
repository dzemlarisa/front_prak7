import React from 'react';
import { Link, useNavigate } from 'react-router-dom';

const Navbar = ({ user, setUser }) => {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    setUser(null);
    navigate('/login');
  };

  return (
    <nav style={styles.navbar}>
      <div style={styles.container}>
        <Link to="/" style={styles.logo}>
          Ларёк бабки Ларки
        </Link>
        
        <div style={styles.links}>
          <Link to="/products" style={styles.link}>
            Продукты
          </Link>
          
          {user?.role === 'admin' && (
            <Link to="/users" style={styles.link}>
              Пользователи
            </Link>
          )}
          
          {user && (
            <>
              <span style={styles.userInfo}>
                {user.first_name} {user.last_name} ({user.role})
              </span>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Выйти
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};

const styles = {
  navbar: {
    backgroundColor: '#212124',
    padding: '1rem',
    color: 'white',
  },
  container: {
    maxWidth: '1200px',
    margin: '0 auto',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  logo: {
    color: 'white',
    textDecoration: 'none',
    fontSize: '1.5rem',
    fontWeight: 'bold',
  },
  links: {
    display: 'flex',
    gap: '1rem',
    alignItems: 'center',
  },
  link: {
    color: 'white',
    textDecoration: 'none',
    padding: '0.5rem',
  },
  userInfo: {
    marginLeft: '1rem',
    padding: '0.5rem',
    backgroundColor: '#2c2141',
    borderRadius: '4px',
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
};

export default Navbar;