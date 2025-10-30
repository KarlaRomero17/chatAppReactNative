import AsyncStorage from '@react-native-async-storage/async-storage';
import { useEffect, useRef, useState } from 'react';
import { Alert, FlatList, KeyboardAvoidingView, Modal, Platform, SafeAreaView, StatusBar, StyleSheet, Text, TextInput, 
  TouchableOpacity, TouchableWithoutFeedback, View, Keyboard } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import {
  deleteMessageWeb,
  sendMessageWeb,
  signOutWeb,
  subscribeMensajesWeb,
  updateMessageWeb
} from '../firebaseWeb';

const ChatScreen = ({ navigation, setUser }) => {
  const [mensajes, setMensajes] = useState([]);
  const [texto, setTexto] = useState('');
  const [currentUser, setCurrentUser] = useState('');
  const flatListRef = useRef(null);


  const [modalVisible, setModalVisible] = useState(false);
  const [selectedMessage, setSelectedMessage] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef(null); 


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
       
        <View style={styles.headerButtonContainer}>
          <TouchableOpacity
            onPress={handleHelp}
            style={{ marginRight: 15 }}
          >
            <MaterialCommunityIcons name="help-circle-outline" size={24} color="#fff" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={handleLogout}
            style={{ marginRight: 15 }}
          >
            <MaterialCommunityIcons name="logout" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      ),
    });
  }, [navigation]); 


  useEffect(() => {
    const unsubscribe = subscribeMensajesWeb((data) => {

      const sortedData = (data || []).sort((a, b) => {
        
        return new Date(a.fechaHoraISO || 0) - new Date(b.fechaHoraISO || 0);
      });
      setMensajes(sortedData);
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


  const handleHelp = () => {
    Alert.alert(
      "Ayuda",
      "Para editar o eliminar uno de tus mensajes, simplemente manténlo presionado."
    );
  };

 
  const handleLongPress = (message) => {
    setSelectedMessage(message);
    setModalVisible(true);
  };


  const handleEditOption = () => {
    setModalVisible(false);
    setIsEditing(true);
    setTexto(selectedMessage.texto);
  
    inputRef.current?.focus();
  };


  const handleDeleteOption = () => {
    setModalVisible(false);
    
    Alert.alert(
      "Confirmar Eliminación",
      "¿Estás seguro de que deseas eliminar este mensaje?",
      [
        { text: "Cancelar", style: "cancel" },
        { 
          text: "Eliminar", 
          onPress: async () => {
          if (!selectedMessage?.id) return;
          
          const result = await deleteMessageWeb(selectedMessage.id);
          if (result.success) {
            console.log("Mensaje eliminado:", selectedMessage.id);
            setSelectedMessage(null);
          } else {
            Alert.alert("Error", "No se pudo eliminar el mensaje.");
            console.error(result.error);
          }
        }, 
        style: "destructive"
        }
      ]
    );
  };

 
  const handleCancelEdit = () => {
    setIsEditing(false);
    setTexto('');
    setSelectedMessage(null);
  };


  const handleEnviar = async () => {
    if (!texto.trim() || !currentUser) return;

 
    if (isEditing && selectedMessage) {
      const result = await updateMessageWeb(selectedMessage.id, texto.trim());
      if (result.success) {
        console.log("Mensaje actualizado");
      } else {
        console.error("Error al actualizar:", result.error);
      
      }
      handleCancelEdit(); 
    
 
    } else {
      const now = new Date();
      const fechaHora = `${now.toLocaleDateString()} ${now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      await sendMessageWeb({
        fechaHora,
        fechaHoraISO: now.toISOString(),
        texto: texto.trim(),
        usuario: currentUser
      });
      setTexto('');
    }
  };


  // (handleLogout - sin cambios)
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
   
      <TouchableOpacity
        onLongPress={() => esMio && handleLongPress(item)} 
        activeOpacity={0.8} 
      >
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
            <View style={styles.timeContainer}>            
              {item.editadoEn && (
                <Text style={[
                  styles.editedText,
                  esMio ? styles.timeMio : styles.timeOtro
                ]}>
                  Editado · 
                </Text>
              )}
              <Text style={[
                styles.time,
                esMio ? styles.timeMio : styles.timeOtro
              ]}>
                {item.fechaHora}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  
return (
  <SafeAreaView style={styles.safeArea}>
    <StatusBar backgroundColor="#1a365d" barStyle="light-content" />

    <Modal
      visible={modalVisible}
      transparent={true}
      animationType="fade"
      onRequestClose={() => setModalVisible(false)}
    >
      <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalOption} onPress={handleEditOption}>
              <Text style={styles.modalOptionText}>Editar Mensaje</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.modalOption} onPress={handleDeleteOption}>
              <Text style={[styles.modalOptionText, styles.modalOptionDelete]}>
                Eliminar Mensaje
              </Text>
            </TouchableOpacity>
            <View style={styles.modalSeparator} />
            <TouchableOpacity
              style={styles.modalOption}
              onPress={() => setModalVisible(false)}
            >
              <Text style={styles.modalOptionText}>Cancelar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableWithoutFeedback>
    </Modal>

    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 20}
    >
      <TouchableWithoutFeedback onPress={() => Keyboard.dismiss()}>
        <View style={styles.inner}>
          <View style={styles.backgroundPattern}>
            <FlatList
              ref={flatListRef}
              data={mensajes}
              keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
              renderItem={renderMensaje}
              contentContainerStyle={styles.messagesList}
              showsVerticalScrollIndicator={false}
              onContentSizeChange={() =>
                flatListRef.current?.scrollToEnd({ animated: true })
              }
            />
          </View>

          {isEditing && (
            <View style={styles.editingContainer}>
              <View>
                <Text style={styles.editingTitle}>Editando mensaje</Text>
                <Text style={styles.editingText} numberOfLines={1}>
                  {selectedMessage?.texto}
                </Text>
              </View>
              <TouchableOpacity onPress={handleCancelEdit}>
                <MaterialCommunityIcons
                  name="close-circle"
                  size={24}
                  color="#718096"
                />
              </TouchableOpacity>
            </View>
          )}

          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <TextInput
                ref={inputRef}
                style={styles.input}
                value={texto}
                onChangeText={setTexto}
                placeholder="Escribe tu mensaje..."
                placeholderTextColor="#8a8a8a"
                multiline
                maxLength={500}
                onFocus={() =>
                  setTimeout(() => flatListRef.current?.scrollToEnd({ animated: true }), 100)
                }
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  isEditing ? styles.sendButtonEditing : {},
                  (!texto.trim() || !currentUser) && styles.sendButtonDisabled,
                ]}
                onPress={handleEnviar}
                disabled={!texto.trim() || !currentUser}
              >
                <MaterialCommunityIcons
                  name={isEditing ? 'check' : 'send'}
                  size={20}
                  color={texto.trim() && currentUser ? '#fff' : '#a0a0a0'}
                />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </TouchableWithoutFeedback>
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
    alignItems: 'center', 
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
    paddingVertical: 0,
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
  headerButtonContainer: {
    flexDirection: 'row',
  },


  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: 'white',
    borderRadius: 14,
    padding: 10,
    width: '80%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modalOption: {
    paddingVertical: 15,
    alignItems: 'center',
  },
  modalOptionText: {
    fontSize: 18,
    color: '#007AFF', 
    fontWeight: '500',
  },
  modalOptionDelete: {
    color: '#FF3B30', 
    fontWeight: '600',
  },
  modalSeparator: {
    height: 1,
    backgroundColor: '#e0e0e0',
    marginVertical: 5,
  },
  timeContainer: {
    flexDirection: 'row',
    alignSelf: 'flex-end',
    alignItems: 'center', 
    marginTop: 6,
  },
  editedText: {
    fontSize: 11,
    fontWeight: '500',
    marginRight: 4, 
  },
  editingContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#f1f1f1',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderTopColor: '#e2e8f0',
  },
  editingTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#2b6cb0',
  },
  editingText: {
    fontSize: 14,
    color: '#718096',
    maxWidth: '90%',
  },
  sendButtonEditing: {
    backgroundColor: '#38A169', 
  },
  inner: {
  flex: 1,
  justifyContent: 'space-between',
},

});

export default ChatScreen;