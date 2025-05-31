import { Dimensions, StyleSheet } from "react-native";
const windowWidth = Dimensions.get("window").width;
export default StyleSheet.create({
    headerStyle:{
        height: 50,
        backgroundColor: "lightgreen",
        alignItems: "center",
        justifyContent: "center",
        borderTopLeftRadius: 25,
        borderTopRightRadius: 25,
        margin: 10, 
        padding: 10
    },
    alertCartNone: {
        width: windowWidth*0.8,
        height: 50,
        position: "absolute",
        top: 1,
        right: windowWidth*0.1, 
        left: windowWidth*0.1, 
        borderRadius: 20, 
        borderColor: "#ccc",
        backgroundColor: "lightblue",
        color: "red",
        alignItems: "center",
        justifyContent: "center"
    },
    // ======== Cart Item
    image: {
        height: 80, 
        width: 80,
        borderWidth: 2,
        borderColor: "blue",
        borderRadius: 10, 
        resizeMode: "stretch",
        marginRight: 10,
        padding: 10
    },
    border: {
        borderWidth: 2,
        borderRadius:20,
        borderColor: "blue",
    },
    backgoundColorCart: {
        backgroundColor: "#ccc",
        shadowColor: "black",
        shadowOffset: {width: 1, height: 1},
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-around",
        height: 150,
        margin: 5
        
    },
    nameProduct: {
        fontSize: 16,
        fontWeight: "bold",
        color: "black"
    },
    nameShop: {
        fontSize: 13,
        // fontWeight: "bold",
        color: "black",
        fontStyle: "italic"
    },
    button: {
        borderWidth: 1,
        borderColor: "black",
        borderRadius: 5,
        padding: 4,
        paddingLeft: 10,
        marginLeft: 10,
        marginRight: 5,
        width: 35,
        height: 35,
        alignItems: "center",
        justifyContent: "center"
    },
    buttonText: {
        fontSize: 20,
        fontWeight: "bold",
        color: "black"
    },
    // Bottom bar styles
    bottomBar: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'white',
        padding: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#eee',
        elevation: 5,
    },
    totalContainer: {
        flex: 1,
    },
    totalLabel: {
        fontSize: 14,
        color: '#666',
    },
    totalAmount: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#000',
    },
    buyButton: {
        backgroundColor: '#2196F3',
        paddingHorizontal: 30,
        paddingVertical: 12,
        borderRadius: 25,
        marginLeft: 15,
    },
    buyButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});