import { createContext, useContext, useState, useEffect, useCallback } from "react";
import { supabase } from "./supabase.js";

const AuthCtx = createContext();
export const useAuth = () => useContext(AuthCtx);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [subscription, setSubscription] = useState(null);
  const [loading, setLoading] = useState(true);

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
      if (s?.user) fetchSubscription(s.user.id);
      else setLoading(false);
    });

    const { data: { subscription: authSub } } = supabase.auth.onAuthStateChange(
      (_event, s) => {
        setSession(s);
        setUser(s?.user ?? null);
        if (s?.user) fetchSubscription(s.user.id);
        else { setSubscription(null); setLoading(false); }
      }
    );

    return () => authSub.unsubscribe();
  }, [fetchSubscription]);

  const isPro = subscription?.status === "active" &&
    new Date(subscription.current_period_end) > new Date();

  const signOut = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
    setSubscription(null);
  };

  const refreshSubscription = useCallback(() => {
    if (user) fetchSubscription(user.id);
  }, [user, fetchSubscription]);

  return (
    <AuthCtx.Provider value={{ user, session, subscription, isPro, loading, signOut, refreshSubscription }}>
      {children}
    </AuthCtx.Provider>
  );
}
