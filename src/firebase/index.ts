'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Inicializa los SDKs de Firebase de forma segura para el cliente y servidor.
 */
export function initializeFirebase() {
  // Evitar ejecución en el lado del servidor durante el build/SSR
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // Validar configuración mínima para evitar errores de SDK
  // Nota: Verificamos tanto null como el string "undefined" que a veces inyectan los bundlers
  const isConfigIncomplete = !firebaseConfig.apiKey || 
                             firebaseConfig.apiKey === "undefined" || 
                             firebaseConfig.apiKey === "";

  if (isConfigIncomplete) {
    console.warn('Firebase: Configuración incompleta. Verifica las variables de entorno NEXT_PUBLIC_ en Netlify.');
    return { firebaseApp: null, auth: null, firestore: null };
  }

  try {
    let firebaseApp: FirebaseApp;

    if (!getApps().length) {
      firebaseApp = initializeApp(firebaseConfig);
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
