import { StyleSheet } from "react-native";

export default StyleSheet.create({
    //Order style
    container: {
        flex: 1,
        backgroundColor: "#f5f5f5",
        padding: 10,
        
    },
    title: {
        fontSize: 20,
        fontWeight: "bold", 
        textAlign: "center",
        margin: 10,
        height: 50,
        justifyContent: "center",
        alignItems: "center",
    },
    border: {
        borderRadius: 10,
        elevation: 3,
        backgroundColor: '#fff',
    },
    headerContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 10,
    },
    orderCode: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    divider: {
        marginVertical: 10,
    },
    infoContainer: {
        flexDirection: 'row',
        marginVertical: 5,
    },
    label: {
        width: 100,
        color: '#666',
        fontSize: 14,
    },
    value: {
        flex: 1,
        fontSize: 14,
    },
    productItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
    },
    productName: {
        flex: 1,
        fontSize: 14,
    },
    productDetails: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    quantity: {
        marginRight: 10,
        color: '#666',
    },
    price: {
        fontSize: 14,
        fontWeight: '500',
    },
    totalContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: 5,
    },
    totalLabel: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    totalPrice: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#e53935',
    },
    status: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    buttonText:{
        color: "blue",
        fontSize: 13,
        fontWeight: "bold",
    },
    //order item style
    orderItem: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginVertical: 5,
    },
    orderBorder: {
        borderWidth: 1,
        borderColor: "#ccc",
        borderRadius: 10,
        padding: 10,
    },
    orderImage: {
        width: 100,
        height: 100,
        borderRadius: 20,
        marginRight: 10,
        resizeMode: "stretch",
    },
    orderName: {
        fontSize: 16,
        fontWeight: "bold",
    },
    orderPrice: {
        fontSize: 16,
        color: "red",
    },
    orderQuantity: {
        fontSize: 13,
        color: "blue",
    },
    orderTotal: {   
        fontSize: 13,
    },
    //cancel order style
    cancelOrder: { paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        elevation: 2,
    },
    //Text cancel order style
    textCancelOrder: {
        color: "#c62828",
        fontWeight: '600',
        fontSize: 14
    },
    // confirm order style
    confirmOrder: {
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 20,
        elevation: 2,
    },
    //Text confirm order style
    textConfirmOrder: {
        color: "white",
        fontWeight: '600',
        fontSize: 14
    }
});