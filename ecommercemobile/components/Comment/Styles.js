import { StyleSheet } from "react-native";

export default StyleSheet.create({
    comment: {
        padding: 10,
        borderBottomWidth: 1,
        borderBottomColor: "#ccc",
    },
    row: {
        flexDirection: "row",
        alignItems: "center",
        marginBottom: 4,
    },
    avatar: {
        width: 40,
        height: 40,
        borderRadius: 20,
        marginRight: 10,
    },
    username: {
        fontSize: 14,
        fontWeight: "bold",
    },
    //Dialog
    fakeInput: {
        borderWidth: 1,
        borderColor: "gray",
        padding: 10,
        borderRadius: 10,
        flex: 8,
        margin: 5,
        justifyContent: "center",
        minHeight: 40,
    },
    overlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        padding: 20,
    },
    dialog: {
        backgroundColor: "white",
        borderRadius: 10,
        padding: 15,
    },
    dialogTitle: {
        fontWeight: "bold",
        fontSize: 16,
        marginBottom: 10,
    },
    input: {
        borderWidth: 1,
        borderColor: "gray",
        borderRadius: 8,
        padding: 10,
        minHeight: 80,
        textAlignVertical: "top",
    },
    actions: {
        marginTop: 10,
        flexDirection: "row",
        justifyContent: "flex-end",
    },
    // Reply button styles
    replyButton: {
        backgroundColor: "#f0f0f0",
        padding: 5,
        borderRadius: 5,
        alignSelf: "flex-start",
        marginTop: 5,
    },
    replyButtonText: {
        color: "blue",
        fontSize: 12,
    },
});
