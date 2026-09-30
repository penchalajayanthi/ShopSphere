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
const CURRENT_USER_KEY =
  "shopsphere_current_user";


const syncUsers = (): User[] => {
  const storedUsers =
    storage.get<User[]>(
      USERS_KEY,
      [],
    );

  const mergedUsers = [
    ...storedUsers,
  ];

  defaultUsers.forEach(
    (defaultUser) => {
      const existingIndex =
        mergedUsers.findIndex(
          (user) =>
            user.email.toLowerCase() ===
            defaultUser.email.toLowerCase(),
        );

      if (existingIndex === -1) {
     
        mergedUsers.push(
          defaultUser,
        );
      } else {
        mergedUsers[
          existingIndex
        ] = {
          ...mergedUsers[
            existingIndex
          ],
          ...defaultUser,
        };
      }
    },
  );

  storage.set(
    USERS_KEY,
    mergedUsers,
  );

  return mergedUsers;
};

const storedUsers =
  syncUsers();

const rawSession =
  storage.get<AuthSession | null>(
    SESSION_KEY,
    null,
  );

let storedSession:
  | AuthSession
  | null = rawSession;

let initialUser:
  | User
  | null = null;

if (storedSession) {
  const isExpired =
    Date.now() >=
    storedSession.expiresAt;

  if (isExpired) {
    storage.remove(
      SESSION_KEY,
    );

    storage.remove(
      CURRENT_USER_KEY,
    );

    storedSession = null;
  } else {
    initialUser =
      storedUsers.find(
        (user) =>
          user.id ===
          storedSession?.userId,
      ) ?? null;

  
    if (!initialUser) {
      storage.remove(
        SESSION_KEY,
      );

      storage.remove(
        CURRENT_USER_KEY,
      );

      storedSession = null;
    }
  }
}


export const useAuthStore =
  create<AuthState>((set, get) => ({
    user: initialUser,

    users: storedUsers,

    session: storedSession,
    login: (
      email,
      password,
    ) => {
    
      const currentUsers =
        syncUsers();

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const foundUser =
        currentUsers.find(
          (item) =>
            item.email
              .toLowerCase() ===
              normalizedEmail &&
            item.password ===
              password,
        );

      if (!foundUser) {
        return false;
      }

      const session: AuthSession = {
        token:
          `mock-jwt-${foundUser.id}-${Date.now()}`,

        userId:
          foundUser.id,

        expiresAt:
          Date.now() +
          24 * 60 * 60 * 1000,
      };

      storage.set(
        SESSION_KEY,
        session,
      );

      storage.set(
        CURRENT_USER_KEY,
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
        syncUsers();

      const normalizedEmail =
        email
          .trim()
          .toLowerCase();

      const existingUser =
        currentUsers.find(
          (item) =>
            item.email
              .toLowerCase() ===
            normalizedEmail,
        );

      if (existingUser) {
        return false;
      }

      const newUser: User = {
        id: Date.now(),

        name: name.trim(),

        email:
          normalizedEmail,

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

        userId:
          newUser.id,

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
        CURRENT_USER_KEY,
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
        CURRENT_USER_KEY,
      );

      storage.remove(
        SESSION_KEY,
      );

      set({
        user: null,
        session: null,
      });
    },

    isAuthenticated: () => {
      const session =
        get().session;

      const user =
        get().user;

      if (!session || !user) {
        return false;
      }

      const isExpired =
        Date.now() >=
        session.expiresAt;

      if (isExpired) {
        storage.remove(
          SESSION_KEY,
        );

        storage.remove(
          CURRENT_USER_KEY,
        );

        set({
          user: null,
          session: null,
        });

        return false;
      }

      if (
        session.userId !==
        user.id
      ) {
        storage.remove(
          SESSION_KEY,
        );

        storage.remove(
          CURRENT_USER_KEY,
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
