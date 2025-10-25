// Ejemplos de uso con react-native-firebase (nativo)
// Este archivo asume que ya configuraste los archivos nativos:
// - Android: android/app/google-services.json
// - iOS: ios/GoogleService-Info.plist
// Y que instalaste e integraste los módulos @react-native-firebase/app, @react-native-firebase/auth y @react-native-firebase/database

import app from '@react-native-firebase/app';
import auth from '@react-native-firebase/auth';
import database from '@react-native-firebase/database';

// Nota: react-native-firebase toma la configuración desde los archivos nativos.

export async function signInWithEmail(email, password) {
  try {
    const userCredential = await auth().signInWithEmailAndPassword(email, password);
    // userCredential.user contiene información del usuario
    const token = await userCredential.user.getIdToken();
    return { success: true, user: userCredential.user, token };
  } catch (error) {
    console.error('Auth signIn error:', error);
    return { success: false, error };
  }
}

export async function signOut() {
  try {
    await auth().signOut();
    return { success: true };
  } catch (error) {
    console.error('Auth signOut error:', error);
    return { success: false, error };
  }
}

// Realtime Database: enviar mensaje (usa push para generar key única)
export async function sendMessage(mensaje) {
  try {
    const refMensajes = database().ref('mensajes');
    const newRef = refMensajes.push();
    await newRef.set(mensaje);
    return { success: true };
  } catch (error) {
    console.error('sendMessage error:', error);
    return { success: false, error };
  }
}

// Suscribirse a cambios en 'mensajes'. callback recibe array de mensajes {id, ...data}
export function subscribeMensajes(callback) {
  const refMensajes = database().ref('mensajes');
  const listener = refMensajes.on('value', snapshot => {
    const data = snapshot.val();
    if (!data) {
      callback([]);
      return;
    }
    // Si guardaste con push(), data es un objeto con keys
    const arr = Object.keys(data).map(k => ({ id: k, ...data[k] }));
    callback(arr);
  });

  // Retornar una función para desuscribirse
  return () => refMensajes.off('value', listener);
}

export default app;
