import React, { useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Login from './screens/Login';
import SplashScreen from './screens/SplashScreen';
import InspectionForm from './screens/InspectionForm';
import DashboardScreen from './screens/DashboardScreen';
import ReportScreen from './screens/ReportScreen';
import { Inspection, NoteItem, PropertyProvider } from './components/PropertyContext';
import NewInspectionScreen from './screens/NewInspection';

// import View from 'react-native/types_generated/Libraries/Components/View/View';

const Stack = createNativeStackNavigator<RootStackParamList>();

export type RootStackParamList = {
  Splash: undefined;
  Login: undefined;
    Dashboard: {
    updatedNote?: NoteItem;
    propertyId?: string;
  } | undefined;
  InspectionForm: {
    propertyId: string;
    properties: Inspection[];
    // setProperties: React.Dispatch<React.SetStateAction<PropertyDetails[]>>;
  };
  ReportScreen: {
    property: Inspection;
    notes: NoteItem[];
  };
  NewInspection: undefined;
};

const App = () => {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [permissionsGranted, setPermissionsGranted] = useState(false);
  const [splashDone, setSplashDone] = useState(false);

  return (
    //  <View style={{flex: 1, justifyContent: 'center', alignItems: 'center', backgroundColor: 'lightblue'}}>
    //   <Text style={{fontSize: 20}}>Hello, React Native!</Text>
    // </View>
    <PropertyProvider>
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }}>
        
        {/* Always show splash first */}
         {!splashDone ? (
          <Stack.Screen name="Splash">
            {props => (
              <SplashScreen {...props} onFinish={() => setSplashDone(true)} />
            )}
          </Stack.Screen>
        ) :!isLoggedIn ? (
          <Stack.Screen name="Login">
            {props => <Login {...props} onLogin={() => setIsLoggedIn(true)} />}
          </Stack.Screen>
        ) : (
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
        )}
        <Stack.Screen name="InspectionForm" component={InspectionForm}  />
         <Stack.Screen name="NewInspection" component={NewInspectionScreen}  options={{
    title: "Inspection Form",
    headerShown: true, // show the header
    headerTintColor: "#fff",
    headerStyle: { backgroundColor: "#0a84ff" },
  }} />
         <Stack.Screen name="ReportScreen" component={ReportScreen} options={{
  title: "ReportScreen",
  headerTintColor: "#fff",
  headerStyle: { backgroundColor: "#0a84ff" },
}}/> 
      </Stack.Navigator>
    </NavigationContainer>
    </PropertyProvider>
  );
};

export default App;
