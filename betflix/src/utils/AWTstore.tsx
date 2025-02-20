import EncryptedStorage from 'react-native-encrypted-storage';

const storeAWT = async (value: string) => {
    if (value === ''){
        try {
            await EncryptedStorage.setItem(`userToken`, '');
        } catch (error) {
            return
        }
    }
    try {
        console.log("storing value:");
        console.log(value);
        await EncryptedStorage.setItem(`userToken`, value)
    } catch (error) {
        return
    }
};

const getAWT = async () => {
    try {
        const value = await EncryptedStorage.getItem(`userToken`)
        console.log('stored value');
        console.log(value)
        if (value !== null) {
            return value
        } else {
            return null
        }
    } catch (error) {
        return
    }
};
export{ getAWT, storeAWT};