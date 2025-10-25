import React, { useState, useContext } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet } from 'react-native';
import { signUpWithEmail, signInWithEmailPass } from '../firebaseAuth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { UserContext } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';

const FirebaseAuthScreen = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [nombre, setNombre] = useState('');
  const { setUser } = useContext(UserContext);
  const navigation = useNavigation();

  const handleRegister = async () => {
    if (!email || !password || !nombre) {
      alert('Todos los campos son obligatorios para registrarse');
      return;
    }
    const res = await signUpWithEmail(email, password, nombre);
    if (res.success) {
      await AsyncStorage.setItem('token', res.token);
      await AsyncStorage.setItem('user', nombre);
      setUser({ username: nombre });
      navigation.replace('Main');
    } else {
      alert(res.error?.message || 'Error en registro');
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      alert('Email y contraseña requeridos');
      return;
    }
    const res = await signInWithEmailPass(email, password);
    if (res.success) {
      // intentar obtener un nombre desde Realtime DB no implementado aquí; usamos el email como username por defecto
      const username = email.split('@')[0];
      await AsyncStorage.setItem('token', res.token);
      await AsyncStorage.setItem('user', username);
      setUser({ username });
      navigation.replace('Main');
    } else {
      alert(res.error?.message || 'Error iniciando sesión');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Firebase Auth (Email)</Text>

      <TextInput style={styles.input} placeholder="Nombre (para registro)" value={nombre} onChangeText={setNombre} />
      <TextInput style={styles.input} placeholder="Email" value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
      <TextInput style={styles.input} placeholder="Contraseña" value={password} onChangeText={setPassword} secureTextEntry />

      <TouchableOpacity style={styles.button} onPress={handleLogin}>
        <Text style={styles.buttonText}>Iniciar Sesión</Text>
      </TouchableOpacity>

      <TouchableOpacity style={[styles.button, styles.outline]} onPress={handleRegister}>
        <Text style={[styles.buttonText, styles.outlineText]}>Registrarse</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#eaeeffff', paddingTop: 80 },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#005187' },
  input: { height: 50, borderColor: '#005187', borderWidth: 1, borderRadius: 10, margin: 10, padding: 10, fontSize: 16 },
  button: { marginTop: 10, backgroundColor: '#005187', padding: 15, borderRadius: 8, alignItems: 'center' },
  buttonText: { color: '#fff', fontWeight: 'bold' },
  outline: { backgroundColor: '#fff', borderWidth: 1, borderColor: '#005187' },
  outlineText: { color: '#005187' }
});

export default FirebaseAuthScreen;
