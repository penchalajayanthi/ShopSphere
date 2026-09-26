import { create } from "zustand";
import type { User } from "../types/user";
import { users as defaultUsers } from "../data/users";
import { storage } from "../utils/storage";

interface AuthSession {
  token: string;
  userId: number;
  expiresAt: number;
}

interface AuthState {
  user: User | null;
  users: User[];
  session: AuthSession | null;

  login: (
    email: string,
    password: string,
  ) => boolean;

  register: (
    name: string,
    email: string,
    password: string,
  ) => boolean;

  logout: () => void;

  isAuthenticated: () => boolean;
}

const USERS_KEY = "shopsphere_users";
const SESSION_KEY = "shopsphere_auth_session";

const storedUsers = storage.get<User[]>(
  USERS_KEY,
  defaultUsers,
);

const storedSession =
  storage.get<AuthSession | null>(
    SESSION_KEY,
    null,
  );

let initialUser: User | null = null;

if (storedSession) {
  const isExpired =
    Date.now() >= storedSession.expiresAt;

  if (!isExpired) {
    initialUser =
      storedUsers.find(
        (user) =>
          user.id === storedSession.userId,
      ) ?? null;
  } else {
    storage.remove(SESSION_KEY);
  }
}

if (!localStorage.getItem(USERS_KEY)) {
  storage.set(USERS_KEY, defaultUsers);
}

export const useAuthStore =
  create<AuthState>((set, get) => ({
    user: initialUser,

    users: storedUsers,

    session: storedSession,

    login: (email, password) => {
      const currentUsers =
        storage.get<User[]>(
          USERS_KEY,
          defaultUsers,
        );

      const normalizedEmail =
        email.trim().toLowerCase();

      const foundUser =
        currentUsers.find(
          (item) =>
            item.email.toLowerCase() ===
              normalizedEmail &&
            item.password === password,
        );

      if (!foundUser) {
        return false;
      }

      const session: AuthSession = {
        token:
          `mock-jwt-${foundUser.id}-${Date.now()}`,
        userId: foundUser.id,
        expiresAt:
          Date.now() +
          24 * 60 * 60 * 1000,
      };

      storage.set(
        SESSION_KEY,
        session,
      );

      storage.set(
        "shopsphere_current_user",
        foundUser,
      );

      set({
        user: foundUser,
        users: currentUsers,
        session,
      });

      return true;
    },

    register: (
      name,
      email,
      password,
    ) => {
      const currentUsers =
        storage.get<User[]>(
          USERS_KEY,
          defaultUsers,
        );

      const normalizedEmail =
        email.trim().toLowerCase();

      const existingUser =
        currentUsers.find(
          (item) =>
            item.email.toLowerCase() ===
            normalizedEmail,
        );

      if (existingUser) {
        return false;
      }

      const newUser: User = {
        id: Date.now(),
        name: name.trim(),
        email: normalizedEmail,
        password,
        role: "customer",
      };

      const updatedUsers = [
        ...currentUsers,
        newUser,
      ];

      const session: AuthSession = {
        token:
          `mock-jwt-${newUser.id}-${Date.now()}`,
        userId: newUser.id,
        expiresAt:
          Date.now() +
          24 * 60 * 60 * 1000,
      };

      storage.set(
        USERS_KEY,
        updatedUsers,
      );

      storage.set(
        SESSION_KEY,
        session,
      );

      storage.set(
        "shopsphere_current_user",
        newUser,
      );

      set({
        users: updatedUsers,
        user: newUser,
        session,
      });

      return true;
    },

    logout: () => {
      storage.remove(
        "shopsphere_current_user",
      );

      storage.remove(SESSION_KEY);

      set({
        user: null,
        session: null,
      });
    },

    isAuthenticated: () => {
      const session = get().session;
      const user = get().user;

      if (!session || !user) {
        return false;
      }

      if (
        Date.now() >=
        session.expiresAt
      ) {
        storage.remove(SESSION_KEY);
        storage.remove(
          "shopsphere_current_user",
        );

        set({
          user: null,
          session: null,
        });

        return false;
      }

      return true;
    },
  }));