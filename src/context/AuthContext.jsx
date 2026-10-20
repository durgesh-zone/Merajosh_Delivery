import { createContext, useCallback, useContext, useEffect, useMemo } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { authApi } from '@/services/delivery.api';
import { onSessionExpired } from '@/lib/api';
import { closeSocket } from '@/lib/socket';

const AuthContext = createContext(null);

async function loadSession() {
  try {
    return await authApi.me();
  } catch (err) {
    if (err.response?.status !== 401) throw err;
    try {
      return await authApi.refresh();
    } catch {
      return null;
    }
  }
}

export function AuthProvider({ children }) {
  const queryClient = useQueryClient();
  // isPending (not isLoading): until the session check answers, we don't know if the user is signed in.
  const { data: user, isPending: isLoading } = useQuery({ queryKey: ['auth', 'me'], queryFn: loadSession, staleTime: Infinity, retry: false });
  const setUser = useCallback((u) => queryClient.setQueryData(['auth', 'me'], u), [queryClient]);
  useEffect(() => onSessionExpired(() => setUser(null)), [setUser]);

  const login = useCallback(async (credentials) => {
    const u = await authApi.login(credentials);
    setUser(u);
    return u;
  }, [setUser]);

  const logout = useCallback(async () => {
    try {
      await authApi.logout();
    } finally {
      closeSocket();
      queryClient.clear();
      setUser(null);
    }
  }, [queryClient, setUser]);

  const value = useMemo(() => ({ user: user || null, isLoading, isAuthenticated: Boolean(user), login, logout }), [user, isLoading, login, logout]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export const useAuth = () => useContext(AuthContext);
