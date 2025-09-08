import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

// Import Screens
import SplashScreen from './screens/SplashScreen';
import Login from './screens/Login';
import DashboardScreen from './screens/DashboardScreen';
import NewInspectionScreen from './screens/NewInspection';
import InspectionForm from './screens/InspectionForm';
import ReportScreen from './screens/ReportScreen';

// Import Context and Types
import { PropertyProvider, Inspection } from './components/PropertyContext';
import colors from './constants/color';

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
  Dashboard: undefined;
  // ✅ ADDED optional inspectionId for editing
  NewInspection:
    | {
        inspectionId?: string;
      }
    | undefined;
  InspectionForm: {
    propertyId: string;
  };
  ReportScreen: {
    property: Inspection;
  };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

const App = () => {
  const [splashDone, setSplashDone] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <PropertyProvider>
      <NavigationContainer>
        <Stack.Navigator
          screenOptions={{
            headerShown: false,
            headerStyle: { backgroundColor: colors.primary },
            headerTintColor: colors.white,
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          {!splashDone ? (
            <Stack.Screen name="Splash">
              {props => (
                <SplashScreen {...props} onFinish={() => setSplashDone(true)} />
              )}
            </Stack.Screen>
          ) : !isLoggedIn ? (
            <Stack.Screen name="Login">
              {props => (
                <Login {...props} onLogin={() => setIsLoggedIn(true)} />
              )}
            </Stack.Screen>
          ) : (
            <>
              <Stack.Screen name="Dashboard" component={DashboardScreen} />
              <Stack.Screen
                name="NewInspection"
                component={NewInspectionScreen}
                options={{
                  headerShown: true,
                  title: 'Inspection Details', // More generic title
                }}
              />
              <Stack.Screen
                name="InspectionForm"
                component={InspectionForm}
                options={{
                  headerShown: true,
                  title: 'Add & View Notes',
                }}
              />
              <Stack.Screen
                name="ReportScreen"
                component={ReportScreen}
                options={{
                  headerShown: true,
                  title: 'Inspection Report',
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </PropertyProvider>
  );
};

export default App;
