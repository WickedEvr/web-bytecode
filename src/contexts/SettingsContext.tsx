import React, { createContext, useContext, useEffect, useState } from 'react';
import { apiRequest } from '../lib/api';

export type ContactInfo = {
  email: string;
  phone_1: string;
  phone_2: string;
  address: string;
};

export type Features = {
  enable_quotes: boolean;
  enable_chat: boolean;
};

export type PublicSettings = {
  contact_info?: ContactInfo;
  features?: Features;
};

interface SettingsContextType {
  settings: PublicSettings | null;
  isLoading: boolean;
  error: string | null;
}

const SettingsContext = createContext<SettingsContextType>({
  settings: null,
  isLoading: true,
  error: null,
});

export const SettingsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [settings, setSettings] = useState<PublicSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchSettings = async () => {
      try {
        const response = await apiRequest<{ data: PublicSettings }>('/public/settings');
        if (isMounted) {
          setSettings(response.data);
          setError(null);
        }
      } catch (err) {
        if (isMounted) {
          console.error('Failed to fetch public settings:', err);
          setError(err instanceof Error ? err.message : 'Unknown error');
        }
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    fetchSettings();

    return () => {
      isMounted = false;
    };
  }, []);

  return (
    <SettingsContext.Provider value={{ settings, isLoading, error }}>
      {children}
    </SettingsContext.Provider>
  );
};

export const useSettings = () => useContext(SettingsContext);
