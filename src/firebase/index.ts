'use client';

import { firebaseConfig } from '@/firebase/config';
import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

/**
 * Initializes Firebase SDKs with safety checks for SSR and missing configuration.
 */
export function initializeFirebase() {
  if (typeof window === 'undefined') {
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
    };
  }

  // Pre-check: If API Key is missing, return nulls safely instead of crashing later
  if (!firebaseConfig.apiKey) {
    console.warn('⚠️ Firebase: NEXT_PUBLIC_FIREBASE_API_KEY is missing. Check your Netlify environment variables.');
    return {
      firebaseApp: null,
      auth: null,
      firestore: null,
    };
  }

  let firebaseApp: FirebaseApp;

  if (!getApps().length) {
    try {
      firebaseApp = initializeApp(firebaseConfig);
    } catch (e) {
      console.error('Firebase initialization error:', e);
      return {
        firebaseApp: null,
        auth: null,
        firestore: null,
      };
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
    console.error("⚠️ Firebase: Error initializing services:", e);
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
