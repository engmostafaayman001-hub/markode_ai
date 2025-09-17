import { useQuery } from "@tanstack/react-query";
import type { User } from "@shared/schema.ts";

/**
 * Custom hook to fetch authenticated user information.
 * Returns the user object, loading state, and authentication status.
 */
export function useAuth() {
  const { data: user, isLoading, error } = useQuery<User>({
    queryKey: ["/api/auth/user"], // Unique key for caching this query
    queryFn: async () => {
      const response = await fetch("/api/auth/user");
      if (!response.ok) {
        throw new Error("Failed to fetch user");
      }
      return response.json() as Promise<User>;
    },
    retry: false, // Don't retry on failure
  });

  return {
    user,
    isLoading,
    isAuthenticated: !!user,
    error, // Optional: expose error if needed
  };
}
