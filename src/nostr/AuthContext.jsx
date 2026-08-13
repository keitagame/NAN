import { createContext, useContext, useMemo, useState, useCallback } from "react";
import { NostrService } from "./service";
import { fetchProfile } from "./relayPool";

const AuthContext = createContext(null);

// Single shared service instance for the whole app lifetime.
const nostr = new NostrService();

export function AuthProvider({ children }) {
  const [pubkey, setPubkey] = useState(nostr.pk);
  const [profile, setProfile] = useState(null);
  const [profileLoading, setProfileLoading] = useState(false);

  const refreshProfile = useCallback(async (pk) => {
    if (!pk) {
      setProfile(null);
      return;
    }
    setProfileLoading(true);
    try {
      const p = await fetchProfile(pk);
      setProfile(p);
    } catch (err) {
      console.error("Failed to load profile:", err);
    } finally {
      setProfileLoading(false);
    }
  }, []);

  const login = useCallback(
    (keys) => {
      setPubkey(keys.pk);
      refreshProfile(keys.pk);
    },
    [refreshProfile]
  );

  const generateKeys = useCallback(() => {
    const keys = nostr.generateKeys();
    login(keys);
    return keys;
  }, [login]);

  const importKey = useCallback(
    (input) => {
      const keys = nostr.importKey(input);
      login(keys);
      return keys;
    },
    [login]
  );

  const logout = useCallback(() => {
    nostr.logout();
    setPubkey(null);
    setProfile(null);
  }, []);

  // On first mount, if a key was restored from localStorage, load its profile.
  useState(() => {
    if (nostr.pk) {
      refreshProfile(nostr.pk);
    }
  });

  const value = useMemo(
    () => ({
      nostr,
      pubkey,
      profile,
      profileLoading,
      isLoggedIn: Boolean(pubkey),
      generateKeys,
      importKey,
      logout,
      refreshProfile: () => refreshProfile(pubkey),
    }),
    [pubkey, profile, profileLoading, generateKeys, importKey, logout, refreshProfile]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return ctx;
}
