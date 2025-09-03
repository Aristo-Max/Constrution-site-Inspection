import React, { useState } from 'react';
import { NavigationContainer} from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { View, Text } from 'react-native';
import Login from './screens/Login';
import Home from './screens/DashboardScreen';
import SplashScreen from './screens/SplashScreen';
import PermissionScreen from './screens/PermissionScreen';
import InspectionForm from './screens/InspectionForm';
import DashboardScreen from './screens/DashboardScreen';

// import View from 'react-native/types_generated/Libraries/Components/View/View';

const Stack = createNativeStackNavigator();

export type RootStackParamList = {
  Splash: undefined;
  Permissions: undefined;
  Login: undefined;
  Dashboard: undefined;
  InspectionForm: undefined;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [splashDone, setSplashDone] = useState(false);
// console.log("Splash Done:", splashDone);
// console.log("Permissions Granted:", permissionsGranted);
// console.log("Is Logged In:", isLoggedIn);
  return (
    //  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'lightblue'}}>
    //   <Text style={{fontSize: 20}}>Hello, React Native!</Text>
    // </View>

    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* Always show splash first */}
        {!splashDone ? (
          <Stack.Screen name="Splash">
            {(props) => (
              <SplashScreen {...props} onFinish={() => setSplashDone(true)} />
            )}
          </Stack.Screen>
        ) :
         !permissionsGranted ? (
          <Stack.Screen name="Permissions">
            {(props) => (
              <PermissionScreen
                {...props}
                onPermissionsGranted={() => setPermissionsGranted(true)}
              />
            )}
          </Stack.Screen>
        ) :
         !isLoggedIn ? (
          <Stack.Screen name="Login">
            {(props) => (
              
              <Login {...props} onLogin={() => setIsLoggedIn(true)} />
            )}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Dashboard" component={DashboardScreen} />

        )}
        <Stack.Screen name="InspectionForm" component={InspectionForm}  />

      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default App;
