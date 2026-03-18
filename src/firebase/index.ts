'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Diagnóstico de API Key para depuración en consola del navegador.
 * Las API Keys válidas de Firebase siempre empiezan con "AIza" y tienen 39 caracteres.
 */
const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
if (typeof window !== 'undefined') {
  console.log('[API Key Debug]', {
    exists: !!apiKey,
    length: apiKey?.length,
    startsWithAIza: apiKey?.startsWith('AIza'),
    first6chars: apiKey?.substring(0, 6),
    last4chars: apiKey?.slice(-4),
  });
}

/**
 * Inicializa los SDKs de Firebase con validación estricta de la API Key.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  try {
    // Validación de formato antes de inicializar
    if (!apiKey || !apiKey.startsWith('AIza') || apiKey.length !== 39) {
      console.error('[Firebase] Error Crítico: La API Key no tiene un formato válido (debe empezar con AIza y tener 39 caracteres).');
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
