/**
 * Configuración oficial de Firebase para el Portal Nacional.
 * Se ha hardcodeado temporalmente la API Key para diagnosticar fallos de lectura en .env.local.
 */

export const firebaseConfig = {
  // Hardcodeado temporalmente para saltar el error de 'undefined' en Firebase Studio
  apiKey: "AIzaSyDF6Yyl1TYkBBIKdWY_dcvki1F6eLiOuZA",
  authDomain: "agendacitas-nacional.firebaseapp.com",
  projectId: "agendacitas-nacional",
  storageBucket: "agendacitas-nacional.appspot.com",
  messagingSenderId: "4902577265",
  appId: "1:4902577265:web:8655c6f37626926978430a",
};
