
import { UserProvider } from './frontend/src/context/UserContext';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import LoginScreen from './frontend/src/screens/LoginScreen';
import HomeScreen from './frontend/src/screens/HomeScreen';
// import ProfileScreen from './frontend/src/screens/ProfileScreen';
// import PatientsScreen from './frontend/src/screens/PatientsScreen';
// import AppointmentScreen from './frontend/src/screens/AppointmentScreen';
// import ClinicalHistoryScreen from './frontend/src/screens/MedicalHistoryScreen';
// import SettingsScreen from './frontend/src/screens/SettingsScreen';
import AppDrawer from './AppNavigation';
import AppTabs from './AppNavigation';

import { SQLiteProvider } from 'expo-sqlite';
import { initializeDatabase } from './frontend/src/db/database';
// RegisterScreen removed: registration handled via FirebaseAuth
import ChatScreen from './frontend/src/screens/ChatScreen';
import FirebaseAuthScreen from './frontend/src/screens/FirebaseAuthScreen';

const Stack = createNativeStackNavigator();
const App = () => {
  return (
    <UserProvider>
      <SQLiteProvider databaseName='clinicaPediatrica.db' onInit={initializeDatabase}>
        <NavigationContainer>
          <Stack.Navigator initialRouteName="Login">
            <Stack.Screen name="Login" component={LoginScreen} />
            <Stack.Screen name="Main" component={AppTabs} />
            <Stack.Screen name="Chat" component={ChatScreen} />
            <Stack.Screen name="FirebaseAuth" component={FirebaseAuthScreen} />


          </Stack.Navigator>
        </NavigationContainer>
      </SQLiteProvider>
    </UserProvider>
  );


};
export default App;