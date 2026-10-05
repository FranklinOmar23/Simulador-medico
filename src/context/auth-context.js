// src/context/auth-context.js

import { createContext, useContext } from 'react';

export const AuthContext = createContext({
  configured: false,
  user: null,
  loading: false,
  error: null,
  syncStatus: 'idle', // 'idle' | 'loading' | 'saving' | 'saved' | 'error'
  signIn: () => {},
  signOut: () => {}
});

export function useAuth() {
  return useContext(AuthContext);
}
