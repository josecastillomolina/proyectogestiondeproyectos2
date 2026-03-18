'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Diagnóstico seguro de configuración.
 */
export function checkConfig() {
  if (typeof window === 'undefined') return {};
  return {
    hasApiKey: !!firebaseConfig.apiKey && firebaseConfig.apiKey.length > 5,
    hasProjectId: !!firebaseConfig.projectId,
    hasAppId: !!firebaseConfig.appId,
    env: process.env.NODE_ENV
  };
}

/**
 * Inicializa los SDKs de Firebase con validación de entorno.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // Log de diagnóstico para el desarrollador (Visible en consola F12)
  console.log('[Firebase Diagnostic]', checkConfig());

  try {
    let firebaseApp: FirebaseApp;

    if (!getApps().length) {
      // Si la API Key no es válida (ej. undefined o muy corta), Firebase lanzará un error al inicializar
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
    console.error('[Firebase] Error de inicialización crítica:', error);
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
