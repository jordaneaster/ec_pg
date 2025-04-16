import React, { createContext, useContext, useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';

// Initialize Supabase client (ensure this is done correctly)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabase = createClient(supabaseUrl, supabaseKey);

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth state changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_event, session) => {
        setSession(session);
        setUser(session?.user ?? null);
        setLoading(false); // Ensure loading is set to false here too
      }
    );

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign up function
  const signUp = async (email, password) => {
    setLoading(true);
    // Pass credentials as an object
    const response = await supabase.auth.signUp({ email, password });
    setLoading(false);
    return response;
  };

  // Sign in function
  const signInWithPassword = async (email, password) => {
    setLoading(true);
    // Pass credentials as an object
    const response = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    return response;
  };

  // Sign out function
  const signOut = async () => {
    setLoading(true);
    const response = await supabase.auth.signOut();
    setLoading(false);
    return response;
  };

  const value = {
    user,
    session,
    signUp,
    signInWithPassword,
    signOut,
    loading, // Expose loading state if needed by components
  };

  return (
    <AuthContext.Provider value={value}>
      {!loading && children} {/* Optionally render children only when not loading initial state */}
    </AuthContext.Provider>
  );
}

// Custom hook to use the auth context
export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
