import React, { useState, useEffect } from 'react';
import { useLocalStorage } from '../hooks/useLocalStorage';

export default function PasswordList() {
  const initialPasswords = [
    { id: 1, site: 'tg', username: 'user@gmail.com', password: 'SecretPassword123' },
    { id: 2, site: 'Google', username: 'user@yandex.ru', password: 'SecurePassword456' }
  ];

  const [passwords, setPasswords] = useLocalStorage('my_passwords', initialPasswords);
  
  const [site, setSite] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPasswordInput, setShowPasswordInput] = useState(false);
  const [filterQuery, setFilterQuery] = useState('');

  useEffect(() => {
    document.title = `Password Vault`;
  }, [passwords]);

  const [isLoading, setIsLoading] = useState(true);
  useEffect(() => {
    const timer = setTimeout(() => setIsLoading(false), 500);
    return () => clearTimeout(timer);
  }, []);

  const handleGeneratePassword = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%&';
    let generated = '';
    for (let i = 0; i < 12; i++) {
      generated += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setPassword(generated);
    setShowPasswordInput(true);
  };

  const handleAddPassword = (e) => {
    e.preventDefault();
    if (!site.trim() || !username.trim() || !password.trim()) return;

    const newItem = { id: Date.now(), site, username, password };
    setPasswords([...passwords, newItem]);
    setSite('');
    setUsername('');
    setPassword('');
    setShowPasswordInput(false);
  };

  const handleDelete = (id) => {
    setPasswords(passwords.filter((item) => item.id !== id));
  };

  const filteredPasswords = passwords.filter((item) =>
    item.site.toLowerCase().includes(filterQuery.toLowerCase())
  );

  if (isLoading) {
    return (
      <div style={styles.loaderContainer}>
        <div style={styles.spinner}></div>
        <p style={{ color: '#8b5cf6', marginTop: '16px', fontFamily: 'sans-serif', fontWeight: '500' }}>Загружаем ваше хранилище...</p>
      </div>
    );
  }

  return (
    <div style={styles.page}>
      <div style={styles.container}>
        {}
        <div style={styles.header}>
          <h1 style={styles.title}>💜 Password Vault </h1>
          <p style={styles.subtitle}>Ваши пароли в надежном и уютном месте</p>
        </div>

        {}
        <form onSubmit={handleAddPassword} style={styles.card}>
          <h3 style={styles.cardTitle}>Новая запись</h3>
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Сайт или соц. сеть"
              value={site}
              onChange={(e) => setSite(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.inputGroup}>
            <input
              type="text"
              placeholder="Email или логин"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              style={styles.input}
            />
          </div>
          <div style={styles.passwordRow}>
            <div style={{ ...styles.inputGroup, flex: 1, marginBottom: 0 }}>
              <input
                type={showPasswordInput ? 'text' : 'password'}
                placeholder="Пароль"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={styles.input}
              />
            </div>
            <button
              type="button"
              onClick={() => setShowPasswordInput(!showPasswordInput)}
              style={styles.iconButton}
              title={showPasswordInput ? "Скрыть вводимый пароль" : "Посмотреть вводимый пароль"}
            >
              {showPasswordInput ? '👁️‍🗨️' : '👁️'}
            </button>
            <button
              type="button"
              onClick={handleGeneratePassword}
              style={styles.generateButton}
              title="Сгенерировать надежный пароль"
            >
              Сгенерировать
            </button>
          </div>

          <button type="submit" style={styles.primaryButton}>
            Добавить
          </button>
        </form>

        {}
        <div style={styles.toolbar}>
          <input
            type="text"
            placeholder="Найти сервис..."
            value={filterQuery}
            onChange={(e) => setFilterQuery(e.target.value)}
            style={styles.searchInput}
          />
          <span style={styles.counter}>
            Всего: <b>{passwords.length}</b>
          </span>
        </div>

        {}
        <div style={styles.list}>
          {filteredPasswords.length === 0 ? (
            <p style={styles.emptyText}>Ничего не нашлось 🌱</p>
          ) : (
            filteredPasswords.map((item) => (
              <div key={item.id} style={styles.itemCard}>
                <div style={styles.itemInfo}>
                  <span style={styles.itemSite}>{item.site}</span>
                  <span style={styles.itemUser}>👤 {item.username}</span>
                  <span style={styles.itemPass}>🔑 ••••••••••••</span>
                </div>
                <button
                  onClick={() => handleDelete(item.id)}
                  style={styles.deleteButton}
                  title="Удалить запись"
                >
                  Удалить
                </button>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const styles = {
  page: {
    backgroundColor: '#fdfcfe',
    minHeight: '100vh',
    padding: '40px 20px',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  container: {
    maxWidth: '540px',
    margin: '0 auto',
  },
  header: {
    textAlign: 'center',
    marginBottom: '32px',
  },
  title: {
    color: '#4c1d95',
    fontSize: '28px',
    fontWeight: '700',
    margin: '0 0 6px 0',
    letterSpacing: '-0.3px',
  },
  subtitle: {
    color: '#7c3aed',
    opacity: '0.8',
    fontSize: '14px',
    margin: 0,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: '16px',
    padding: '24px',
    boxShadow: '0 10px 30px -5px rgba(139, 92, 246, 0.08)',
    marginBottom: '24px',
    border: '1px solid #f3e8ff',
  },
  cardTitle: {
    color: '#5b21b6',
    fontSize: '16px',
    marginTop: 0,
    marginBottom: '16px',
    fontWeight: '600',
  },
  inputGroup: {
    marginBottom: '14px',
  },
  passwordRow: {
    display: 'flex',
    gap: '8px',
    marginBottom: '16px',
    alignItems: 'center',
  },
  input: {
    width: '100%',
    padding: '12px 16px',
    backgroundColor: '#faf5ff',
    border: '1px solid #e9d5ff',
    borderRadius: '10px',
    color: '#3b0764',
    fontSize: '14px',
    outline: 'none',
    boxSizing: 'border-box',
    transition: 'border-color 0.2s',
  },
  iconButton: {
    backgroundColor: '#faf5ff',
    border: '1px solid #e9d5ff',
    borderRadius: '10px',
    padding: '10px 12px',
    cursor: 'pointer',
    fontSize: '16px',
  },
  generateButton: {
    backgroundColor: '#f3e8ff',
    color: '#6d28d9',
    border: '1px solid #e9d5ff',
    borderRadius: '10px',
    padding: '12px 14px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    transition: 'background 0.2s',
  },
  primaryButton: {
    width: '100%',
    backgroundColor: '#8b5cf6',
    color: 'white',
    border: 'none',
    padding: '13px',
    borderRadius: '10px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(139, 92, 246, 0.25)',
    transition: 'background 0.2s',
  },
  toolbar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '16px',
    gap: '12px',
  },
  searchInput: {
    flex: 1,
    padding: '11px 16px',
    backgroundColor: '#ffffff',
    border: '1px solid #e9d5ff',
    borderRadius: '10px',
    color: '#3b0764',
    fontSize: '14px',
    outline: 'none',
    boxShadow: '0 2px 6px rgba(139, 92, 246, 0.03)',
  },
  counter: {
    color: '#6d28d9',
    fontSize: '13px',
    whiteSpace: 'nowrap',
    fontWeight: '500',
  },
  list: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px',
  },
  itemCard: {
    backgroundColor: '#ffffff',
    border: '1px solid #f3e8ff',
    borderRadius: '12px',
    padding: '16px 20px',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    boxShadow: '0 4px 15px rgba(139, 92, 246, 0.04)',
  },
  itemInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
  },
  itemSite: {
    color: '#4c1d95',
    fontSize: '16px',
    fontWeight: '600',
  },
  itemUser: {
    color: '#6d28d9',
    fontSize: '13px',
    opacity: '0.85',
  },
  itemPass: {
    color: '#9ca3af',
    fontSize: '13px',
    fontFamily: 'monospace',
    letterSpacing: '1px',
  },
  deleteButton: {
    backgroundColor: '#fef2f2',
    color: '#dc2626',
    border: '1px solid #fee2e2',
    padding: '7px 12px',
    borderRadius: '8px',
    fontSize: '13px',
    fontWeight: '500',
    cursor: 'pointer',
  },
  loaderContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100vh',
    backgroundColor: '#fdfcfe',
  },
  spinner: {
    width: '36px',
    height: '36px',
    border: '3px solid #f3e8ff',
    borderTop: '3px solid #8b5cf6',
    borderRadius: '50%',
    animation: 'spin 0.8s linear infinite',
  },
  emptyText: {
    textAlign: 'center',
    color: '#8b5cf6',
    opacity: '0.7',
    padding: '24px',
    fontSize: '14px',
  },
};