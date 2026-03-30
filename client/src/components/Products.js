import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { products } from '../api/apiClient';

const Products = ({ user }) => {
  const [productList, setProductList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: '',
    category: '',
    description: '',
    price: '',
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await products.getAll();
      setProductList(response.data);
    } catch (err) {
      setError('Failed to fetch products');
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await products.create({
        ...newProduct,
        price: parseFloat(newProduct.price),
      });
      setShowForm(false);
      setNewProduct({ title: '', category: '', description: '', price: '' });
      fetchProducts();
    } catch (err) {
      setError('Failed to create product');
    }
  };

  const handleCancel = () => {
    setShowForm(false);
    setNewProduct({ title: '', category: '', description: '', price: '' });
  };

  if (loading) return <div style={styles.loading}>Загрузка...</div>;

  return (
    <div style={styles.container}>
      <div style={styles.header}>
        <h2 style={styles.title}>Товары</h2>
        {user?.role === 'seller' && !showForm && (
          <button onClick={() => setShowForm(true)} style={styles.addBtn}>
            + Добавить товар
          </button>
        )}
      </div>

      {error && <div style={styles.error}>{error}</div>}

      {showForm ? (
        <div style={styles.formContainer}>
          <form onSubmit={handleCreate} style={styles.form}>
            <h3 style={styles.formTitle}>Новый товар</h3>
            <input
              type="text"
              placeholder="Название товара"
              value={newProduct.title}
              onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
              required
              style={styles.input}
            />
            <input
              type="text"
              placeholder="Категория"
              value={newProduct.category}
              onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
              required
              style={styles.input}
            />
            <textarea
              placeholder="Описание товара"
              value={newProduct.description}
              onChange={(e) => setNewProduct({ ...newProduct, description: e.target.value })}
              required
              style={styles.textarea}
            />
            <input
              type="number"
              placeholder="Цена"
              value={newProduct.price}
              onChange={(e) => setNewProduct({ ...newProduct, price: e.target.value })}
              required
              style={styles.input}
            />
            <div style={styles.formButtons}>
              <button type="submit" style={styles.submitBtn}>Создать товар</button>
              <button type="button" onClick={handleCancel} style={styles.cancelFormBtn}>
                Отмена
              </button>
            </div>
          </form>
        </div>
      ) : (
        <>
          <div style={styles.grid}>
            {productList.map((product) => (
              <div key={product.id} style={styles.card}>
                <Link to={`/products/${product.id}`} style={styles.link}>
                  <div style={styles.cardContent}>
                    <h3 style={styles.productTitle}>{product.title}</h3>
                    <div style={styles.categoryBadge}>{product.category}</div>
                    <p style={styles.price}>{parseFloat(product.price).toFixed(2)} руб.</p>
                  </div>
                </Link>
              </div>
            ))}
          </div>

          {productList.length === 0 && (
            <div style={styles.emptyState}>
              <p>Товары не найдены</p>
            </div>
          )}
        </>
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
  header: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem',
    maxWidth: '1400px',
    margin: '0 auto 2rem auto',
  },
  title: {
    color: '#ffffff',
    fontSize: '2rem',
    fontWeight: '600',
    margin: 0,
  },
  addBtn: {
    padding: '0.6rem 1.25rem',
    backgroundColor: '#1a7630',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#1e7e34',
    },
  },
  formContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 'calc(100vh - 200px)',
  },
  form: {
    backgroundColor: '#1e1924',
    borderRadius: '16px',
    padding: '2rem',
    width: '100%',
    maxWidth: '500px',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
  formTitle: {
    color: '#ffffff',
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    fontWeight: '600',
    textAlign: 'center',
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    marginBottom: '1rem',
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
    padding: '0.75rem',
    marginBottom: '1rem',
    backgroundColor: '#2d2637',
    border: '1px solid #382f45',
    borderRadius: '8px',
    fontSize: '0.9rem',
    color: '#e0e0e0',
    outline: 'none',
    minHeight: '100px',
    resize: 'vertical',
    ':focus': {
      borderColor: '#3c19d9',
    },
  },
  formButtons: {
    display: 'flex',
    gap: '1rem',
    marginTop: '1rem',
  },
  submitBtn: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#1a7630',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#1e7e34',
    },
  },
  cancelFormBtn: {
    flex: 1,
    padding: '0.75rem',
    backgroundColor: '#585f65',
    color: 'white',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#545b62',
    },
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))',
    gap: '1.5rem',
    maxWidth: '1400px',
    margin: '0 auto',
  },
  card: {
    backgroundColor: '#1e1924',
    borderRadius: '16px',
    overflow: 'hidden',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    boxShadow: '0 4px 20px rgba(0, 0, 0, 0.3)',
    display: 'flex',
    flexDirection: 'column',
    ':hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 6px 24px rgba(0, 0, 0, 0.4)',
    },
  },
  link: {
    textDecoration: 'none',
    color: 'inherit',
    flex: 1,
  },
  cardContent: {
    padding: '1.25rem',
  },
  productTitle: {
    color: '#ffffff',
    fontSize: '1.25rem',
    fontWeight: '600',
    marginBottom: '0.75rem',
    lineHeight: '1.3',
  },
  categoryBadge: {
    display: 'inline-block',
    padding: '0.25rem 0.75rem',
    backgroundColor: '#2d2735',
    borderRadius: '20px',
    fontSize: '0.75rem',
    color: '#bbb',
    marginBottom: '0.75rem',
  },
  price: {
    fontSize: '1.5rem',
    fontWeight: '700',
    color: '#4caf50',
    marginBottom: '0.75rem',
  },
  cardActions: {
    padding: '1rem 1.25rem',
    borderTop: '1px solid #2d2735',
    display: 'flex',
    gap: '0.75rem',
    backgroundColor: '#1e1924',
  },
  editBtn: {
    flex: 1,
    textAlign: 'center',
    padding: '0.5rem',
    backgroundColor: '#351e9e',
    color: 'white',
    textDecoration: 'none',
    borderRadius: '8px',
    fontSize: '0.85rem',
    fontWeight: '500',
    transition: 'background-color 0.2s ease',
    ':hover': {
      backgroundColor: '#2a1780',
    },
  },
  deleteBtn: {
    flex: 1,
    padding: '0.5rem',
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
  emptyState: {
    textAlign: 'center',
    padding: '3rem',
    backgroundColor: '#1e1924',
    borderRadius: '16px',
    maxWidth: '600px',
    margin: '2rem auto',
    color: '#888',
  },
};

export default Products;