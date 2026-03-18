'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Inicializa los SDKs de Firebase de forma segura para el cliente.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // 1. Diagnóstico de Seguridad (True/False)
  console.log('[Firebase Config Check]', {
    apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  });

  // 2. Validación Individual con Errores Descriptivos
  if (!process.env.NEXT_PUBLIC_FIREBASE_API_KEY) console.error('Falta: NEXT_PUBLIC_FIREBASE_API_KEY');
  if (!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID) console.error('Falta: NEXT_PUBLIC_FIREBASE_PROJECT_ID');
  if (!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN) console.error('Falta: NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN');

  const isValidConfig = firebaseConfig.apiKey && 
                        firebaseConfig.apiKey !== "undefined" && 
                        firebaseConfig.apiKey !== "";

  if (!isValidConfig) {
    console.warn('Firebase: La configuración no está lista. Revisa las variables de entorno NEXT_PUBLIC_ en Netlify.');
    return { firebaseApp: null, auth: null, firestore: null };
  }

  try {
    let firebaseApp: FirebaseApp;

    // Singleton: Evitar múltiples inicializaciones
    if (!getApps().length) {
      firebaseApp = initializeApp(firebaseConfig);
      console.log('Firebase: Inicializado correctamente.');
    } else {
      firebaseApp = getApp();
    }

    return {
      firebaseApp,
      auth: getAuth(firebaseApp),
      firestore: getFirestore(firebaseApp)
    };
  } catch (error) {
    console.error('Error crítico en inicialización de Firebase:', error);
    return { firebaseApp: null, auth: null, firestore: null };
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
