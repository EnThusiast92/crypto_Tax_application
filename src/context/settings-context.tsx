
'use client';

import * as React from 'react';
import type { AppSettings, SettingsContextType, FeatureToggles, SiteConfig, StaffPermissions } from '@/lib/types';

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined);

// Default settings
const defaultSettings: AppSettings = {
  toggles: {
    csvImport: true,
    taxReport: true,
    apiSync: false,
  },
  permissions: {
    canManageUsers: false,
    canViewAllTx: true,
  },
  config: {
    logoUrl: '',
    taxRules: 'Standard UK tax regulations apply.',
  },
};

export function SettingsProvider({ children }: { children: React.ReactNode }) {
  const [settings, setSettings] = React.useState<AppSettings>(() => {
    if (typeof window !== 'undefined') {
      const storedSettings = localStorage.getItem('appSettings');
      return storedSettings ? JSON.parse(storedSettings) : defaultSettings;
    }
    return defaultSettings;
  });

  React.useEffect(() => {
    localStorage.setItem('appSettings', JSON.stringify(settings));
  }, [settings]);

  const updateFeatureToggle = (key: keyof FeatureToggles, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      toggles: { ...prev.toggles, [key]: value },
    }));
  };

  const updateSiteConfig = (key: keyof SiteConfig, value: string) => {
    setSettings(prev => ({
      ...prev,
      config: { ...prev.config, [key]: value },
    }));
  };

  const updateStaffPermission = (key: keyof StaffPermissions, value: boolean) => {
    setSettings(prev => ({
      ...prev,
      permissions: { ...prev.permissions, [key]: value },
    }));
  };

  const value = {
    settings,
    updateFeatureToggle,
    updateSiteConfig,
    updateStaffPermission,
  };

  return <SettingsContext.Provider value={value}>{children}</SettingsContext.Provider>;
}

export function useSettings() {
  const context = React.useContext(SettingsContext);
  if (context === undefined) {
    throw new Error('useSettings must be used within a SettingsProvider');
  }
  return context;
}
