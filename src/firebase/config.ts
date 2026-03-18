/**
 * Configuración de Firebase con limpieza automática de llaves.
 * Elimina espacios y comillas accidentales de las variables de entorno.
 */
const rawApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY || '';
const cleanApiKey = rawApiKey.trim().replace(/['"]/g, '');

export const firebaseConfig = {
  apiKey: cleanApiKey,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};
