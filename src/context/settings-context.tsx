
'use client';

import * as React from 'react';
import type { AppSettings, SettingsContextType, FeatureToggles, SiteConfig, StaffPermissions } from '@/lib/types';
import { db } from '@/lib/firebase';
import { doc, getDoc, setDoc, onSnapshot } from 'firebase/firestore';
import { useAuth } from './auth-context';

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
  const { isFirebaseReady } = useAuth();

  React.useEffect(() => {
    if (!isFirebaseReady) return;

    const settingsRef = doc(db, 'app', 'settings');
    
    const unsubscribe = onSnapshot(settingsRef, (docSnap) => {
        if (docSnap.exists()) {
            setSettings(docSnap.data() as AppSettings);
        } else {
            // If no settings exist in Firestore, initialize with defaults
            setDoc(settingsRef, defaultSettings).catch(err => console.error("Failed to initialize settings", err));
        }
    });

    return () => unsubscribe();
  }, [isFirebaseReady]);

  const updateSettings = async (newSettings: AppSettings) => {
    const settingsRef = doc(db, 'app', 'settings');
    await setDoc(settingsRef, newSettings, { merge: true });
    // Firestore listener will update the state
  };

  const updateFeatureToggle = (key: keyof FeatureToggles, value: boolean) => {
    const newSettings = { ...settings, toggles: { ...settings.toggles, [key]: value } };
    updateSettings(newSettings);
  };

  const updateSiteConfig = (key: keyof SiteConfig, value: string) => {
    const newSettings = { ...settings, config: { ...settings.config, [key]: value } };
    updateSettings(newSettings);
  };

  const updateStaffPermission = (key: keyof StaffPermissions, value: boolean) => {
    const newSettings = { ...settings, permissions: { ...settings.permissions, [key]: value } };
    updateSettings(newSettings);
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
