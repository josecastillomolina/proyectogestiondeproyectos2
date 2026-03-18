/**
 * Configuración oficial de Firebase para el Portal Nacional.
 * Se aplican limpiezas básicas para evitar errores de formato en las llaves.
 */
const getEnv = (key: string) => {
  const value = process.env[key];
  if (!value) return '';
  // Elimina comillas accidentales y espacios en blanco
  return value.trim().replace(/^["'](.+)["']$/, '$1');
};

export const firebaseConfig = {
  apiKey: getEnv('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: getEnv('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('NEXT_PUBLIC_FIREBASE_APP_ID'),
};
