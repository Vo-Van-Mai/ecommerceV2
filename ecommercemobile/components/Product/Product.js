import { Text, View } from "react-native";

const Product = ({route}) => {
    const productId = route.param?.productId;
    return(
        <View>
            <Text>Chi tiết sản phẩm {productId}</Text>
        </View>
    );
}

export default Product;