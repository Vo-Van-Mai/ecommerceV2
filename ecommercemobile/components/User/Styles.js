import { StyleSheet } from "react-native";

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
});