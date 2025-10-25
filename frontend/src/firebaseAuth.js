// Helpers de autenticación usando Firebase Web SDK
import './firebaseWeb'; // asegura que Firebase app y Database están inicializados
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { getDatabase, ref, push, set, get, child } from 'firebase/database';

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

// Buscar el nombre (campo 'nombre') en el nodo 'usuarios' por correo
export async function getNombreByEmail(email) {
  try {
    const usuariosRef = ref(db, 'usuarios');
    const snapshot = await get(usuariosRef);
    const data = snapshot.val();
    if (!data) return null;
    // data puede ser un array o un objeto con keys
    if (Array.isArray(data)) {
      const found = data.find(u => u && u.correo === email);
      return found ? found.nombre : null;
    } else {
      const keys = Object.keys(data);
      for (let k of keys) {
        const u = data[k];
        if (u && u.correo === email) return u.nombre;
      }
    }
    return null;
  } catch (error) {
    console.error('getNombreByEmail error', error);
    return null;
  }
}

// Cerrar sesión (Web SDK)
export async function signOutWeb() {
  try {
    const authInstance = getAuth();
    await firebaseSignOut(authInstance);
    return { success: true };
  } catch (error) {
    console.error('signOutWeb error', error);
    return { success: false, error };
  }
}
