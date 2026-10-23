import { create } from 'zustand';

export type Me = {
  id: string;
  firstName: string;
  lastName: string;
  role: string;
  shopId: string | null;
  avatar?: string | null;
  mustChangePin?: boolean;
};

type AuthState = {
  user: Me | null;
  token: string | null;
  setSession: (user: Me, token: string) => void;
  patchUser: (patch: Partial<Me>) => void;
  clear: () => void;
};

// Hydrate synchronously from localStorage so the very first render has the user.
function loadFromStorage(): { user: Me | null; token: string | null } {
  try {
    const token = localStorage.getItem('elbenna.token');
    const userJson = localStorage.getItem('elbenna.user');
    if (token && userJson) return { token, user: JSON.parse(userJson) as Me };
  } catch {}
  return { user: null, token: null };
}

export const useAuth = create<AuthState>((set) => ({
  ...loadFromStorage(),
  setSession: (user, token) => {
    localStorage.setItem('elbenna.token', token);
    localStorage.setItem('elbenna.user', JSON.stringify(user));
    set({ user, token });
  },
  patchUser: (patch) => set((s) => {
    if (!s.user) return s;
    const user = { ...s.user, ...patch };
    localStorage.setItem('elbenna.user', JSON.stringify(user));
    return { user };
  }),
  clear: () => {
    localStorage.removeItem('elbenna.token');
    localStorage.removeItem('elbenna.user');
    set({ user: null, token: null });
  },
}));
