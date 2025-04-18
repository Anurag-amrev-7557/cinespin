import React, { createContext, useContext, useEffect, useState, useCallback, useMemo } from "react";
import { onAuthStateChanged, signOut, updateProfile } from "firebase/auth";
import { auth } from "../../firebase";

const AuthContext = createContext({
  user: null,
  loading: true,
  isAuthenticated: false,
  logout: async () => {},
  updateUserProfile: async () => {},
});

/**
 * AuthProvider wraps the app and provides auth state.
 * @param {{ children: React.ReactNode }} props
 */
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  const logout = useCallback(async () => {
    try {
      await signOut(auth);
      setUser(null);
      if (process.env.NODE_ENV !== "production") {
        console.log("[Auth] User logged out");
      }
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
          if (user && process.env.NODE_ENV !== "production") {
            console.log("[Auth] Auth state changed:", auth.currentUser);
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

  const value = useMemo(() => ({
    user,
    loading,
    isAuthenticated: !!user,
    logout,
    updateUserProfile,
  }), [user, loading, logout]);

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

/**
 * Updates the current user's Firebase profile.
 * @param {Object} param0
 * @param {string} param0.displayName
 * @param {string} param0.photoURL
 * @returns {Promise<void>}
 */
const updateUserProfile = async ({ displayName, photoURL }) => {
  if (!auth.currentUser) throw new Error("No user logged in");
  if (!displayName && !photoURL) {
    throw new Error("At least one of displayName or photoURL must be provided");
  }
  try {
    return updateProfile(auth.currentUser, {
      displayName,
      photoURL,
    });
  } catch (error) {
    console.error("Profile update failed:", error);
    throw error;
  }
};

export const useAuth = () => useContext(AuthContext);
export default AuthContext;