"use client";

import { useEffect, useState } from "react";

export interface CurrentUser {
  id: number;
  name: string;
  email: string;
  role: string;
  createdDate: string;
}

interface UseCurrentUserResult {
  user: CurrentUser | null;
  isLoading: boolean;
  isStaff: boolean;
  refresh: () => Promise<void>;
}

const STAFF_ROLES = new Set(["Admin", "Moderator"]);

export const useCurrentUser = (): UseCurrentUserResult => {
  const [user, setUser] = useState<CurrentUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const load = async () => {
    try {
      const response = await fetch("/api/auth/me");
      if (!response.ok) {
        setUser(null);
        return;
      }
      const data = (await response.json()) as CurrentUser;
      setUser(data);
    } catch {
      setUser(null);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    load();

    const handleAuthChange = () => {
      setIsLoading(true);
      load();
    };

    window.addEventListener("auth:changed", handleAuthChange);
    return () => window.removeEventListener("auth:changed", handleAuthChange);
  }, []);

  return {
    user,
    isLoading,
    isStaff: user ? STAFF_ROLES.has(user.role) : false,
    refresh: load,
  };
};
