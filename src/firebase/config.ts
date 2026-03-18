/**
 * Configuración oficial de Firebase para AgendaCitas Nacional CR.
 */
import { initializeApp, getApps, getApp } from 'firebase/app';
import { getAuth } from 'firebase/auth';
import { getFirestore } from 'firebase/firestore';

export const firebaseConfig = {
  apiKey: "AIzaSyDF6Yyl1TYkBBIKdWY_dcvki1F6eLiOuZA",
  authDomain: "agendacitas-nacional.firebaseapp.com",
  projectId: "agendacitas-nacional",
  storageBucket: "agendacitas-nacional.appspot.com",
  messagingSenderId: "4902577265",
  appId: "1:4902577265:web:abc123def456",
};

// Inicialización única compartida
const app = getApps().length === 0 ? initializeApp(firebaseConfig) : getApp();
export const auth = getAuth(app);
export const db = getFirestore(app);
export default app;
