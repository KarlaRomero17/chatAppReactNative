// Inicialización de Firebase (Web SDK) para usar con Expo Go
import { initializeApp, getApp, getApps } from 'firebase/app';
import { getDatabase, ref, push, set, onValue, update, serverTimestamp} from 'firebase/database';
import { getAnalytics } from "firebase/analytics";
import { getAuth, signOut, initializeAuth, getReactNativePersistence } from 'firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';

// Configuración tomada de los archivos que subiste (ajusta si es necesario)
const firebaseConfig = {

  apiKey: "AIzaSyCtc3t-OB5FiHIw8L7aTO9dlBPUGxRkQSg",

  authDomain: "chatreact-56080.firebaseapp.com",

  databaseURL: "https://chatreact-56080-default-rtdb.firebaseio.com",

  projectId: "chatreact-56080",

  storageBucket: "chatreact-56080.firebasestorage.app",

  messagingSenderId: "1029939910485",

  appId: "1:1029939910485:web:4ad606c87f10da761f81dc",

  measurementId: "G-DDPM9X5H4B"

};

const app = getApps().length > 0 ? getApp() : initializeApp(firebaseConfig);
const db = getDatabase(app);

let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (error) {
  if (error.code === 'auth/already-initialized') {
    auth = getAuth(app);
  } else {
    console.error("Error inicializando Auth:", error);
    throw error;
  }
}

export async function sendMessageWeb(mensaje) {
  try {
    const mensajesRef = ref(db, 'mensajes');
    const newRef = push(mensajesRef);
    await set(newRef, mensaje);
    return { success: true };
  } catch (error) {
    console.error('sendMessageWeb error', error);
    return { success: false, error };
  }
};

export function subscribeMensajesWeb(callback) {
  const mensajesRef = ref(db, 'mensajes');
  const listener = onValue(mensajesRef, snapshot => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    const arr = Array.isArray(data)
      ? data.map((m, i) => ({ id: i, ...m }))
      : Object.keys(data).map(k => ({ id: k, ...data[k] }));
    callback(arr);
  });

  return () => ref(db, 'mensajes').off('value', listener);
};

export const signOutWeb = async () => {
  try {
    await signOut(auth);
    console.log('Sesión cerrada exitosamente en Firebase');
    return true;
  } catch (error) {
    console.error('Error al cerrar sesión en Firebase:', error);
    throw error;
  }
};

export const updateMessageWeb = async (messageId, newText) => {
  try {
    const messageRef = ref(db, 'mensajes/' + messageId);
    const updates = {
      texto: newText,
      editadoEn: serverTimestamp()
    };
    await update(messageRef, updates);
    return { success: true };
  } catch (error) {
    console.error('updateMessageWeb error', error);
    return { success: false, error };
  }
};

//Función para eliminar

export default { auth, db };