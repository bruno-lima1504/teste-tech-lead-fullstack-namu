'use client';

import { createContext, useContext, useSyncExternalStore, type ReactNode } from 'react';
import { SEED_USERS, type SeedUserId } from './seed-users';

const STORAGE_KEY = 'namu:user-id';
const DEFAULT_USER_ID: SeedUserId = SEED_USERS[0].id;

// A escolha vale para a aba mesmo se o localStorage estiver indisponível (modo privado).
let chosenUserId: SeedUserId | null = null;
const listeners = new Set<() => void>();

const isSeedUserId = (value: number): value is SeedUserId =>
  SEED_USERS.some(({ id }) => id === value);

const storedUserId = (): SeedUserId => {
  try {
    const stored = Number(window.localStorage.getItem(STORAGE_KEY));
    return isSeedUserId(stored) ? stored : DEFAULT_USER_ID;
  } catch {
    return DEFAULT_USER_ID;
  }
};

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

const setCurrentUserId = (userId: SeedUserId) => {
  chosenUserId = userId;
  try {
    window.localStorage.setItem(STORAGE_KEY, String(userId));
  } catch {
    // Sem armazenamento: a escolha vale só para esta aba.
  }
  listeners.forEach((listener) => listener());
};

interface CurrentUser {
  userId: SeedUserId;
  setUserId: (userId: SeedUserId) => void;
}

const CurrentUserContext = createContext<CurrentUser | null>(null);

export function CurrentUserProvider({ children }: { children: ReactNode }) {
  const userId = useSyncExternalStore(
    subscribe,
    () => chosenUserId ?? storedUserId(),
    () => DEFAULT_USER_ID,
  );
  return (
    <CurrentUserContext value={{ userId, setUserId: setCurrentUserId }}>
      {children}
    </CurrentUserContext>
  );
}

export function useCurrentUser(): CurrentUser {
  const currentUser = useContext(CurrentUserContext);
  if (!currentUser) {
    throw new Error('useCurrentUser() fora do CurrentUserProvider.');
  }
  return currentUser;
}
