
'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

/**
 * Diagnóstico extendido de configuración.
 * Esto ayuda a identificar si las variables de entorno están llegando al cliente.
 */
if (typeof window !== 'undefined') {
  const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  const isPresent = !!apiKey && apiKey !== 'undefined' && apiKey.length > 0;
  
  if (!isPresent) {
    console.warn('%c[Firebase Diagnostic] VARIABLE FALTANTE', 'color: #e67e22; font-weight: bold;', 
      'La variable NEXT_PUBLIC_FIREBASE_API_KEY no se detecta en el bundle del cliente. ' +
      'Si estás en Netlify, realiza un "Deploy project without cache".');
  } else {
    console.log('%c[Firebase Diagnostic] CONFIGURACIÓN CARGADA', 'color: #27ae60; font-weight: bold;', {
      longitud: apiKey?.length,
      valido: apiKey?.startsWith('AIza') && apiKey.length >= 35,
    });
  }
}

/**
 * Inicializa los SDKs de Firebase de forma segura.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  const { apiKey } = firebaseConfig;

  // Validación crítica: Si no hay API Key o es inválida, informamos pero no rompemos el renderizado
  if (!apiKey || !apiKey.startsWith('AIza') || apiKey.length < 35) {
    console.error('%c[Firebase] ERROR DE CONFIGURACIÓN CRÍTICO', 'color: #e74c3c; font-size: 16px; font-weight: bold;');
    console.table({
      'Problema': !apiKey ? 'Variable de entorno no encontrada' : 'Formato de llave inválido',
      'Valor Detectado': apiKey ? `${apiKey.substring(0, 4)}...` : 'VACÍO',
      'Causa Probable': 'Las variables se agregaron a Netlify después del último despliegue.',
      'Acción Requerida': 'Netlify: Trigger deploy -> Deploy project without cache'
    });
    
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
    console.error('[Firebase] Fallo al inicializar SDKs:', error);
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
