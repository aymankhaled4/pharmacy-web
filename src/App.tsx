import { useEffect } from "react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "sonner";
import AppRouter from "./router";
import { supabase } from "./core/supabase/supabase.client";
import { useAuthStore } from "./core/auth/auth.store";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: 1,
      staleTime: 1000 * 60 * 5,
    },
  },
});

function AuthListener() {
  useEffect(() => {
    // Listen for session changes (token refresh, sign out)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === "TOKEN_REFRESHED" && session) {
        // Silently update the token in Zustand + axios interceptor will pick it up
        useAuthStore.getState().setToken(session.access_token);
      }
      if (event === "SIGNED_OUT") {
        useAuthStore.getState().clearAuth();
        window.location.href = "/login";
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  return null;
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthListener />
        <AppRouter />
        <Toaster richColors position="top-right" />
      </BrowserRouter>
    </QueryClientProvider>
  );
}
