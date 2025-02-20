import React from 'react';
import { Text, View }  from 'react-native';
import GlobalStyles from '../styles/GlobalStyles';

const HomeScreen: React.FC = () => {
    return (
      <View style={GlobalStyles.container}>
        <Text style={GlobalStyles.text}>Welcome to the Home Page!</Text>
      </View>
    );
  };

export default HomeScreen;