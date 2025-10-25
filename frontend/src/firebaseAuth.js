// Helpers de autenticación usando Firebase Web SDK
import './firebaseWeb'; // asegura que Firebase app y Database están inicializados
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut as firebaseSignOut } from 'firebase/auth';
import { getDatabase, ref, push, set, get, child, query, orderByChild, equalTo } from 'firebase/database';

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
    // Usar una consulta indexada para buscar por correo y evitar descargar todo el nodo
    const usuariosRef = ref(db, 'usuarios');
    const q = query(usuariosRef, orderByChild('correo'), equalTo(email));
    const snapshot = await get(q);
    const data = snapshot.val();
    if (!data) return null;
    // data será un objeto con una o varias keys
    const keys = Object.keys(data);
    if (keys.length === 0) return null;
    const first = data[keys[0]];
    return first?.nombre || null;
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
