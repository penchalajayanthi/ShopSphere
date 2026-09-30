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

/*
 * =====================================================
 * SYNC DEFAULT USERS WITH LOCAL STORAGE
 * =====================================================
 *
 * This is important because users saved in localStorage
 * can become outdated after the default users file changes.
 *
 * Existing registered users are preserved.
 * Default users are synchronized by email so their
 * correct role is restored.
 */
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
        /*
         * Default user does not exist yet.
         */
        mergedUsers.push(
          defaultUser,
        );
      } else {
        /*
         * Keep the existing ID and any locally stored
         * information, but synchronize the predefined
         * user's role, password, name and other fixed data.
         */
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

/*
 * =====================================================
 * INITIAL USERS
 * =====================================================
 */
const storedUsers =
  syncUsers();

/*
 * =====================================================
 * INITIAL SESSION
 * =====================================================
 */
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

/*
 * =====================================================
 * RESTORE SESSION
 * =====================================================
 */
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

    /*
     * If the session exists but its user can no longer
     * be found, remove the invalid session.
     */
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

/*
 * =====================================================
 * AUTH STORE
 * =====================================================
 */
export const useAuthStore =
  create<AuthState>((set, get) => ({
    user: initialUser,

    users: storedUsers,

    session: storedSession,

    /*
     * =================================================
     * LOGIN
     * =================================================
     */
    login: (
      email,
      password,
    ) => {
      /*
       * Sync users again before login so predefined
       * admin/customer roles are always current.
       */
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

      /*
       * Create mock JWT-like session.
       */
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

    /*
     * =================================================
     * REGISTER
     * =================================================
     */
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

      /*
       * All newly registered users are customers.
       */
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

      /*
       * Create session immediately after registration.
       */
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

    /*
     * =================================================
     * LOGOUT
     * =================================================
     */
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

    /*
     * =================================================
     * CHECK AUTHENTICATION
     * =================================================
     */
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

      /*
       * Make sure the session still points to the
       * currently stored user.
       */
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
