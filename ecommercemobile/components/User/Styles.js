import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container: {
        flex: 1,
        alignItems: "center",
        justifyContent:"center",
        margin: 5,
        padding: 10
    },
    logo:{
        width: 200,
        height: 200,
        borderRadius: 50
    },
    text: {
        fontSize: 36,
        fontWeight: "bold",
    },
    m:{
        margin: 5,

    },
    avatar: {
        width: 100,
        height: 100,
        borderRadius: 20,
        resizeMode: "stretch",
        borderWidth: 1,
        borderColor: "gray"
    }
});