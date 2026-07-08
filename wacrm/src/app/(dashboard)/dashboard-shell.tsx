"use client";

import { useCallback, useEffect, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { PermissionsProvider, usePermissions } from "@/hooks/use-permissions";
import { Sidebar } from "@/components/layout/sidebar";
import { Header } from "@/components/layout/header";
import { PresenceHeartbeat } from "@/components/presence/presence-heartbeat";
import { ShieldAlert } from "lucide-react";

// Auth-gated dashboard shell. Extracted from the layout so the layout
// itself can stay a server component and export metadata (noindex) —
// client components can't export Next's metadata object.

function DashboardShellInner({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const { hasPermission } = usePermissions();

  const ROUTE_PERMISSIONS: Record<string, string> = {
    '/inbox': 'inbox.view',
    '/contacts': 'contacts.view',
    '/pipelines': 'pipelines.view',
    '/broadcasts': 'broadcasts.view',
    '/automations': 'automations.view',
    '/flows': 'automations.view',
    '/shop': 'store.view',
  };

  // Check if the current route requires a permission the user doesn't have
  const requiredPermission = Object.entries(ROUTE_PERMISSIONS).find(([route]) => pathname.startsWith(route))?.[1];
  const isAccessDenied = requiredPermission && !hasPermission(requiredPermission);

  // Sidebar drawer state — only used on mobile. On lg+ the sidebar is
  // always visible and this stays at `false` (ignored by the component).
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const closeSidebar = useCallback(() => setSidebarOpen(false), []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login");
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex h-screen items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-3">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
          <p className="text-sm text-muted-foreground">Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="flex h-screen overflow-hidden bg-background">
      {/* Reports this tab's online/away presence once we know a user is
          signed in. Headless — renders nothing. */}
      <PresenceHeartbeat />
      <Sidebar open={sidebarOpen} onClose={closeSidebar} />
      <div className="flex flex-1 flex-col overflow-hidden">
        <Header onOpenSidebar={() => setSidebarOpen(true)} />
        {/* Thinner horizontal padding on mobile so cards have room to breathe. */}
        <main className="flex-1 overflow-y-auto p-4 sm:p-6">
          {isAccessDenied ? (
            <div className="flex h-full flex-col items-center justify-center space-y-4 text-center">
              <div className="rounded-full bg-destructive/10 p-4">
                <ShieldAlert className="h-8 w-8 text-destructive" />
              </div>
              <div className="max-w-md space-y-2">
                <h2 className="text-2xl font-bold tracking-tight">Access Denied</h2>
                <p className="text-muted-foreground">
                  You don't have the required permissions or active module for this page. Please upgrade your SaaS plan or contact your workspace owner.
                </p>
              </div>
            </div>
          ) : (
            children
          )}
        </main>
      </div>
    </div>
  );
}

export function DashboardShell({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <PermissionsProvider>
        <DashboardShellInner>{children}</DashboardShellInner>
      </PermissionsProvider>
    </AuthProvider>
  );
}
