
'use client';

import * as React from 'react';
import type { AppSettings, SettingsContextType, FeatureToggles, SiteConfig, StaffPermissions } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';

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
            const firestoreSettings = docSnap.data() as Partial<AppSettings>;
            // Merge Firestore settings with local defaults to prevent crashes
            const mergedSettings: AppSettings = {
                toggles: { ...defaultSettings.toggles, ...firestoreSettings.toggles },
                permissions: { ...defaultSettings.permissions, ...firestoreSettings.permissions },
                config: { ...defaultSettings.config, ...firestoreSettings.config },
            };
            setSettings(mergedSettings);
        } else {
            console.warn("App settings not found in Firestore. Using local defaults.");
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
    await (await import('firebase/firestore')).setDoc(settingsRef, newSettings, { merge: true });
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
