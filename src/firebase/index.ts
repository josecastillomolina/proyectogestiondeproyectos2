'use client';

import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';
import { firebaseConfig } from './config';

/**
 * Inicialización de Firebase con diagnóstico de variables.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // DIAGNÓSTICO DE VARIABLES (F12)
  console.log('=== FIREBASE ENV CHECK ===');
  console.log('CONFIG_API_KEY:', JSON.stringify(firebaseConfig.apiKey));
  console.log('ENV_API_KEY:', JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_API_KEY));
  console.log('PROJECT_ID:', JSON.stringify(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID));
  console.log('==========================');

  try {
    const firebaseApp = getApps().length === 0 
      ? initializeApp(firebaseConfig) 
      : getApp();

    return {
      firebaseApp,
      auth: getAuth(firebaseApp),
      firestore: getFirestore(firebaseApp)
    };
  } catch (error) {
    console.error('[Firebase Init Error]:', error);
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
