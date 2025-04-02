// utils/auth.ts
export const isAuthenticated = (): boolean => {
    const token = localStorage.getItem('token');
    return token ? true : false;
  };
  
export const getToken = (): string | null => {
    return localStorage.getItem('token');
  };
  