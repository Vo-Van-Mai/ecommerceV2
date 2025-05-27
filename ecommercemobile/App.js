import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./components/Home/Home";
import Product from "./components/Product/Product";
import { Image, StatusBar, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Login from "./components/User/Login";
import { Icon } from "react-native-paper";
import Register from "./components/User/Register";
import { MyDispatchContext, MyUserContext } from "./configs/Context";
import { useContext, useReducer } from "react";
import Profile from "./components/User/Profile";
import Shop from "./components/Shop/Shop";
import MyUserReducer from "./Reducer/MyUserReducer";

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();

const HeaderTitle = () => {
  return(
    <View style={{flexDirection: "row", alignItems: "center", height: 50}}>
      <Image source={require('./assets/logo.png')} style={{width: 40, height:40, margin: 5, borderRadius: 20}} />
      <Text style={{fontSize: 15, color: "red"}}>NM-Commerce</Text>
    </View>
  );
}

const StackNavigator = () => {
  return(
  <Stack.Navigator screenOptions={{headerTitle: () => <HeaderTitle />}}>
    <Stack.Screen name="Home" component={Home}/>
    <Stack.Screen name="Product" component={Product}/>

  </Stack.Navigator>);
}

const AuthStacNavigator = () => {
  return(
    <AuthStack.Navigator>
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Register" component={Register}/>  
    </AuthStack.Navigator>
  );
}

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  const user =useContext(MyUserContext);

  return(
    <Tab.Navigator screenOptions={{headerShown: false}}>
      <Tab.Screen name="Trang chủ" component={StackNavigator} options={{tabBarIcon: () => <Icon size={35} source={"home"}/>}} />
      {user === null?<>
      <Tab.Screen name="login" component={AuthStacNavigator} options={{tabBarIcon: () => <Icon size={35} source={"account"}/>}} />
      {/* <Tab.Screen name="Đăng kí" component={Register} options={{tabBarIcon: () => <Icon size={35} source={"account-plus"}/>}}/> */}
      </>:<>
      <Tab.Screen name="profile" component={Profile} options={{tabBarIcon: () => <Icon size={35} source={"account"}/>}} />

      {/* nếu là seller */}
      {user.role === "seller" && <Tab.Screen name="shop" component={Shop} options={{tabBarIcon: () => <Icon size={35} source={"account"}/>}} />}
        </>}
      

    </Tab.Navigator>
  );
}

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null)

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <MyUserContext.Provider value={user}>
        <MyDispatchContext.Provider value={dispatch}>
          <NavigationContainer>
            <TabNavigator/>
          </NavigationContainer>
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
    </>
    
  
  );
}

export default App;