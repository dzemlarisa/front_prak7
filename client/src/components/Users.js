import React, { useState, useEffect } from 'react';
import { users } from '../api/apiClient';

const Users = () => {
  const [userList, setUserList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [editingUser, setEditingUser] = useState(null);
  const [passwordInput, setPasswordInput] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await users.getAll();
      setUserList(response.data);
    } catch (err) {
      setError('Failed to fetch users');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (id, updatedData) => {
    const updatePayload = {};
    
    if (updatedData.first_name !== undefined) {
      updatePayload.first_name = updatedData.first_name;
    }
    if (updatedData.last_name !== undefined) {
      updatePayload.last_name = updatedData.last_name;
    }
    if (updatedData.role !== undefined) {
      updatePayload.role = updatedData.role;
    }
    if (passwordInput) {
      updatePayload.password = passwordInput;
    }

    if (Object.keys(updatePayload).length === 0) {
      setEditingUser(null);
      setPasswordInput('');
      return;
    }

    try {
      await users.update(id, updatePayload);
      await fetchUsers();
      setEditingUser(null);
      setPasswordInput('');
    } catch (err) {
      setError('Failed to update user');
    }
  };

  const handleBlock = async (id) => {
    if (window.confirm('Точно заблокировать этого пользователя?')) {
      try {
        await users.block(id);
        fetchUsers();
      } catch (err) {
        setError('Failed to block user');
      }
    }
  };

  const startEditing = (user) => {
    setEditingUser({ ...user });
    setPasswordInput('');
  };

  if (loading) return <div style={styles.loading}>Загрузка...</div>;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Пользователи</h2>
      
      {error && <div style={styles.error}>{error}</div>}
      
      <div style={styles.cardsGrid}>
        {userList.map((user) => (
          <div key={user.id} style={styles.card}>
            <div style={styles.cardHeader}>
              <div style={styles.userId}>ID: {user.id}</div>
              <div style={user.isBlocked ? styles.statusBadgeBlocked : styles.statusBadgeActive}>
                {user.isBlocked ? 'Заблокирован' : 'Активен'}
              </div>
            </div>
            
            <div style={styles.cardContent}>
              <div style={styles.field}>
                <div style={styles.fieldLabel}>Email</div>
                <div style={styles.fieldValue}>{user.email}</div>
              </div>
              
              {editingUser?.id === user.id ? (
                <>
                  <div style={styles.field}>
                    <div style={styles.fieldLabel}>Имя</div>
                    <input
                      type="text"
                      value={editingUser.first_name || ''}
                      onChange={(e) => {
                        setEditingUser({ 
                          ...editingUser, 
                          first_name: e.target.value 
                        });
                      }}
                      style={styles.editInput}
                    />
                  </div>
                  
                  <div style={styles.field}>
                    <div style={styles.fieldLabel}>Фамилия</div>
                    <input
                      type="text"
                      value={editingUser.last_name || ''}
                      onChange={(e) => {
                        setEditingUser({ 
                          ...editingUser, 
                          last_name: e.target.value 
                        });
                      }}
                      style={styles.editInput}
                    />
                  </div>
                  
                  <div style={styles.field}>
                    <div style={styles.fieldLabel}>Роль</div>
                    <select
                      value={editingUser.role || 'user'}
                      onChange={(e) => {
                        setEditingUser({ 
                          ...editingUser, 
                          role: e.target.value 
                        });
                      }}
                      style={styles.select}
                    >
                      <option value="user">Пользователь</option>
                      <option value="seller">Продавец</option>
                      <option value="admin">Админ</option>
                    </select>
                  </div>
                  
                  <div style={styles.field}>
                    <div style={styles.fieldLabel}>Новый пароль</div>
                    <input
                      type="password"
                      placeholder="Опционально"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      style={styles.editInput}
                    />
                  </div>
                  
                  <div style={styles.buttonGroup}>
                    <button
                      onClick={() => handleUpdate(user.id, editingUser)}
                      style={styles.saveBtn}
                    >
                      Сохранить
                    </button>
                    <button
                      onClick={() => {
                        setEditingUser(null);
                        setPasswordInput('');
                      }}
                      style={styles.cancelBtn}
                    >
                      Отменить
                    </button>
                  </div>
                </>
              ) : (
                <>
                  <div style={styles.fieldRow}>
                    <div style={styles.fieldHalf}>
                      <div style={styles.fieldLabel}>Имя</div>
                      <div style={styles.fieldValue}>{user.first_name || '-'}</div>
                    </div>
                    <div style={styles.fieldHalf}>
                      <div style={styles.fieldLabel}>Фамилия</div>
                      <div style={styles.fieldValue}>{user.last_name || '-'}</div>
                    </div>
                  </div>
                  
                  <div style={styles.field}>
                    <div style={styles.fieldLabel}>Роль</div>
                    <div style={styles.roleBadge}>{user.role === 'admin' ? 'Админ' : user.role === 'seller' ? 'Продавец' : 'Пользователь'}</div>
                  </div>
                  
                  <div style={styles.buttonGroup}>
                    <button
                      onClick={() => startEditing(user)}
                      style={styles.editBtn}
                    >
                      Изменить
                    </button>
                    {!user.isBlocked && (
                      <button
                        onClick={() => handleBlock(user.id)}
                        style={styles.blockBtn}
                      >
                        Заблокировать
                      </button>
                    )}
                  </div>
                </>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#08141b',
    padding: '2rem',
  },
  title: {
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: '2rem',
    fontSize: '2rem',
    fontWeight: '600',
  },
  cardsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(380px, 1fr))',
    gap: '1.5rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: '#1e1924',
    borderRadius: '16px',
    overflow: 'hidden',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.4)',
    },
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1rem 1.25rem',
    backgroundColor: '#2d2735',
    borderBottom: '1px solid #382f45',
  },
  userId: {
    color: '#888',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  statusBadgeActive: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#1a3d1a',
    color: '#4caf50',
  },
  statusBadgeBlocked: {
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.75rem',
    fontWeight: '600',
    backgroundColor: '#3d1a1a',
    color: '#f44336',
  },
  cardContent: {
    padding: '1.25rem',
  },
  field: {
    marginBottom: '1rem',
  },
  fieldRow: {
    display: 'flex',
    gap: '1rem',
    marginBottom: '1rem',
  },
  fieldHalf: {
    flex: 1,
  },
  fieldLabel: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#888',
    marginBottom: '0.5rem',
  },
  fieldValue: {
    fontSize: '0.95rem',
    color: '#e0e0e0',
    wordBreak: 'break-word',
  },
  roleBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    borderRadius: '20px',
    fontSize: '0.8rem',
    fontWeight: '500',
    backgroundColor: '#2d2735',
    color: '#bbb',
  },
  editInput: {
    width: '100%',
    padding: '0.6rem',
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
  select: {
    width: '100%',
    padding: '0.6rem',
    backgroundColor: '#2d2637',
    border: '1px solid #382f45',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#e0e0e0',
    outline: 'none',
    cursor: 'pointer',
    ':focus': {
      borderColor: '#3c19d9',
    },
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.75rem',
    marginTop: '1rem',
  },
  editBtn: {
    flex: 1,
    padding: '0.6rem',
    backgroundColor: '#351e9e',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#2a1780',
    },
  },
  blockBtn: {
    flex: 1,
    padding: '0.6rem',
    backgroundColor: '#dc3545',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#b02a37',
    },
  },
  saveBtn: {
    flex: 1,
    padding: '0.6rem',
    backgroundColor: '#1a7630',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#1e7e34',
    },
  },
  cancelBtn: {
    flex: 1,
    padding: '0.6rem',
    backgroundColor: '#585f65',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.85rem',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#545b62',
    },
  },
  loading: {
    textAlign: 'center',
    padding: '2rem',
    fontSize: '18px',
    color: '#e0e0e0',
    backgroundColor: '#08141b',
    minHeight: '100vh',
  },
  error: {
    backgroundColor: '#3d1a1a',
    color: '#f44336',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    textAlign: 'center',
    maxWidth: '1400px',
    margin: '0 auto 1rem auto',
  },
};

export default Users;