// Helpers de autenticación usando Firebase Web SDK
import './firebaseWeb'; // asegura que Firebase app y Database están inicializados
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from 'firebase/auth';
import { getDatabase, ref, push, set } from 'firebase/database';

const auth = getAuth();
const db = getDatabase();

export async function signUpWithEmail(email, password, nombre) {
  try {
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // Añadir usuario al nodo 'usuarios' en Realtime DB
    try {
      const usuariosRef = ref(db, 'usuarios');
      const newRef = push(usuariosRef);
      await set(newRef, { correo: email, nombre });
    } catch (dbErr) {
      console.warn('No se pudo guardar usuario en Realtime DB:', dbErr);
    }

    const token = await user.getIdToken();
    return { success: true, user, token };
  } catch (error) {
    console.error('signUpWithEmail error', error);
    return { success: false, error };
  }
}

export async function signInWithEmailPass(email, password) {
  try {
    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;
    const token = await user.getIdToken();
    return { success: true, user, token };
  } catch (error) {
    console.error('signInWithEmailPass error', error);
    return { success: false, error };
  }

}
