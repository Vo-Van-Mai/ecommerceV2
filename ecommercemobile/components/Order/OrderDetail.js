import * as React from 'react';
import { Image, ScrollView, View } from 'react-native';
import { ActivityIndicator, Button, Dialog, Portal, Text } from 'react-native-paper';
import Styles from './Styles';
import { formatCurrency } from '../../utils/PriceUtils';

const OrderDetail = ({ orderDetail, show, setShow , setOrderDetail, loadDetail}) => {
    console.log("orderDetail show dialog:", orderDetail);
  return (
    <Portal>
      <Dialog visible={show} onDismiss={() => setShow(false)}>
        <Dialog.Title>Chi tiết đơn hàng</Dialog.Title>
        <Dialog.ScrollArea>
          <ScrollView >
            {loadDetail && <ActivityIndicator size="small" color="#0000ff" />}
            {/* Thay thế Text dưới bằng dữ liệu từ orderDetail nếu có */}
            {orderDetail.map((item, index) =>
                <View key={index}>
                     <View style={[Styles.orderItem, Styles.orderBorder]}>
                        <Text style={{marginRight: 10}}>{index + 1}</Text>
                        <Image source={{uri: item.product?.image ?? null}} style={[Styles.orderImage, Styles.orderBorder]}/>
                        <View>
                            <Text ellipsizeMode='tail' numberOfLines={2} style={Styles.orderName}>{item.product?.name}</Text>
                            <Text style={Styles.orderPrice}> Giá: {formatCurrency(item.product?.price)}</Text>
                            <Text style={Styles.orderQuantity}> Số lượng: {item.quantity}</Text>
                            <Text style={Styles.orderTotal}> Tổng tiền: {formatCurrency(item.product?.price * item.quantity)}</Text>
                            <Text style={Styles.orderStatus}> Shop: {item.shop?.name}</Text>
                        </View>

                     </View>
                </View>
            )}
          </ScrollView>
        </Dialog.ScrollArea>
        <Dialog.Actions>
          <Button onPress={() => {setShow(false); setOrderDetail([])}}>Đóng</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

export default OrderDetail;
