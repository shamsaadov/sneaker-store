import type React from "react";
import { createContext, useContext, useReducer, useEffect } from "react";
import { apiService } from "../utils/api";

interface User {
  id: string;
  email: string;
  name: string;
  role: "admin" | "user";
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
}

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

type AuthAction =
  | { type: "LOGIN_START" }
  | { type: "LOGIN_SUCCESS"; payload: User }
  | { type: "LOGIN_FAILURE"; payload: string }
  | { type: "LOGOUT" }
  | { type: "CLEAR_ERROR" }
  | { type: "SET_LOADING"; payload: boolean };

const authReducer = (state: AuthState, action: AuthAction): AuthState => {
  switch (action.type) {
    case "LOGIN_START":
      return {
        ...state,
        isLoading: true,
        error: null,
      };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: action.payload,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        isAuthenticated: false,
        isLoading: false,
        error: null,
      };
    case "CLEAR_ERROR":
      return {
        ...state,
        error: null,
      };
    case "SET_LOADING":
      return {
        ...state,
        isLoading: action.payload,
      };
    default:
      return state;
  }
};

const initialState: AuthState = {
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Load user from localStorage and validate token on mount
  useEffect(() => {
    const loadUser = async () => {
      dispatch({ type: "SET_LOADING", payload: true });

      try {
        // Check if we have stored auth data
        if (apiService.isAuthenticated()) {
          const storedUser = apiService.getCurrentUser();

          // Validate token by trying to get profile
          try {
            const currentUser = await apiService.getProfile();
            dispatch({ type: "LOGIN_SUCCESS", payload: currentUser });
          } catch (error) {
            // Token is invalid, clear stored data
            console.warn("Stored token is invalid, clearing auth data");
            await apiService.logout();
            dispatch({ type: "LOGOUT" });
          }
        } else {
          dispatch({ type: "LOGOUT" });
        }
      } catch (error) {
        console.error("Error loading user:", error);
        dispatch({ type: "LOGOUT" });
      } finally {
        dispatch({ type: "SET_LOADING", payload: false });
      }
    };

    loadUser();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    dispatch({ type: "LOGIN_START" });

    try {
      const { user } = await apiService.login(email, password);
      dispatch({ type: "LOGIN_SUCCESS", payload: user });
    } catch (error: any) {
      const errorMessage = error.message || "Произошла ошибка при входе";
      dispatch({ type: "LOGIN_FAILURE", payload: errorMessage });
      throw error;
    }
  };

  const logout = async () => {
    dispatch({ type: "SET_LOADING", payload: true });

    try {
      await apiService.logout();
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      dispatch({ type: "LOGOUT" });
    }
  };

  const clearError = () => {
    dispatch({ type: "CLEAR_ERROR" });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        logout,
        clearError,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
