import { initializeApp, getApps, getApp, FirebaseApp } from 'firebase/app';
import { getAuth, Auth } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
};

let app: FirebaseApp;
let auth: Auth;
let db: Firestore;

// Inicialización ultra-segura
const isConfigValid = !!firebaseConfig.apiKey && firebaseConfig.apiKey !== 'undefined';

if (!getApps().length) {
  if (isConfigValid) {
    app = initializeApp(firebaseConfig);
  } else {
    // Fallback para evitar el error de API Key inválida durante el despliegue inicial
    app = initializeApp({ apiKey: "temporary-key", projectId: "temporary-id" });
  }
} else {
  app = getApp();
}

auth = getAuth(app);
db = getFirestore(app);

export { auth, db };
export default app;
