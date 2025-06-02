import AsyncStorage from "@react-native-async-storage/async-storage";

export default (current, action) => {
    switch(action.type){
        case 'login':
            return action.payload;
        case 'logout':
            AsyncStorage.removeItem('token');
            return null;
        case 'update':
            return action.payload;
    }
    return current;
}