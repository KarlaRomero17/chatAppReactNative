import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import {
  FlatList,
  KeyboardAvoidingView,
  Platform,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View
} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  sendMessageWeb,
  signOutWeb,
  subscribeMensajesWeb
} from '../firebaseWeb';
import { Alert } from 'react-native';

const ChatScreen = ({ navigation, setUser }) => {
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const flatListRef = useRef(null);

  useEffect(() => {
    const getUserFromStorage = async () => {
      try {
        const user = await AsyncStorage.getItem('user');
        if (user) {
          setCurrentUser(user);
        }
      } catch (error) {
        console.log('Error obteniendo usuario desde storage:', error);
      }
    };

    getUserFromStorage();
  }, []);

  useEffect(() => {
    navigation.setOptions({
      headerRight: () => (
        <TouchableOpacity
          onPress={handleLogout}
          style={{ marginRight: 15 }}
        >
          <MaterialCommunityIcons name="logout" size={24} color="#fff" />
        </TouchableOpacity>
      ),
    });
  }, [navigation]);

  useEffect(() => {
    const unsubscribe = subscribeMensajesWeb((data) => {
      setMensajes(data || []);
    });

    return () => unsubscribe && unsubscribe();
  }, []);

  useEffect(() => {
    if (mensajes.length > 0) {
      setTimeout(() => {
        flatListRef.current?.scrollToEnd({ animated: true });
      }, 100);
    }
  }, [mensajes]);

  const handleEnviar = async () => {
    if (!texto.trim() || !currentUser) return;

    const now = new Date();
    const fechaHora = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    await sendMessageWeb({
      fechaHora,
      texto: texto.trim(),
      usuario: currentUser
    });
    setTexto('');
  };

  const handleLogout = async () => {
    Alert.alert(
      'Cerrar sesión',
      '¿Estás seguro de que deseas cerrar sesión?',
      [
        {
          text: 'Cancelar',
          style: 'cancel',
        },
        {
          text: 'Sí, salir',
          onPress: async () => {
            try {
              await signOutWeb();
            } catch (e) {
              console.log('Firebase signOutWeb error:', e);
            }

            try {
              await AsyncStorage.removeItem('token');
              await AsyncStorage.removeItem('user');
            } catch (e) {
              console.log('Error clearing storage:', e);
            }

            try {
              setUser && setUser(null);
            } catch (e) {
              console.log('Error clearing user context:', e);
            }

            navigation.replace('Login');
          },
        },
      ]
    );
  };

  const renderMensaje = ({ item }) => {
    const esMio = item.usuario === currentUser;

    return (
      <View style={[
        styles.bubbleContainer,
        esMio ? styles.bubbleContainerMio : styles.bubbleContainerOtro
      ]}>
        <View style={[
          styles.bubble,
          esMio ? styles.bubbleMio : styles.bubbleOtro
        ]}>
          {!esMio && (
            <Text style={styles.userName}>{item.usuario}</Text>
          )}
          <Text style={[
            styles.messageText,
            esMio ? styles.messageTextMio : styles.messageTextOtro
          ]}>
            {item.texto}
          </Text>
          <Text style={[
            styles.time,
            esMio ? styles.timeMio : styles.timeOtro
          ]}>
            {item.fechaHora}
          </Text>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar backgroundColor="#1a365d" barStyle="light-content" />

      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <View style={styles.backgroundPattern}>
          <FlatList
            ref={flatListRef}
            data={mensajes}
            keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
            renderItem={renderMensaje}
            contentContainerStyle={styles.messagesList}
            showsVerticalScrollIndicator={false}
            onContentSizeChange={() => flatListRef.current?.scrollToEnd({ animated: true })}
          />
        </View>

        <View style={styles.inputContainer}>
          <View style={styles.inputWrapper}>
            <TextInput
              style={styles.input}
              value={texto}
              onChangeText={setTexto}
              placeholder="Escribe tu mensaje..."
              placeholderTextColor="#8a8a8a"
              multiline
              maxLength={500}
            />
            <TouchableOpacity
              style={[
                styles.sendButton,
                (!texto.trim() || !currentUser) && styles.sendButtonDisabled
              ]}
              onPress={handleEnviar}
              disabled={!texto.trim() || !currentUser}
            >
              <MaterialCommunityIcons
                name="send"
                size={20}
                color={texto.trim() && currentUser ? "#fff" : "#a0a0a0"}
              />
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#1a365d',
  },
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  backgroundPattern: {
    flex: 1,
    backgroundColor: '#f8fafc',
    opacity: 0.97,
  },
  messagesList: {
    paddingHorizontal: 12,
    paddingVertical: 16,
  },
  bubbleContainer: {
    marginVertical: 6,
    paddingHorizontal: 8,
  },
  bubbleContainerMio: {
    alignItems: 'flex-end',
  },
  bubbleContainerOtro: {
    alignItems: 'flex-start',
  },
  bubble: {
    maxWidth: '80%',
    padding: 14,
    borderRadius: 18,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  bubbleMio: {
    backgroundColor: '#2b6cb0',
    borderBottomRightRadius: 6,
  },
  bubbleOtro: {
    backgroundColor: '#ffffff',
    borderBottomLeftRadius: 6,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  userName: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2d3748',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 16,
    lineHeight: 20,
    fontWeight: '400',
  },
  messageTextMio: {
    color: '#ffffff',
  },
  messageTextOtro: {
    color: '#2d3748',
  },
  time: {
    fontSize: 11,
    marginTop: 6,
    alignSelf: 'flex-end',
    fontWeight: '500',
  },
  timeMio: {
    color: 'rgba(255,255,255,0.8)',
  },
  timeOtro: {
    color: '#718096',
  },
  inputContainer: {
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 4,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#f7fafc',
    borderRadius: 25,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#e2e8f0',
  },
  input: {
    flex: 1,
    fontSize: 16,
    maxHeight: 100,
    paddingVertical: 8,
    paddingHorizontal: 8,
    color: '#2d3748',
    fontWeight: '400',
  },
  sendButton: {
    backgroundColor: '#ed8936',
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#cbd5e0',
    shadowOpacity: 0,
    elevation: 0,
  },
});

export default ChatScreen;