import { useApp } from './useApp';
import type { User, UserRole, Result, SignupInput } from '../types';

export interface AuthSlice {
  currentUser: User | null;
  currentRole: UserRole | null;
  rememberedEmail: string | null;
  login: (email: string, password: string, role: UserRole, remember: boolean) => Promise<Result>;
  logout: () => Promise<void>;
  signup: (input: SignupInput) => Promise<Result<User>>;
  requestPasswordReset: (email: string) => Promise<Result<string>>;
  resetPassword: (email: string, code: string, newPassword: string) => Promise<Result>;
}

/**
 * Auth lives in AppContext rather than a second provider: sign-up has to check
 * medicines, relationships and caretaker capacity, so splitting the store would
 * mean two providers reading each other's state.
 */
export function useAuth(): AuthSlice {
  const app = useApp();
  return {
    currentUser: app.currentUser,
    currentRole: app.currentRole,
    rememberedEmail: app.rememberedEmail,
    login: app.login,
    logout: app.logout,
    signup: app.signup,
    requestPasswordReset: app.requestPasswordReset,
    resetPassword: app.resetPassword,
  };
}
