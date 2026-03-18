
/**
 * Configuración de Firebase con limpieza profunda.
 * Asegura que no se cuelen comillas o espacios de los archivos .env o Netlify.
 */
const getCleanEnv = (key: string | undefined) => {
  if (!key || key === 'undefined' || key === 'null' || key.trim() === '') {
    return '';
  }
  // Elimina espacios, comillas simples/dobles, prefijos accidentales de copia y caracteres de escape
  return key
    .trim()
    .replace(/['"\s\\]/g, '')
    .replace(/^apiKey:\s*/, ''); // Por si alguien copió "apiKey: AIza..."
};

export const firebaseConfig = {
  apiKey: getCleanEnv(process.env.NEXT_PUBLIC_FIREBASE_API_KEY),
  authDomain: getCleanEnv(process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN),
  projectId: getCleanEnv(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID),
  storageBucket: getCleanEnv(process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET),
  messagingSenderId: getCleanEnv(process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID),
  appId: getCleanEnv(process.env.NEXT_PUBLIC_FIREBASE_APP_ID),
};
