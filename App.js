import { UserProvider } from './frontend/src/context/UserContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { TouchableOpacity } from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

import LoginScreen from './frontend/src/screens/LoginScreen';
import ChatScreen from './frontend/src/screens/ChatScreen';
import FirebaseAuthScreen from './frontend/src/screens/FirebaseAuthScreen';

import { SQLiteProvider } from 'expo-sqlite';
import { initializeDatabase } from './frontend/src/db/database';

const Stack = createNativeStackNavigator();

const App = () => {
  return (
    <UserProvider>
      <SQLiteProvider databaseName='clinicaPediatrica.db' onInit={initializeDatabase}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen
              name="Login"
              component={LoginScreen}
              options={{ headerShown: false }}
            />
            <Stack.Screen
              name="Chat"
              options={({ navigation }) => ({
                title: 'ChatApp',
                headerStyle: { backgroundColor: '#1a365d' },
                headerTintColor: '#fff',
                headerTitleStyle: { fontWeight: 'bold' },
              })}
            >
              {(props) => <ChatScreen {...props} />}
            </Stack.Screen>

            <Stack.Screen
              name="FirebaseAuth"
              component={FirebaseAuthScreen}
              options={{ headerShown: false }}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </SQLiteProvider>
    </UserProvider>
  );
};

export default App;