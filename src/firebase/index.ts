'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Valida si la configuración de Firebase tiene los campos mínimos requeridos.
 */
function isConfigValid() {
  return !!(
    firebaseConfig.apiKey &&
    firebaseConfig.authDomain &&
    firebaseConfig.projectId &&
    firebaseConfig.appId
  );
}

/**
 * Inicializa los SDKs de Firebase con verificaciones de seguridad robustas.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  // Si la configuración no es válida (faltan variables de entorno),
  // retornamos nulos para que la UI maneje el error con notificaciones.
  if (!isConfigValid()) {
    console.warn('Firebase: Configuración incompleta. Revisa las variables NEXT_PUBLIC_ en tu entorno.');
    return { firebaseApp: null, auth: null, firestore: null };
  }

  let firebaseApp: FirebaseApp;

  if (!getApps().length) {
    try {
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      console.error('Error crítico al inicializar Firebase:', e);
      return { firebaseApp: null, auth: null, firestore: null };
    }
  } else {
    firebaseApp = getApp();
  }

  return getSdks(firebaseApp);
}

export function getSdks(firebaseApp: FirebaseApp) {
  if (!firebaseApp) return { firebaseApp: null, auth: null, firestore: null };
  
  try {
    return {
      firebaseApp,
      auth: getAuth(firebaseApp),
      firestore: getFirestore(firebaseApp)
    };
  } catch (e) {
    console.error('Error al obtener servicios de Firebase:', e);
    return {
      firebaseApp,
      auth: null,
      firestore: null
    };
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
