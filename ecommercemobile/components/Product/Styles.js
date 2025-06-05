import { Dimensions, StyleSheet } from "react-native";
const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;
export default StyleSheet.create({
    container:{
        flex: 1,
    },
    image:{
        width: "70%",
        height: 270,
        borderRadius: 20,
        resizeMode: "stretch",
        borderColor: "gray",
        borderWidth: 1,
    },
    subImage:{
        width: 90, 
        height: 100,
        resizeMode: "stretch",
        borderRadius: 20,
        marginRight: 5
    },
    p:{
        paddingTop: 10,
        paddingLeft: 15,
        paddingRight: 15,
    },
    border:{
        borderRadius: 10,
        borderWidth: 1,
        borderColor: "#ccc",
        padding: 10,
    },
    productName: {
        fontSize: 18,
        fontWeight: "bold",
        fontStyle: "italic",
        fontFamily: "sans-serif",
    },
    bottomBar: {
    position: "absolute",
    top: windowHeight*0.73, //samsung galaxy a51
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