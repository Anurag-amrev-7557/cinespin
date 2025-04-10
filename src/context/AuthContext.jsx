import React, { createContext, useContext, useEffect, useState, useCallback } from "react";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { auth } from "../../firebase";

const AuthContext = createContext();

const updateUserProfile = async ({ displayName, photoURL }) => {
  if (!auth.currentUser) throw new Error("No user logged in");
  return updateProfile(auth.currentUser, {
    displayName,
    photoURL,
  });
};

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
    } catch (error) {
      console.error("Logout failed:", error);
    }
  }, []);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      try {
        if (user) {
          await user.reload();
          setUser(auth.currentUser);
          if (process.env.NODE_ENV === "development") {
            console.log("Auth state changed:", auth.currentUser);
          }
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error("Auth state listener error:", error);
      } finally {
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
    };
  }, []);

  const value = {
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    updateUserProfile,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};