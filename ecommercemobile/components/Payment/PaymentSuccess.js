import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

const PaymentSuccess = ({ route, navigation }) => {
    const { orderId } = route.params;

    return (
        <View style={styles.container}>
            <Icon name="check-circle" size={100} color="#4CAF50" />
            <Text style={styles.title}>Thanh toán thành công!</Text>
            <Text style={styles.subtitle}>Mã đơn hàng: {orderId}</Text>
            
            <TouchableOpacity 
                style={styles.button}
                onPress={() => navigation.navigate('Đơn hàng')}
            >
                <Text style={styles.buttonText}>Xem đơn hàng</Text>
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
        color: '#4CAF50',
    },
    subtitle: {
        fontSize: 16,
        marginTop: 10,
        color: '#666',
    },
    button: {
        backgroundColor: '#4CAF50',
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

export default PaymentSuccess;