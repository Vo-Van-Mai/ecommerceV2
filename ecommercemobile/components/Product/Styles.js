import { StyleSheet } from "react-native";

export default StyleSheet.create({
    container:{
        flex: 1,
        
    },
    image:{
        width: "80%",
        height: 300,
        borderRadius: 20,
        resizeMode: "stretch",
        borderColor: "gray",
        borderWidth: 1,
    },
    subImage:{
        width: 110, 
        height: 120,
        resizeMode: "cover",
        borderRadius: 5,
        marginRight: 5
    },
    p:{
        paddingTop: 10,
        paddingLeft: 15,
        paddingRight: 15,
    },
    border:{
        borderRadius: 10,
        borderWidth: 0,
        borderColor: "red",

    },
    productName: {
        fontSize: 20,
        fontWeight: "bold",
        fontStyle: "italic",
        fontFamily: "sans-serif",
    },
    bottomBar: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    // backgroundColor: "lightgray",
    padding: 15,
    alignItems: "center",
    justifyContent: "center",
    // borderTopWidth: 1,
    borderColor: "#ccc",
  },
  button: {
    backgroundColor: "#FF6347",
    paddingVertical: 12,
    paddingHorizontal: 30,
    borderRadius: 30,
  },
  buttonText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  }
}); 