import { RootTagContext, StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
    // padding: 24,
    alignItems: 'center',
    backgroundColor: '#fff',
    flexDirection: "row"
  },text: {
        fontSize: 20,
        fontWeight: "bold",
    },
    border: {
        borderWidth: 1,
        borderColor: "red",
        margin: 5
    },
    imageShop: {
        width: 70,
        height: 70,
        resizeMode: "cover",
        borderRadius: 50, 
        borderColor: "darkblue",
        borderWidth: 3
    },
    borderIcon: {
        borderWidth: 1,
        borderColor: "red",
        borderRadius: 10,
        padding: 5,
        margin: 10
    },
    item:{
        flexDirection: "row",
        alignItems: "center",
        // padding: 10,
        margin: 5,

    }
});