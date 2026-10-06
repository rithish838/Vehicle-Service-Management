import { useEffect, useState } from "react";
import { API_BASE_URL, apiFetch } from "../api";
import { AuthContext } from "./auth-context";

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(() => Boolean(localStorage.getItem("autocare-token")));

  useEffect(() => {
    let active = true;
    const token = localStorage.getItem("autocare-token");

    if (!token) {
      return undefined;
    }

    apiFetch("/api/auth/me")
      .then(async (response) => {
        if (!response.ok) {
          throw new Error("Session expired");
        }
        return response.json();
      })
      .then((data) => {
        if (active) setUser(data.user);
      })
      .catch(() => {
        localStorage.removeItem("autocare-token");
        if (active) setUser(null);
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const login = async (credentials) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to sign in");
    }

    localStorage.setItem("autocare-token", data.token);
    setUser(data.user);
    return data.user;
  };

  const register = async (details) => {
    const response = await fetch(`${API_BASE_URL}/api/auth/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(details)
    });
    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.message || "Unable to create customer account");
    }

    localStorage.setItem("autocare-token", data.token);
    setUser(data.user);
    return data.user;
  };

  const logout = () => {
    localStorage.removeItem("autocare-token");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  );
}
