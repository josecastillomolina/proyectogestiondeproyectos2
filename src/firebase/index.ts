'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Diagnóstico Avanzado de API Key.
 * Revela si la llave tiene caracteres ocultos o formato incorrecto.
 */
const rawKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;

if (typeof window !== 'undefined') {
  console.log('[KEY RAW DIAGNOSTIC]', {
    value: JSON.stringify(rawKey),
    length: rawKey?.length,
    start: rawKey?.substring(0, 6),
    trimmedLength: rawKey?.trim().length,
  });
}

/**
 * Inicializa los SDKs de Firebase con validación flexible.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  const apiKey = firebaseConfig.apiKey;

  try {
    // Validación flexible: empezar con AIza y tener una longitud razonable (35-45)
    if (!apiKey || !apiKey.startsWith('AIza') || apiKey.length < 35) {
      console.error('[Firebase] Error Crítico: La API Key configurada no parece válida.', {
        keyDetected: apiKey ? `${apiKey.substring(0, 4)}...` : 'null',
        length: apiKey?.length
      });
    }

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
