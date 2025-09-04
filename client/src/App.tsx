import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/Login';
import SplashScreen from './screens/SplashScreen';
import PermissionScreen from './screens/PermissionScreen';
import InspectionForm from './screens/InspectionForm';
import DashboardScreen from './screens/DashboardScreen';
import NewInspectionScreen from './screens/NewInspection';
import { Inspection } from './screens/DashboardScreen'; // Import the Inspection type

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
  Splash: undefined;
  Permissions: undefined;
  Login: undefined;
  Dashboard: undefined;
  InspectionForm: { inspection?: Inspection }; // <-- MODIFIED THIS LINE
  NewInspection: undefined;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        {!splashDone ? (
          <Stack.Screen name="Splash">
            {props => (
              <SplashScreen {...props} onFinish={() => setSplashDone(true)} />
            )}
          </Stack.Screen>
        ) : !permissionsGranted ? (
          <Stack.Screen name="Permissions">
            {props => (
              <PermissionScreen
                {...props}
                onPermissionsGranted={() => setPermissionsGranted(true)}
              />
            )}
          </Stack.Screen>
        ) : !isLoggedIn ? (
          <Stack.Screen name="Login">
            {props => <Login {...props} onLogin={() => setIsLoggedIn(true)} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        )}
        <Stack.Screen name="InspectionForm" component={InspectionForm} />
        <Stack.Screen name="NewInspection" component={NewInspectionScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
