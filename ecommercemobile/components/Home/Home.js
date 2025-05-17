import { Dimensions, FlatList, Image, RefreshControl, ScrollView, SectionList, StatusBar, StyleSheet, Switch, Text, View, Animated, TextComponent, SafeAreaView } from "react-native";
import MyStyle from "../../style/MyStyle";
import { useEffect, useState, useRef } from "react";
import { Button } from "react-native";
import { ActivityIndicator, TextInput, Title } from "react-native-paper";
import { Colors } from "react-native/Libraries/NewAppScreen";


export const Items = (props) => {
    return <Text> Hello {props.firstName} {props.lastName}! </Text>
}

const Home = () => {

    const textOpacity = useRef( new Animated.Value(0)).current;

    useEffect(() => {
        Animated.timing(textOpacity, {
            toValue: 1,
            duration: 2000,
            useNativeDriver: true
        }).start();
    }, [textOpacity]);

    return (
        <Animated.View style={{flex: 1, justifyContent: "center", alignItems: "center", opacity: textOpacity}}>
            <Text style={styles.header}>WELCOME!</Text>
        </Animated.View>
    );
}

export default Home;
const styles = StyleSheet.create({
    txt: {
        fontSize: 100,
        backgroundColor: "darkblue",
        marginTop: 5,
        color: "white"
    },
    header : {
        fontSize: 30,
        color: "blue",
        fontWeight: "bold"
    }
})