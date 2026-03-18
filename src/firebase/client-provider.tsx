'use client';

import React, { useMemo, type ReactNode } from 'react';
import { FirebaseProvider } from '@/firebase/provider';
import { auth, db, default as firebaseApp } from '@/firebase/config';

interface FirebaseClientProviderProps {
  children: ReactNode;
}

export function FirebaseClientProvider({ children }: FirebaseClientProviderProps) {
  const firebaseServices = useMemo(() => {
    try {
      // Retornamos las instancias exportadas directamente para mayor estabilidad
      return { firebaseApp, auth, firestore: db };
    } catch (e) {
      console.warn('[Firebase] Error de inicialización:', e);
      return { firebaseApp: null, auth: null, firestore: null };
    }
  }, []);

  return (
    <FirebaseProvider
      firebaseApp={firebaseServices.firebaseApp}
      auth={firebaseServices.auth}
      firestore={firebaseServices.firestore}
    >
      {children}
    </FirebaseProvider>
  );
}
