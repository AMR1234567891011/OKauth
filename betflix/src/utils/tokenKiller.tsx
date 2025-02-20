import React, { useEffect, useState, useLayoutEffect } from 'react';
import { Button, TextInput, View, Text, StyleSheet } from 'react-native';
import EncryptedStorage from 'react-native-encrypted-storage';
import GlobalStyles from '../styles/GlobalStyles';
import { storeAWT, getAWT } from '../utils/AWTstore';

const killAuthTokens = async () => {
    const userToken = await getAWT();
    const response = await fetch('http://10.0.2.2:5000/logout', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({'token': userToken}),
    });
    const data = await response.json();
    if (response.ok) {
        await storeAWT('');
        return true;
    } else {
        return false;
    }
};
export { killAuthTokens };