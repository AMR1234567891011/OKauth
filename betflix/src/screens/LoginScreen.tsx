import React, { useEffect, useState } from 'react';
import { Button, TextInput, View, Text, StyleSheet } from 'react-native';
import GlobalStyles from '../styles/GlobalStyles';
import AsyncStorage from '@react-native-async-storage/async-storage';
import EncryptedStorage from 'react-native-encrypted-storage';
import { createHash } from 'react-native-quick-crypto/lib/typescript/src/Hash';

import CryptoJS from 'crypto-js';

function hashString(message: string): string {
  return CryptoJS.SHA256(message).toString(CryptoJS.enc.Hex);
}

const storeValue = async (value: string) => {
    try {
        console.log("storing value:");
        console.log(value);
        await EncryptedStorage.setItem(`userToken`, value)
    } catch (error) {
        console.log("shit")
    }
};

const getValue = async () => {
    try {
        const value = await EncryptedStorage.getItem(`userToken`)
        console.log('stored value');
        console.log(value)
        if (value !== null) {
            return value
        } else {
            return null
        }
    } catch (error) {~
        console.log("shit")
    }
};

const sendLoginCred = async (username: string, password: string) => {
    try {
        console.log(`uname: ${username}, pwd: ${password}`);
        const hashedPassword = await hashString(password);
        const response = await fetch('http://10.0.2.2:5000/login', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({username , hashedPassword}),
        });

        const data  = await response.json();
        console.log("Login resposne:", data);
        if (response.ok) {
            storeValue(data.token)
            if (await sendAuthToken(data.token)){
                return true;
            }
        }
    } catch (error) {
        console.log("error in login")
    }
};
const sendAuthToken = async (username: string) => {
    try {
        const token = await getValue();
        console.log(token);
        const response = await fetch('http://10.0.2.2:5000/token', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({token}),
        });
        if (response.ok) {
            return true;
        } else {
            return false;
        }
    } catch (error) {
        console.log("network issue");
    }
}
const LoginScreen: React.FC<{navigation: any}> = ({ navigation }) => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(true);
    const [token, setToken] = useState<string | null>(null);

    useEffect(() => {
        const checkForAuthToken = async () => {
            const userToken = await getValue();
            if (userToken !== undefined) {
                setToken(userToken);
                console.log(`got a real token from storage woo hoo ${token} : ${userToken}`);
            } else {
                setToken(null);
            }
            if (userToken !== undefined && userToken !== null){
                const authed = await sendAuthToken(userToken);
                if (authed) {
                    console.log("got authed before login creds needed!");
                    navigation.navigate("Home");
                    return;
                } else {
                    setLoading(false);
                }
            } else {
                setLoading(false);
            }
            setLoading(false);
            
        };
        const unsub = navigation.addListener('focus', () => {
            checkForAuthToken();
        });
        checkForAuthToken();
        return unsub;
    }, [navigation]);


    const handleLogin = async () => {
        if (await sendLoginCred(username, password)) {
            console.log("got authed after logging in and storing token");
            navigation.navigate("Home");
            return;
        }
        const userToken = await getValue();
        if (userToken !== undefined && userToken !== null){
            const authed = await sendAuthToken(userToken);
            if (authed){
                navigation.navigate("Home");
            }
        }

    };
    if (loading){
        return (<Text>Loading ...</Text>);
    } else {
        return (
            <View style={GlobalStyles.container}>
                <Text style={GlobalStyles.text}>Enter your username: </Text>
                <TextInput style={GlobalStyles.text}
                    value={username}
                    onChangeText={setUsername}
                    placeholder="Username"
                />
                <TextInput style={GlobalStyles.text}
                    value={password}
                    onChangeText={setPassword}
                    placeholder="Password"
                />
                <Button title="login" onPress={handleLogin} />
            </View>
        );
    }
};

export default LoginScreen;
