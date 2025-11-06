import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { Provider } from 'react-redux';
import { store } from './src/store';
import { StatusBar } from 'expo-status-bar';

// Screens
import WelcomeScreen from './src/screens/WelcomeScreen';
import LoginScreen from './src/screens/LoginScreen';
import RegisterScreen from './src/screens/RegisterScreen';
import ConfigurationScreen from './src/screens/ConfigurationScreen';
import WheelScreen from './src/screens/WheelScreen';
import ActivityDetailScreen from './src/screens/ActivityDetailScreen';
import MapNavigationScreen from './src/screens/MapNavigationScreen';
import CompletionScreen from './src/screens/CompletionScreen';
import PremiumScreen from './src/screens/PremiumScreen';
import DailyMenuScreen from './src/screens/DailyMenuScreen';
import ThemedAdventuresScreen from './src/screens/ThemedAdventuresScreen';
import VacationPlannerScreen from './src/screens/VacationPlannerScreen';
import CommunityFeedScreen from './src/screens/CommunityFeedScreen';
import CreatePostScreen from './src/screens/CreatePostScreen';

export type RootStackParamList = {
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Configuration: undefined;
  Wheel: { sessionId: string };
  ActivityDetail: { activityId: string; sessionId: string };
  MapNavigation: { activityId: string; sessionId: string };
  Completion: { sessionId: string };
  Premium: undefined;
  DailyMenu: undefined;
  ThemedAdventures: undefined;
  VacationPlanner: undefined;
  CommunityFeed: undefined;
  CreatePost: { activityId?: string; activityName?: string; sessionId?: string };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function App() {
  return (
    <Provider store={store}>
      <NavigationContainer>
        <StatusBar style="auto" />
        <Stack.Navigator
          initialRouteName="Welcome"
          screenOptions={{
            headerStyle: { backgroundColor: '#6366f1' },
            headerTintColor: '#fff',
            headerTitleStyle: { fontWeight: 'bold' },
          }}
        >
          <Stack.Screen
            name="Welcome"
            component={WelcomeScreen}
            options={{ headerShown: false }}
          />
          <Stack.Screen name="Login" component={LoginScreen} />
          <Stack.Screen name="Register" component={RegisterScreen} />
          <Stack.Screen name="Configuration" component={ConfigurationScreen} />
          <Stack.Screen
            name="Wheel"
            component={WheelScreen}
            options={{ title: 'Spin the Wheel' }}
          />
          <Stack.Screen
            name="ActivityDetail"
            component={ActivityDetailScreen}
            options={{ title: 'Your Adventure' }}
          />
          <Stack.Screen
            name="MapNavigation"
            component={MapNavigationScreen}
            options={{ title: 'Navigate' }}
          />
          <Stack.Screen
            name="Completion"
            component={CompletionScreen}
            options={{ title: 'Complete' }}
          />
          <Stack.Screen
            name="Premium"
            component={PremiumScreen}
            options={{ title: 'Premium' }}
          />
          <Stack.Screen
            name="DailyMenu"
            component={DailyMenuScreen}
            options={{ title: 'Daily Discovery Menu' }}
          />
          <Stack.Screen
            name="ThemedAdventures"
            component={ThemedAdventuresScreen}
            options={{ title: 'Themed Adventures' }}
          />
          <Stack.Screen
            name="VacationPlanner"
            component={VacationPlannerScreen}
            options={{ title: 'Vacation Explorer' }}
          />
          <Stack.Screen
            name="CommunityFeed"
            component={CommunityFeedScreen}
            options={{ title: 'Community' }}
          />
          <Stack.Screen
            name="CreatePost"
            component={CreatePostScreen}
            options={{ headerShown: false }}
          />
        </Stack.Navigator>
      </NavigationContainer>
    </Provider>
  );
}
