import React from 'react';
import { WebView } from 'react-native-webview';
import { ActivityIndicator, SafeAreaView } from 'react-native';

const PaymentWebView = ({ route, navigation }) => {
    const { payUrl } = route.params;

    const handleNavigationStateChange = (navState) => {
        // Kiểm tra URL redirect từ MoMo
        if (navState.url.includes('momo-return')) {
            // Xử lý kết quả thanh toán
            const url = new URL(navState.url);
            const resultCode = url.searchParams.get('resultCode');
            const orderId = url.searchParams.get('orderId');

            if (resultCode === '0') {
                navigation.replace('PaymentSuccess', { orderId });
            } else {
                navigation.replace('PaymentFailed', { 
                    message: url.searchParams.get('message') 
                });
            }
        }
    };

    return (
        <SafeAreaView style={{ flex: 1 }}>
            <WebView
                source={{ uri: payUrl }}
                onNavigationStateChange={handleNavigationStateChange}
                startInLoadingState={true}
                renderLoading={() => (
                    <ActivityIndicator 
                        size="large" 
                        style={{ position: 'absolute', top: '50%', left: '50%' }}
                    />
                )}
            />
        </SafeAreaView>
    );
};

export default PaymentWebView;