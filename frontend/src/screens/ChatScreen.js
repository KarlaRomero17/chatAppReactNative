import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, TextInput } from 'react-native';
import { subscribeMensajesWeb, sendMessageWeb } from '../firebaseWeb';

const ChatScreen = () => {
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');

  useEffect(() => {
    const unsubscribe = subscribeMensajesWeb((data) => {
      setMensajes(data || []);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  const handleEnviar = async () => {
    if (!texto) return;
    const now = new Date();
    const fechaHora = `${now.toLocaleDateString()} ${now.toLocaleTimeString()}`;
    await sendMessageWeb({ fechaHora, texto, usuario: 'app-user' });
    setTexto('');
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Chat (Realtime Database)</Text>

      <FlatList
        data={mensajes}
        keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
        renderItem={({ item }) => (
          <View style={styles.msg}>
            <Text style={styles.user}>{item.usuario}</Text>
            <Text>{item.texto}</Text>
            <Text style={styles.time}>{item.fechaHora}</Text>
          </View>
        )}
      />

      <View style={styles.inputRow}>
        <TextInput
          style={styles.input}
          value={texto}
          onChangeText={setTexto}
          placeholder="Escribe un mensaje..."
        />
        <TouchableOpacity style={styles.sendButton} onPress={handleEnviar}>
          <Text style={{ color: '#fff' }}>Enviar</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 16, backgroundColor: '#fff' },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 10, color: '#005187' },
  msg: { padding: 10, borderBottomWidth: 1, borderBottomColor: '#eee' },
  user: { fontWeight: 'bold', color: '#333' },
  time: { fontSize: 12, color: '#666' },
  inputRow: { flexDirection: 'row', marginTop: 10, alignItems: 'center' },
  input: { flex: 1, borderWidth: 1, borderColor: '#ccc', borderRadius: 8, padding: 8 },
  sendButton: { marginLeft: 8, backgroundColor: '#005187', padding: 10, borderRadius: 8 }
});

export default ChatScreen;
