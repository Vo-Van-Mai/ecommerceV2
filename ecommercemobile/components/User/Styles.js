import { LinearGradient } from "expo-linear-gradient";
import { Dimensions, StyleSheet } from "react-native";

const screenHeight = Dimensions.get("screen").height;
export default StyleSheet.create({
    // container: {
    //     flex: 1,
    //     alignItems: "center",
    //     justifyContent:"center",
    //     margin: 5,
    //     padding: 10
    // },
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
    },
    header: {
        fontSize: 28,
        fontWeight: 'bold',
        marginBottom: 24,
        textAlign: 'center'
    },
    input: {
    height: 50,
    borderColor: '#ddd',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
    // backgroundColor:"red"
  },
  continueBtn: {
    backgroundColor: '#A259FF',
    borderRadius: 30,
    paddingVertical: 6,
    marginVertical: 10,
  },
  //Login
  linkText: {
    textAlign: 'center',
    color: '#000',
    fontSize: 14,
  },
  boldLink: {
    fontWeight: 'bold',
  },
  socialContainer: {
    marginTop: 30,
  },
  socialButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F1F1F1',
    padding: 12,
    borderRadius: 25,
    marginBottom: 10,
  },
  socialText: {
    marginLeft: 10,
    fontSize: 16,
  },container: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
    backgroundColor: '#fff',
  },
  errorText: {
    color: 'red',
    marginBottom: 10,
    textAlign: 'center',
  },

  // ========= PROFILE =========
  avatar: {
    height: 150,
    width: 150,
    borderWidth: 2,
    borderColor: "gold",
    resizeMode: "cover",
    borderRadius: 75,

  },
  username: {
    fontSize: 24,
    color: "darkblue",
    fontWeight: "bold"
  },
  borderProfileAvater: {
    borderWidth: 2,
    borderColor: "darkblue",
    borderRadius: 20,
    margin: 5,
    padding: 10,
    backgroundColor: "lightgreen",
    shadowColor: "red",
    shadowOffset: {width: 0, height: 1},
    shadowRadius: 3.84,
    shadowOpacity: 0.5,
    elevation: 10,
    flexDirection: "row",
  },
  border: {
    borderWidth: 2,
    borderColor: "darkblue",
    borderRadius: 20,
    margin: 5,
    padding: 10,
  },
  item:
  {
      flexDirection: "row",
      alignItems: "center",
      padding: 10,
      margin: 5,
  },
  borderIcon: 
  {
    marginRight: 10,
    padding: 4
  },
  btnLogout: {
    position: "absolute",
    top: screenHeight*0.77,
    left: 0,
    right: 0,
    height: 45,
  },
  countOrder:{
    position: 'absolute',
    top: -4,
    right: 25,
    backgroundColor: 'red',
    borderRadius: 10,
    paddingHorizontal: 5,
    minWidth: 18,
    height: 18,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
  } ,

  //editprofile
  fontsize:{
    fontSize: 20,
    marginRight: 10
  },
  fontweight :{
    fontWeight: "bold"
  },
  flexRow: {
    flexDirection: "row"
  },
  textEdit: {
    margin: 5,
    padding: 5, 
  }

});