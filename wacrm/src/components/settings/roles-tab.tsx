'use client';

import { SettingsPanelHead } from './settings-panel-head';
import { Card, CardContent } from '@/components/ui/card';
import { Shield } from 'lucide-react';
import { usePermissions } from '@/hooks/use-permissions';

export function RolesTab() {
  const { permissions, loading } = usePermissions();

  return (
    <section className="animate-in fade-in-50 space-y-6 duration-200">
      <SettingsPanelHead
        title="Roles & Permissions"
        description="View and manage the roles available in your workspace."
      />

      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-3 mb-6">
            <Shield className="h-5 w-5 text-indigo-500" />
            <h3 className="text-lg font-medium text-foreground">Your Active Permissions</h3>
          </div>
          
          {loading ? (
            <div className="text-sm text-muted-foreground">Loading your permissions...</div>
          ) : (
            <div className="flex flex-wrap gap-2">
              {permissions.length === 0 ? (
                <div className="text-sm text-muted-foreground">No permissions granted.</div>
              ) : (
                permissions.map((p) => (
                  <span key={p} className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 border border-indigo-200">
                    {p}
                  </span>
                ))
              )}
            </div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6 text-center text-muted-foreground">
          <Shield className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">Custom Role Builder</h3>
          <p className="text-sm max-w-sm mx-auto">
            The Custom Role Builder is an Enterprise feature. Please contact sales to enable custom roles for your workspace.
          </p>
        </CardContent>
      </Card>
    </section>
  );
}
