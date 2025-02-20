import React from 'react';
import { Text, View }  from 'react-native';
type appUsageProps = {
    app: string;
    time: number;
  };
  const AppUsageDisplay: React.FC<appUsageProps> = ({app, time}) => {
    return (
      <View>
        <Text>App: {app} ScreenTime: {time} ms</Text>
      </View>
    );
  };
  export default AppUsageDisplay;