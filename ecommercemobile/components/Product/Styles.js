import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container:{
        flex: 1,
        
    },
    image:{
        width: "100%",
        height: 280,
        borderRadius: 20,
        resizeMode: "stretch",
        borderColor: "gray",
        borderWidth: 1,
    },
    subImage:{
        width: "100%", 
        height: 100,
        resizeMode: "stretch",
        borderRadius: 5
    },
    p:{
        paddingTop: 10,
        paddingLeft: 15,
        paddingRight: 15,
    }
}); 