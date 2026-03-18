'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Inicializa los SDKs de Firebase de forma directa y silenciosa.
 * Incluye una tabla de diagnóstico para verificar las variables de entorno en el navegador.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // DIAGNÓSTICO: Revisa esto en la consola del navegador (F12)
  console.log('%c[Firebase Diagnostic]', 'color: #3498db; font-weight: bold; font-size: 14px;');
  console.table({
    'API Key detectada': !!process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
    'Largo de Key': process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.length || 0,
    'Empieza con AIza': process.env.NEXT_PUBLIC_FIREBASE_API_KEY?.startsWith('AIza') || false,
    'Project ID': process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'MISSING',
    'Auth Domain': process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'MISSING',
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
    console.warn('[Firebase] Fallo al inicializar. Revisa la tabla de arriba.');
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
