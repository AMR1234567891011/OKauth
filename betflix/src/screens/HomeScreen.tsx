import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Text, View, Button }  from 'react-native';
import GlobalStyles from '../styles/GlobalStyles';
import { killAuthTokens } from '../utils/tokenKiller';

const HomeScreen: React.FC<{navigation: any}> = ({ navigation }) => {
  useLayoutEffect(() => {
      navigation.setOptions({
          headerLeft: () => null,  // This removes the back button from the header
          headerRight: () => (
              <Button 
                  title="Logout" 
                  onPress={async () => {
                    await killAuthTokens();
                    navigation.navigate('Login');
                  }} 
              />
          ),
      });
  }, [navigation]);

  return (
    <View style={GlobalStyles.container}>
      <Text style={GlobalStyles.text}>Welcome to the Home Page!</Text>
    </View>
    );
  };

export default HomeScreen;