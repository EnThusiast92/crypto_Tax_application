
'use client';

import * as React from 'react';
import type { AppSettings, SettingsContextType, FeatureToggles, SiteConfig, StaffPermissions } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';

const SettingsContext = React.createContext<SettingsContextType | undefined>(undefined);

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
  const [settings, setSettings] = React.useState<AppSettings>(defaultSettings);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    const settingsRef = doc(db, 'app', 'settings');
    
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) {
            setSettings(docSnap.data() as AppSettings);
        } else {
            // If no settings exist in Firestore, use local defaults.
            // This can happen on first load before the first user is registered.
            setSettings(defaultSettings);
        }
        setLoading(false);
    }, (error) => {
        console.error("Error fetching settings:", error);
        setSettings(defaultSettings); // Fallback to defaults on error
        setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    const settingsRef = doc(db, 'app', 'settings');
    // Using set with merge:true is safe and will create the doc if it doesn't exist.
    await setDoc(settingsRef, newSettings, { merge: true });
  };

  const updateFeatureToggle = (key: keyof FeatureToggles, value: boolean) => {
    const newSettings = { toggles: { ...settings.toggles, [key]: value } };
    updateSettings(newSettings);
  };

  const updateSiteConfig = (key: keyof SiteConfig, value: string) => {
    const newSettings = { config: { ...settings.config, [key]: value } };
    updateSettings(newSettings);
  };

  const updateStaffPermission = (key: keyof StaffPermissions, value: boolean) => {
    const newSettings = { permissions: { ...settings.permissions, [key]: value } };
    updateSettings(newSettings);
  };

  const value = {
    settings,
    loading,
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
