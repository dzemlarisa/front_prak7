import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { products } from '../api/apiClient';

const ProductDetail = ({ user }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
  });

  useEffect(() => {
    fetchProduct();
  }, [id]);

  const fetchProduct = async () => {
    try {
      const response = await products.getById(id);
      setProduct(response.data);
      setEditData({
        title: response.data.title,
        category: response.data.category,
        description: response.data.description,
        price: response.data.price,
      });
    } catch (err) {
      setError('Product not found');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await products.update(id, {
        ...editData,
        price: parseFloat(editData.price),
      });
      setIsEditing(false);
      await fetchProduct();
    } catch (err) {
      setError('Failed to update product');
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Точно удалить этот продукт?')) {
      try {
        await products.delete(id);
        navigate('/products');
      } catch (err) {
        setError('Failed to delete product');
      }
    }
  };

  if (loading) return <div style={styles.loading}>Загрузка...</div>;

  return (
    <div style={styles.container}>
      <button onClick={() => navigate('/products')} style={styles.backBtn}>
        ← Назад к продуктам
      </button>
      
      {error && <div style={styles.error}>{error}</div>}

      {isEditing ? (
        <form onSubmit={handleUpdate} style={styles.form}>
          <h2 style={styles.formTitle}>Редактирование продукта</h2>
          
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Название</div>
            <input
              type="text"
              value={editData.title}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              required
              style={styles.input}
            />
          </div>
          
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Категория</div>
            <input
              type="text"
              value={editData.category}
              onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              required
              style={styles.input}
            />
          </div>
          
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Описание</div>
            <textarea
              value={editData.description}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              required
              style={styles.textarea}
            />
          </div>
          
          <div style={styles.field}>
            <div style={styles.fieldLabel}>Цена</div>
            <input
              type="number"
              step="0.01"
              value={editData.price}
              onChange={(e) => setEditData({ ...editData, price: e.target.value })}
              required
              style={styles.input}
            />
          </div>
          
          <div style={styles.buttonGroup}>
            <button type="submit" style={styles.saveBtn}>
              Сохранить
            </button>
            <button type="button" onClick={() => setIsEditing(false)} style={styles.cancelBtn}>
              Отменить
            </button>
          </div>
        </form>
      ) : (
        <div style={styles.detailCard}>
          <div style={styles.cardHeader}>
            <h2 style={styles.productTitle}>{product.title}</h2>
            <div style={styles.productId}>ID: {product.id}</div>
          </div>
          
          <div style={styles.cardContent}>
            <div style={styles.field}>
              <div style={styles.fieldLabel}>Категория</div>
              <div style={styles.fieldValue}>{product.category}</div>
            </div>
            
            <div style={styles.field}>
              <div style={styles.fieldLabel}>Цена</div>
              <div style={styles.priceValue}>{product.price} руб.</div>
            </div>
            
            <div style={styles.field}>
              <div style={styles.fieldLabel}>Описание</div>
              <div style={styles.descriptionValue}>{product.description}</div>
            </div>
          </div>

          {(user?.role === 'seller' || user?.role === 'admin') && (
            <div style={styles.buttonGroup}>
              <button onClick={() => setIsEditing(true)} style={styles.editBtn}>
                Редактировать
              </button>
              {user?.role === 'admin' && (
                <button onClick={handleDelete} style={styles.deleteBtn}>
                  Удалить
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundColor: '#08141b',
    padding: '2rem',
  },
  backBtn: {
    padding: '0.6rem 1.2rem',
    backgroundColor: '#585f65',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    marginBottom: '1.5rem',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#545b62',
    },
  },
  error: {
    backgroundColor: '#3d1a1a',
    color: '#f44336',
    padding: '0.75rem',
    borderRadius: '8px',
    marginBottom: '1rem',
    textAlign: 'center',
  },
  form: {
    backgroundColor: '#1e1924',
    borderRadius: '16px',
    padding: '2rem',
    maxWidth: '600px',
    margin: '0 auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  formTitle: {
    color: '#ffffff',
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    textAlign: 'center',
  },
  detailCard: {
    backgroundColor: '#1e1924',
    borderRadius: '16px',
    overflow: 'hidden',
    maxWidth: '800px',
    margin: '0 auto',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  cardHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '1.5rem',
    backgroundColor: '#2d2735',
    borderBottom: '1px solid #3a3a3a',
  },
  productTitle: {
    color: '#ffffff',
    fontSize: '1.5rem',
    fontWeight: '600',
    margin: 0,
  },
  productId: {
    color: '#888',
    fontSize: '0.85rem',
    fontWeight: '500',
  },
  cardContent: {
    padding: '1.5rem',
  },
  field: {
    marginBottom: '1.25rem',
  },
  fieldLabel: {
    fontSize: '0.7rem',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
    color: '#888',
    marginBottom: '0.5rem',
  },
  fieldValue: {
    fontSize: '1rem',
    color: '#e0e0e0',
    wordBreak: 'break-word',
  },
  priceValue: {
    fontSize: '1.25rem',
    fontWeight: '600',
    color: '#4caf50',
  },
  descriptionValue: {
    fontSize: '0.95rem',
    color: '#e0e0e0',
    lineHeight: '1.5',
    wordBreak: 'break-word',
  },
  input: {
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
  textarea: {
    width: '100%',
    padding: '0.6rem',
    backgroundColor: '#2d2637',
    border: '1px solid #382f45',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#e0e0e0',outline: 'none',
    minHeight: '120px',
    resize: 'vertical',
    fontFamily: 'inherit',
    ':focus': {
      borderColor: '#007bff',
    },
  },
  buttonGroup: {
    display: 'flex',
    gap: '0.75rem',
    padding: '0 1.5rem 1.5rem 1.5rem',
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
      backgroundColor: '#0056b3',
    },
  },
  deleteBtn: {
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
    backgroundColor: '#5d656c',
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
    backgroundColor: '#0a0a0a',
    minHeight: '100vh',
  },
};

export default ProductDetail;