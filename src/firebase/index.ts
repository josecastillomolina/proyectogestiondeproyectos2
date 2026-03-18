'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Diagnóstico Avanzado de API Key.
 */
if (typeof window !== 'undefined') {
  const rawKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  console.log('[Firebase Key Diagnostic]', {
    hasKey: !!rawKey,
    length: rawKey?.length || 0,
    prefix: rawKey?.substring(0, 4),
    isClean: rawKey === firebaseConfig.apiKey,
    cleanLength: firebaseConfig.apiKey.length
  });
}

/**
 * Inicializa los SDKs de Firebase.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  const { apiKey } = firebaseConfig;

  // Validación flexible: empezar con AIza y tener una longitud razonable
  if (!apiKey || !apiKey.startsWith('AIza') || apiKey.length < 35) {
    console.error('[Firebase] Error Crítico: La API Key no tiene un formato válido.', {
      detected: apiKey ? `${apiKey.substring(0, 4)}...` : 'vía env',
      length: apiKey?.length || 0,
      solucion: 'Verifica que NEXT_PUBLIC_FIREBASE_API_KEY en .env.local empiece con AIza y no tenga comillas.'
    });
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
    console.error('[Firebase] Error de inicialización:', error);
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
