/**
 * Configuración oficial de Firebase para el Portal Nacional.
 * Implementa una limpieza agresiva para asegurar que no se cuelen comillas, comas o espacios.
 */
const cleanEnvValue = (key: string) => {
  const value = process.env[key];
  if (!value) return '';
  
  return value
    .trim() // Elimina espacios en blanco
    .replace(/['",]/g, '') // Elimina comillas simples, dobles y comas accidentales
    .replace(/^apiKey:\s*/, ''); // Por si se copió el nombre del campo "apiKey: ..."
};

export const firebaseConfig = {
  apiKey: cleanEnvValue('NEXT_PUBLIC_FIREBASE_API_KEY'),
  authDomain: cleanEnvValue('NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN'),
  projectId: cleanEnvValue('NEXT_PUBLIC_FIREBASE_PROJECT_ID'),
  storageBucket: cleanEnvValue('NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: cleanEnvValue('NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID'),
  appId: cleanEnvValue('NEXT_PUBLIC_FIREBASE_APP_ID'),
};
