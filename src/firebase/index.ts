'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Inicializa los SDKs de Firebase de forma directa y silenciosa.
 * No realiza validaciones de formato que bloqueen el arranque.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // TAREA 1 — DIAGNÓSTICO INMEDIATO
  console.table({
    apiKey_value: process.env.NEXT_PUBLIC_FIREBASE_API_KEY ?? 'UNDEFINED',
    apiKey_length: process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.length ?? 0,
    projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID ?? 'UNDEFINED',
    authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN ?? 'UNDEFINED',
  });

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
    console.warn('[Firebase] No se pudo inicializar el servicio. Verifica tus variables en .env.local');
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
