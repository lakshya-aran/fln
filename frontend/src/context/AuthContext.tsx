import { createContext, useCallback, useEffect, useReducer, ReactNode } from "react";
import type { User, AuthState } from "@/types";
import { loginService, logoutService, getMeService } from "@/services/auth.service";

interface AuthContextType extends AuthState {
  login: (email: string, password: string, rememberMe: boolean) => Promise<{ redirectPath?: string }>;
  logout: () => Promise<void>;
  setUser: (user: User) => void;
}

type AuthAction =
  | { type: "SET_LOADING"; payload: boolean }
  | { type: "SET_AUTH"; payload: { user: User; accessToken: string } }
  | { type: "LOGOUT" }
  | { type: "SET_USER"; payload: User };

const initialState: AuthState = {
  user: null,
  accessToken: null,
  isAuthenticated: false,
  isLoading: true,
};

function authReducer(state: AuthState, action: AuthAction): AuthState {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "SET_AUTH":
      return {
        ...state,
        user: action.payload.user,
        accessToken: action.payload.accessToken,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGOUT":
      return { ...initialState, isLoading: false };
    case "SET_USER":
      return { ...state, user: action.payload };
    default:
      return state;
  }
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(authReducer, initialState);

  const login = useCallback(
    async (email: string, password: string, rememberMe: boolean) => {
      dispatch({ type: "SET_LOADING", payload: true });
      try {
        const response = await loginService({ email, password });

        const { accessToken, refreshToken, user, redirectPath } = response;

        if (rememberMe) {
          localStorage.setItem("accessToken", accessToken);
          localStorage.setItem("refreshToken", refreshToken);
        } else {
          sessionStorage.setItem("accessToken", accessToken);
          sessionStorage.setItem("refreshToken", refreshToken);
        }

        dispatch({ type: "SET_AUTH", payload: { user, accessToken } });
        return { redirectPath };
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    },
    []
  );

  const logout = useCallback(async () => {
    try {
      await logoutService();
    } catch {
      // ignore logout errors
    } finally {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      sessionStorage.removeItem("accessToken");
      sessionStorage.removeItem("refreshToken");
      dispatch({ type: "LOGOUT" });
    }
  }, []);

  const setUser = useCallback((user: User) => {
    dispatch({ type: "SET_USER", payload: user });
  }, []);

  useEffect(() => {
    async function initAuth() {
      const token =
        localStorage.getItem("accessToken") || sessionStorage.getItem("accessToken");

      if (!token) {
        dispatch({ type: "LOGOUT" });
        return;
      }

      try {
        const response = await getMeService();
        dispatch({
          type: "SET_AUTH",
          payload: { user: response.user, accessToken: token },
        });
      } catch {
        localStorage.removeItem("accessToken");
        localStorage.removeItem("refreshToken");
        sessionStorage.removeItem("accessToken");
        sessionStorage.removeItem("refreshToken");
        dispatch({ type: "LOGOUT" });
      }
    }

    initAuth();
  }, []);

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        setUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}
