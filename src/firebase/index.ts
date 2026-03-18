
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Inicializa los SDKs de Firebase de forma segura para el cliente.
 * Incluye diagnósticos para variables de entorno en Netlify.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // Diagnóstico de Seguridad: Imprime true/false para cada variable requerida.
  // Esto ayuda a confirmar si Netlify está exponiendo las llaves al cliente.
  console.log('[Firebase Config Check]', {
    apiKey: !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    authDomain: !!process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: !!process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
    appId: !!process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
    messagingSenderId: !!process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  });

  const isValidConfig = process.env.NEXT_PUBLIC_FIREBASE_API_KEY && 
                        process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "undefined" && 
                        process.env.NEXT_PUBLIC_FIREBASE_API_KEY !== "";

  if (!isValidConfig) {
    console.warn('Firebase: La configuración no está lista. Revisa las variables NEXT_PUBLIC_ en el panel de Netlify y haz un re-deploy.');
    return { firebaseApp: null, auth: null, firestore: null };
  }

  try {
    let firebaseApp: FirebaseApp;

    if (!getApps().length) {
      firebaseApp = initializeApp(firebaseConfig);
      console.log('Firebase: Inicializado correctamente en el cliente.');
    } else {
      firebaseApp = getApp();
    }

    return {
      firebaseApp,
      auth: getAuth(firebaseApp),
      firestore: getFirestore(firebaseApp)
    };
  } catch (error) {
    console.error('Error crítico en la inicialización de Firebase:', error);
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
