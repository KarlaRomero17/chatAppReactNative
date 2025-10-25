import AsyncStorage from '@react-native-async-storage/async-storage';
import { useNavigation } from '@react-navigation/native';
import { useContext, useEffect, useState } from 'react';
import { Image, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { UserContext } from '../context/UserContext';
import axios from 'axios';

//Pantalla de login
const BASE_URL = Platform.OS === 'android' ? 'http://10.175.160.103:5000' : 'http://localhost:5000';

const LoginScreen = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');

    const [isFocused1, setIsFocused1] = useState(false);
    const [isFocused2, setIsFocused2] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { setUser } = useContext(UserContext);
    const navigation = useNavigation();

    //verificar si hay token 
    useEffect(() => {
        const checkToken = async () => {
            const token = await AsyncStorage.getItem('token');
            if (token) {
                navigation.replace('Main');
            }
        }
        checkToken();
    }, []);

    const handleLogin = async () => {
        //si falta algun campo
        if (!username || !password) {
            alert('Debe ingresar usuario y contraseña');
            return;
        }

        setLoading(true);
        try {
            const res = await axios.post(`${BASE_URL}/api/auth/login`, {
                nombreUsuario: username,
                contraseña: password,
            });
            console.log(res.data);
            //creat token
            const { token } = res.data;
            if(token){
                await AsyncStorage.setItem('token', token);
                await AsyncStorage.setItem('user', username);
                setLoading(false);
                setUser({ username });
                navigation.replace('Main');
            }else{
                setLoading(false);
                setError('Error al iniciar sesión');
            }

        } catch (error) {
            setLoading(false);
            console.log('Login error:', error);
            // Si el backend responde con mensaje, mostrarlo
            if (error.response && error.response.data && error.response.data.message) {
                setError(error.response.data.message);
                alert(error.response.data.message);
                return;
            }

            // Fallback de desarrollo: si el usuario se registró en la app (RegisterScreen guarda user y token en AsyncStorage), permitir ingreso localmente
            try {
                const storedUser = await AsyncStorage.getItem('user');
                const storedToken = await AsyncStorage.getItem('token');
                if (storedUser && storedUser === username) {
                    // usar token existente o crear uno falso para desarrollo
                    await AsyncStorage.setItem('token', storedToken || 'faketoken12345');
                    setUser({ username });
                    navigation.replace('Main');
                    return;
                }
            } catch (e) {
                console.log('Error accediendo AsyncStorage en fallback:', e);
            }

            // Mensaje genérico si todo falla
            setError('Error en el servidor o credenciales incorrectas');
            alert('Error de conexión con el servidor o credenciales incorrectas. Si estás en desarrollo, prueba a registrarte primero.');

        }
    };
    return (
        <View style={styles.container}>

            <Image source={require('../../../assets/chat.png')} style={styles.logo} />
            <Text style={styles.title}>Iniciar Sesión</Text>
            <TextInput
                style={[styles.input, { borderWidth: isFocused1 ? 3 : 1 }]}
                onChangeText={setUsername}
                value={username}
                placeholder="Nombre de usuario"
                onFocus={() => setIsFocused1(true)}
                onBlur={() => setIsFocused1(false)}
            />
            <TextInput
                style={[styles.input, { borderWidth: isFocused2 ? 3 : 1 }]}
                placeholder="Contraseña"
                value={password}
                onChangeText={setPassword}
                secureTextEntry
                onFocus={() => setIsFocused2(true)}
                onBlur={() => setIsFocused2(false)}
            />
            <TouchableOpacity style={styles.button} onPress={handleLogin}>
                <Text style={styles.buttonText} >Ingresar</Text>

            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={{ marginTop: 15, color: '#005187', textAlign: 'center', fontSize: 16 }}>
                    ¿No tienes cuenta? Regístrate
                </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => navigation.navigate('FirebaseAuth')}>
                <Text style={{ marginTop: 8, color: '#005187', textAlign: 'center', fontSize: 16 }}>
                    ¿Usar Firebase Auth (email)?
                </Text>
            </TouchableOpacity>

        </View>
    );
};
const styles = StyleSheet.create({
    container: {
        flex: 1,
        padding: 20,
        paddingTop: 150,
        backgroundColor: '#eaeeffff',
    },
    title: {

        fontSize: 30,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#005187',
    },
    input: {
        height: 50,
        borderColor: '#005187',
        borderWidth: 1,
        borderRadius: 10,
        margin: 10,
        padding: 10,
        width: '100%',
        fontSize: 18,
        alignSelf: 'center',
    },
    logo: {
        width: 120,
        height: 120,
        borderRadius: 50,
        alignSelf: 'center',
    },
    button: {
        width: '100%',
        backgroundColor: '#005187',
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        alignSelf: 'center',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
});
export default LoginScreen;