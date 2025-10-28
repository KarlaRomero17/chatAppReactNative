// Inicialización de Firebase (Web SDK) para usar con Expo Go
import { initializeApp } from 'firebase/app';
import { getDatabase, ref, push, set, onValue } from 'firebase/database';
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


const app = initializeApp(firebaseConfig);
const db = getDatabase(app);

const auth = initializeAuth(app, {
  persistence: getReactNativePersistence(AsyncStorage)
});

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
}

export function subscribeMensajesWeb(callback) {
  const mensajesRef = ref(db, 'mensajes');
  const listener = onValue(mensajesRef, snapshot => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    // data may be an array or object depending on how it was stored
    const arr = Array.isArray(data)
      ? data.map((m, i) => ({ id: i, ...m }))
      : Object.keys(data).map(k => ({ id: k, ...data[k] }));
    callback(arr);
  });

  // onValue doesn't return unsubscribe directly; return a function to call off
  return () => mensajesRef.off && mensajesRef.off('value', listener);
}
export const signOutWeb = async () => {
  try {
    const auth = getAuth();
    await signOut(auth);
    console.log('Sesión cerrada exitosamente en Firebase');
    return true;
  } catch (error) {
    console.error('Error al cerrar sesión en Firebase:', error);
    throw error;
  }
};
export default { auth, db};
