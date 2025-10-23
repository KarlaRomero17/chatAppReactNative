
import { createDrawerNavigator } from "@react-navigation/drawer";

import HomeScreen from "./frontend/src/screens/HomeScreen";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import { MaterialCommunityIcons } from "@expo/vector-icons";


const Drawer = createDrawerNavigator();
const Tab = createBottomTabNavigator()

const AppDrawer = () => {
    return (
        <Drawer.Navigator>
            <Drawer.Screen name="Principal" component={HomeScreen} />
        </Drawer.Navigator>
    );
};

const AppTabs = () => {
    return (
        <Tab.Navigator>
            <Tab.Screen name="Principal" component={HomeScreen} options={
                {
                    tabBarIcon: ({ color, size }) => (
                        <MaterialCommunityIcons name="home" size={size} color={color} />
                    )
                }
            } />
        </Tab.Navigator>
    );
}

export default AppTabs;