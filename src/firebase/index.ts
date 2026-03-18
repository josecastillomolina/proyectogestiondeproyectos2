'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Diagnóstico de configuración en tiempo de ejecución.
 */
if (typeof window !== 'undefined') {
  const envKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const isEnvPresent = !!envKey && envKey !== 'undefined';
  
  console.log('[Firebase Runtime Check]', {
    variableDetectadaEnBundle: isEnvPresent,
    longitudDetectada: envKey?.length || 0,
    llaveLimpia: !!firebaseConfig.apiKey,
    modo: process.env.NODE_ENV
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

  // Validación: Next.js requiere que la llave esté presente durante el BUILD
  if (!apiKey || !apiKey.startsWith('AIza') || apiKey.length < 35) {
    console.error('[Firebase] ERROR DE CONFIGURACIÓN:', {
      causa: !apiKey ? 'Variable NEXT_PUBLIC_FIREBASE_API_KEY no detectada' : 'Formato de llave inválido',
      estado: apiKey ? `Inicia con ${apiKey.substring(0, 4)}... (Largo: ${apiKey.length})` : 'VACÍO',
      accionRequerida: 'Si estás en Netlify, debes hacer "Trigger deploy" -> "Clear cache and deploy site" para que el bundle incluya las nuevas llaves.'
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
    console.error('[Firebase] Error al inicializar:', error);
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
