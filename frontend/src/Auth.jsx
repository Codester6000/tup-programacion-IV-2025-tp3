import { createContext, useContext, useState } from "react";

const AuthContext = createContext(null);

export const useAuth = () => {
  return useContext(AuthContext);
};

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(null);
  const [username, setUsername] = useState(null);
  const [error, setError] = useState(null);

  const login = async (username, password) => {
    setError(null);
    try {
      const response = await fetch("http://localhost:3000/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: username, password }),
      });

      const session = await response.json();

      if (!response.ok && response.status === 400) {
        throw new Error("Usuario o contraseña inválida");
      }

      setToken(session.token);
      setUsername(session.email);
      return { success: true };
    } catch (err) {
      setError(err.message || "Usuario o contraseña inválida");
      return { success: false };
    }
  };

  const logout = () => {
    setToken(null);
    setUsername(null);
    setError(null);
  };

  const fetchAuth = async (url, options = {}) => {
    if (!token) {
      throw new Error("No esta iniciada la session");
    }

    return fetch(url, {
      ...options,
      headers: { ...options.headers, Authorization: `Bearer ${token}` },
    });
  };

  return (
    <AuthContext.Provider
      value={{
        token,
        username,
        error,
        isAuthenticated: !!token,
        login,
        logout,
        fetchAuth,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const AuthPage = ({ children }) => {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    return <h2>Ingrese para ver esta pagina</h2>;
  }

  return children;
};
