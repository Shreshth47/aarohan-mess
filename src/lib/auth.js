"use client";

import { createContext, useContext, useEffect, useState, useMemo } from "react";
import { auth } from "@/lib/firebase";
import { onAuthStateChanged, signOut } from "firebase/auth";

const AuthContext = createContext({ user: null, loading: true, logout: () => {} }); // Add logout to default value

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const logout = async () => {
    try {
      await signOut();
      setUser(null); // Clear user state on logout.
    } catch (error) {
      console.error("Logout error in AuthContext:", error);
      throw error; // Re-throw to be handled by the component.
    }
  };

  const value = useMemo(() => ({ user, loading, logout }), [user, loading]); // Add logout to the value

  return <AuthContext.Provider value={value}>{!loading && children}</AuthContext.Provider>;
};

export const useAuth = () => useContext(AuthContext);