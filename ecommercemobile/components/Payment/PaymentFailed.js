import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PaymentFailed = ({ route, navigation }) => {
    const { message } = route.params;

    return (
        <View style={styles.container}>
            <Icon name="close-circle" size={100} color="#F44336" />
            <Text style={styles.title}>Thanh toán thất bại!</Text>
            <Text style={styles.subtitle}>{message}</Text>
            
            <TouchableOpacity 
                style={styles.button}
                onPress={() => navigation.goBack()}
            >
                <Text style={styles.buttonText}>Thử lại</Text>
            </TouchableOpacity>

            <TouchableOpacity 
                style={[styles.button, styles.homeButton]}
                onPress={() => navigation.navigate('Trang chủ')}
            >
                <Text style={styles.buttonText}>Về trang chủ</Text>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginTop: 20,
        color: '#F44336',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 10,
        color: '#666',
        textAlign: 'center',
    },
    button: {
        backgroundColor: '#F44336',
        padding: 15,
        borderRadius: 8,
        width: '80%',
        alignItems: 'center',
        marginTop: 20,
    },
    homeButton: {
        backgroundColor: '#2196F3',
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default PaymentFailed;