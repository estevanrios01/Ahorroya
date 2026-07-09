import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Text } from 'react-native';
import { HomeScreen } from '../screens/HomeScreen';
import { SearchScreen } from '../screens/SearchScreen';
import { ProductScreen } from '../screens/ProductScreen';
import { ScannerScreen } from '../screens/ScannerScreen';
import { FavoritesScreen } from '../screens/FavoritesScreen';
import { CartScreen } from '../screens/CartScreen';
import { ProfileScreen } from '../screens/ProfileScreen';
import { MapScreen } from '../screens/MapScreen';
import { StoreScreen } from '../screens/StoreScreen';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

function TabIcon({ name, focused }: { name: string; focused: boolean }) {
  const icons: Record<string, string> = {
    Home: '🏠', Search: '🔍', Scanner: '📷', Favorites: '❤️', Profile: '👤',
  };
  return <Text style={{ fontSize: 22, opacity: focused ? 1 : 0.5 }}>{icons[name] || '●'}</Text>;
}

function HomeTabs() {
  return (
    <Tab.Navigator screenOptions={({ route }) => ({
      headerShown: false,
      tabBarStyle: { backgroundColor: '#09090b', borderTopColor: '#27272a', borderTopWidth: 1 },
      tabBarActiveTintColor: '#34d399',
      tabBarInactiveTintColor: '#71717a',
      tabBarIcon: ({ focused }) => <TabIcon name={route.name} focused={focused} />,
    })}>
      <Tab.Screen name="Home" component={HomeScreen} />
      <Tab.Screen name="Search" component={SearchScreen} />
      <Tab.Screen name="Scanner" component={ScannerScreen} />
      <Tab.Screen name="Favorites" component={FavoritesScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  );
}

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: '#09090b' } }}>
        <Stack.Screen name="Main" component={HomeTabs} />
        <Stack.Screen name="Product" component={ProductScreen} />
        <Stack.Screen name="Store" component={StoreScreen} />
        <Stack.Screen name="Cart" component={CartScreen} />
        <Stack.Screen name="Map" component={MapScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
