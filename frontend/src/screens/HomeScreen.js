//importaciones
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useContext, useEffect, useState } from 'react';
import { View, Text, Button, StyleSheet, TouchableOpacity } from 'react-native';
import { UserContext } from '../context/UserContext';
import { useNavigation } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { signOutWeb } from '../firebaseAuth';

//nuestro componente principal
const HomeScreen = () => {

    const navigation = useNavigation();
    const { user: ctxUser, setUser } = useContext(UserContext);

    // local display name fallback
    const [localUser, setLocalUser] = useState('');

    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await AsyncStorage.getItem('user');
            if(storedUser){
                // actualizar contexto si no está presente
                try { setUser && setUser({ username: storedUser }); } catch(e){}
                setLocalUser(storedUser);
            }
        }
        loadUser();
    }, []);

    const handleLogout = async () => {
        // Intentar cerrar sesión en Firebase Web (si corresponde)
        try {
            await signOutWeb();
        } catch (e) {
            console.log('Firebase signOutWeb error:', e);
        }

        // Limpiar local
        await AsyncStorage.removeItem('token');
        await AsyncStorage.removeItem('user');
        // limpiar contexto de usuario
        try { setUser && setUser({}); } catch (e) {}
        navigation.replace('Login')

    }


    return (
        <View style={styles.container}>
            <Text style={styles.title}>Bienvenido a la Clínica
                Pediátrica, { (ctxUser && ctxUser.username) || localUser }</Text>

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Profile')}>
                <MaterialCommunityIcons name="account" size={24} color={"#ffff"} />
                <Text style={styles.buttonText} >Perfil</Text>
            </TouchableOpacity>

            <View style={styles.spacer} />

            <TouchableOpacity style={styles.button} onPress={() =>
                navigation.navigate('Main', {
                    screen: 'Pacientes'
                })
            }>
                <MaterialCommunityIcons name="baby-carriage" size={24} color={"#ffff"} />
                <Text style={styles.buttonText} >Gestión de pacientes</Text>
            </TouchableOpacity>

            <View style={styles.spacer} />

            <TouchableOpacity style={styles.button} onPress={() => 
                 navigation.navigate('Main', {
                    screen: 'Configuracion'
                })
            }>
                <MaterialCommunityIcons name="cog" size={24} color={"#ffff"} />
                <Text style={styles.buttonText} >Configuración</Text>
            </TouchableOpacity>

            <View style={styles.spacer} />

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Citas')}>
                <MaterialCommunityIcons name="calendar" size={24} color={"#ffff"} />
                <Text style={styles.buttonText} >Citas</Text>
            </TouchableOpacity>

            <View style={styles.spacer} />

            <TouchableOpacity style={styles.button} onPress={() => navigation.navigate('Chat')}>
                <MaterialCommunityIcons name="chat" size={24} color={"#ffff"} />
                <Text style={styles.buttonText} >Chat (Realtime DB)</Text>
            </TouchableOpacity>

            <View style={styles.spacer} />

            <TouchableOpacity style={styles.button} onPress={() => { }}>
                <MaterialCommunityIcons name="clipboard-account" size={24} color={"#ffff"} />
                <Text style={styles.buttonText} >Historial Médico</Text>
            </TouchableOpacity>
            <View style={styles.spacer} />

            <TouchableOpacity style={styles.buttonDanger} onPress={() => { handleLogout() }}>
                <MaterialCommunityIcons name="logout" size={24} color={"#ffff"} />
                <Text style={styles.buttonText} >Cerrar Sesion</Text>
            </TouchableOpacity>
        </View>
    );
};

//constantes de estilo
const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    title: {
        fontSize: 30,
        marginBottom: 20,
        textAlign: 'center',
        fontWeight: 'bold',
        color: '#005187',
    },
    spacer: {
        height: 20,
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
        flexDirection: 'row',
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
        marginLeft: 10,
    },
    buttonDanger: {
        width: '100%',
        backgroundColor: '#d9534f',
        borderRadius: 10,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
        marginTop: 10,
        alignSelf: 'center',
        flexDirection: 'row',
    },
});
//exportamos nuestro componente
export default HomeScreen;