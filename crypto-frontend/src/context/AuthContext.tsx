import { createContext, useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';


interface AuthContextType {
  isAuthenticated: boolean;
  isAuthGetter: boolean;
  login: (token:string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth debe ser usado dentro de un AuthProvider');
  }
  return context;
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isAuthGetter, setIsAuthGetter] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    setIsAuthGetter(true);
    if (token) {
      setIsAuthenticated(true);
    }
  }, []);

  const login = (token:string) => {
    try {
      
      localStorage.setItem('token', token); 
      setIsAuthenticated(true); 
    } catch (error) {
      console.error('Error al iniciar sesión:', error);
      throw new Error('Error en la autenticación');
    }
  };

  const logout = () => {
    localStorage.removeItem('token');
    setIsAuthenticated(false);
    navigate('/login'); 
  };

  return (
    <AuthContext.Provider value={{ isAuthenticated, isAuthGetter, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
