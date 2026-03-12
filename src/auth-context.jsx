import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase.js";

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchProfile = useCallback(async (userId) => {
    const { data } = await supabase
      .from("profiles")
      .select("role, banned, display_name")
      .eq("id", userId)
      .maybeSingle();
    if (data?.banned) {
      await supabase.auth.signOut();
      setUser(null);
      setSession(null);
      setSubscription(null);
      setProfile(null);
      setLoading(false);
      return;
    }
    setProfile(data ?? null);
  }, []);

  const fetchSubscription = useCallback(async (userId) => {
    const { data } = await supabase
      .from("subscriptions")
      .select("status, current_period_end, stripe_customer_id, cancel_at_period_end")
      .eq("user_id", userId)
      .maybeSingle();
    setSubscription(data ?? null);
    setLoading(false);
  }, []);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session: s } }) => {
      setSession(s);
      setUser(s?.user ?? null);
      if (s?.user) {
        fetchProfile(s.user.id);
        fetchSubscription(s.user.id);
      } else setLoading(false);
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) {
          fetchProfile(s.user.id);
          fetchSubscription(s.user.id);
        } else {
          setSubscription(null);
          setProfile(null);
          setLoading(false);
        }
      }
    );

    return () => authSub.unsubscribe();
  }, [fetchProfile, fetchSubscription]);

  const isPro = subscription?.status === "active" &&
    new Date(subscription.current_period_end) > new Date();

  const isAdmin = profile?.role === "admin";

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setSubscription(null);
    setProfile(null);
  };

  const refreshSubscription = useCallback(() => {
    if (user) fetchSubscription(user.id);
  }, [user, fetchSubscription]);

  const refreshProfile = useCallback(() => {
    if (user) fetchProfile(user.id);
  }, [user, fetchProfile]);

  return (
    <AuthCtx.Provider value={{ user, session, subscription, profile, isPro, isAdmin, loading, signOut, refreshSubscription, refreshProfile }}>
      {children}
    </AuthCtx.Provider>
  );
}
