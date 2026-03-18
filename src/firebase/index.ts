'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Inicializa los SDKs de Firebase con verificaciones de seguridad.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  let firebaseApp: FirebaseApp;

  // Si no hay API Key, intentamos inicializar pero fallará de forma controlada en los servicios
  if (!getApps().length) {
    try {
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      console.error('Error crítico al inicializar Firebase:', e);
      // Retornamos nulos para que los hooks manejen el estado de "no disponible"
      return { firebaseApp: null, auth: null, firestore: null };
    }
  } else {
    firebaseApp = getApp();
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  if (!firebaseApp) return { firebaseApp: null, auth: null, firestore: null };
  
  try {
    return {
      firebaseApp,
      auth: getAuth(firebaseApp),
      firestore: getFirestore(firebaseApp)
    };
  } catch (e) {
    // Si falla aquí es probablemente por llaves inválidas o faltantes
    return {
      firebaseApp,
      auth: null,
      firestore: null
    };
  }
}

export * from './provider';
export * from './client-provider';
export * from './firestore/use-collection';
export * from './firestore/use-doc';
export * from './non-blocking-updates';
export * from './non-blocking-login';
export * from './errors';
export * from './error-emitter';
