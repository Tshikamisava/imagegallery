import { StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { createNativeStackNavigator } from "@react-navigation/native-stack"
import Home from '../components/HomePage'
import Gallery from '../components/Gallery'




const Stack = createNativeStackNavigator()

export default function StackNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
    <Stack.Group>
      <Stack.Screen name='Home' component={Home} /> 
      <Stack.Screen name='Gallery' component={Gallery} />
    </Stack.Group>
  </Stack.Navigator>
  )
}

const styles = StyleSheet.create({})
