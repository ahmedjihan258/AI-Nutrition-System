import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if user session exists in local storage
    const storedUser = localStorage.getItem('nutrimind_user');
    if (storedUser) {
      try {
        setUser(JSON.parse(storedUser));
      } catch (e) {
        localStorage.removeItem('nutrimind_user');
      }
    }
    setLoading(false);
  }, []);

  const loginUser = (userId, username) => {
    const sessionData = { user_id: userId, username: username };
    setUser(sessionData);
    localStorage.setItem('nutrimind_user', JSON.stringify(sessionData));
  };

  const logoutUser = () => {
    setUser(null);
    localStorage.removeItem('nutrimind_user');
  };

  return (
    <AuthContext.Provider value={{ user, loginUser, logoutUser, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
