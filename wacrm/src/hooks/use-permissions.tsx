"use client";

import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import { createClient } from "@/lib/supabase/client";
import { useAuth } from "./use-auth";

interface PermissionsContextValue {
  permissions: string[];
  hasPermission: (key: string) => boolean;
  loading: boolean;
}

const PermissionsContext = createContext<PermissionsContextValue | null>(null);

export function PermissionsProvider({ children }: { children: ReactNode }) {
  const [permissions, setPermissions] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { accountId } = useAuth();

  useEffect(() => {
    let mounted = true;

    async function fetchPermissions() {
      if (!accountId) {
        if (mounted) {
          setPermissions([]);
          setLoading(false);
        }
        return;
      }

      setLoading(true);
      const supabase = createClient();
      
      const { data, error } = await supabase.rpc("get_user_permissions", {
        p_account_id: accountId,
      });

      if (error) {
        console.error("Failed to fetch permissions:", error);
      } else if (mounted && data) {
        setPermissions(data as string[]);
      }

      if (mounted) setLoading(false);
    }

    fetchPermissions();

    return () => {
      mounted = false;
    };
  }, [accountId]);

  const hasPermission = (key: string) => permissions.includes(key);

  return (
    <PermissionsContext.Provider value={{ permissions, hasPermission, loading }}>
      {children}
    </PermissionsContext.Provider>
  );
}

export function usePermissions(): PermissionsContextValue {
  const ctx = useContext(PermissionsContext);
  if (!ctx) {
    return { permissions: [], hasPermission: () => false, loading: false };
  }
  return ctx;
}
