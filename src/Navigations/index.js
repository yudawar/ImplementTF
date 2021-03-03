import 'react-native-gesture-handler';
import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createStackNavigator} from '@react-navigation/stack';

import { StyleSheet, Text, View } from 'react-native'

const Stack = createStackNavigator()

import HomeScreen from '../Screens/Home'
import ScreenPertama from '../Screens/ScreenPertama'
import ScreenKedua from '../Screens/ScreenKedua'

const navigation = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator>
                <Stack.Screen name="Home" component={HomeScreen} options={{headerShown: false}}/>
                <Stack.Screen name="ScreenPertama" component={ScreenPertama} options={{headerShown: false}}/>
                <Stack.Screen name="ScreenKedua" component={ScreenKedua} options={{headerShown: false}}/>
            </Stack.Navigator>
        </NavigationContainer>
    )
}

export default navigation