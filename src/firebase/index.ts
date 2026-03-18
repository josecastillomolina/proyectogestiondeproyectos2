
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
  
  console.log('%c[Firebase Config Debug]', 'color: #f39c12; font-weight: bold;', {
    variablePresente: isPresent,
    longitud: apiKey?.length || 0,
    empiezaConAIza: apiKey?.startsWith('AIza') || false,
    mensaje: isPresent 
      ? 'La llave parece estar cargada correctamente.' 
      : 'ADVERTENCIA: La variable NEXT_PUBLIC_FIREBASE_API_KEY está VACÍA en el bundle del navegador.'
  });
}

/**
 * Inicializa los SDKs de Firebase de forma segura.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return { firebaseApp: null, auth: null, firestore: null };
  }

  const { apiKey } = firebaseConfig;

  // Validación crítica: Si no hay API Key, informamos al usuario qué hacer en Netlify
  if (!apiKey || !apiKey.startsWith('AIza') || apiKey.length < 35) {
    console.error('%c[Firebase] ERROR DE CONFIGURACIÓN CRÍTICO', 'color: #e74c3c; font-size: 16px; font-weight: bold;');
    console.table({
      'Problema Detectado': !apiKey ? 'Variable no encontrada' : 'Formato de llave inválido',
      'Valor Actual': apiKey ? `Inicia con ${apiKey.substring(0, 4)}...` : 'VACÍO',
      'Acción Requerida': 'En Netlify: Trigger deploy -> Deploy project without cache'
    });
    
    // Devolvemos nulos para evitar que initializeApp lance una excepción fatal
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
