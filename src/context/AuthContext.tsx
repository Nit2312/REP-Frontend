import React, { createContext, useContext, useReducer, useEffect } from 'react';
import axios from '../config/axios';
import { User, AuthState } from '../types';

interface AuthContextType {
  state: AuthState;
  login: (userId: string, name: string) => Promise<void>;
  logout: () => void;
}

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  loading: false,
  error: null
};

type AuthAction =
  | { type: 'LOGIN_REQUEST' }
  | { type: 'LOGIN_SUCCESS'; payload: User }
  | { type: 'LOGIN_FAILURE'; payload: string }
  | { type: 'LOGOUT' };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  console.log('[Auth Reducer] Action:', action.type, action);
  
  switch (action.type) {
    case 'LOGIN_REQUEST':
      return { ...state, loading: true, error: null };
    case 'LOGIN_SUCCESS':
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        loading: false,
        error: null
      };
    case 'LOGIN_FAILURE':
      return {
        ...state,
        loading: false,
        error: action.payload,
        isAuthenticated: false
      };
    case 'LOGOUT':
      return { ...initialState };
    default:
      return state;
  }
};

const AuthContext = createContext<AuthContextType>({
  state: initialState,
  login: async () => {},
  logout: () => {}
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check if user is already logged in
  useEffect(() => {
    const checkAuth = async () => {
      console.log('[Auth] Checking existing authentication');
      const token = localStorage.getItem('token');
      if (token) {
        try {
          console.log('[Auth] Found token, verifying...');
          const response = await axios.get('/auth/verify', {
            headers: { Authorization: `Bearer ${token}` }
          });
          console.log('[Auth] Token verified successfully:', response.data);
          dispatch({ type: 'LOGIN_SUCCESS', payload: response.data.user });
        } catch (error: any) {
          console.error('[Auth] Token verification failed:', error);
          localStorage.removeItem('token');
        }
      } else {
        console.log('[Auth] No token found');
      }
    };
    
    checkAuth();
  }, []);

  const login = async (userId: string, name: string) => {
    console.log('[Auth] Attempting login for:', { userId, name });
    dispatch({ type: 'LOGIN_REQUEST' });
    try {
      console.log('[Auth] Sending login request to:', axios.defaults.baseURL + '/api/auth/login');
      const response = await axios.post('/api/auth/login', { userId, name });
      console.log('[Auth] Login response:', response.data);
      const { token, user } = response.data;
      if (token && user) {
        console.log('[Auth] Login successful, storing token');
        localStorage.setItem('token', token);
        dispatch({ type: 'LOGIN_SUCCESS', payload: user });
      } else {
        console.error('[Auth] Invalid login response:', response.data);
        dispatch({ type: 'LOGIN_FAILURE', payload: 'Invalid login response from server' });
      }
    } catch (error: any) {
      console.error('[Auth] Login error:', error);
      let errorMessage = 'An error occurred during login';
      
      if (error.response) {
        // The request was made and the server responded with a status code
        // that falls out of the range of 2xx
        console.error('[Auth] Server error response:', {
          status: error.response.status,
          data: error.response.data,
          headers: error.response.headers
        });
        errorMessage = error.response.data.message || errorMessage;
      } else if (error.request) {
        // The request was made but no response was received
        console.error('[Auth] No response received:', error.request);
        errorMessage = 'No response from server. Please check your connection.';
      } else {
        // Something happened in setting up the request that triggered an Error
        console.error('[Auth] Request setup error:', error.message);
        errorMessage = 'Failed to send login request. Please try again.';
      }
      
      dispatch({ type: 'LOGIN_FAILURE', payload: errorMessage });
    }
  };

  const logout = () => {
    console.log('[Auth] Logging out user');
    localStorage.removeItem('token');
    dispatch({ type: 'LOGOUT' });
  };

  return (
    <AuthContext.Provider value={{ state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};