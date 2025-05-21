import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./components/Home/Home";
import Product from "./components/Product/Product";
import { StatusBar } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Login from "./components/User/Login";
import { Icon } from "react-native-paper";
import Register from "./components/User/Register";
const stack = createNativeStackNavigator();

const StackNavigator = () => {
  return(
  <stack.Navigator>
    <stack.Screen name="Home" component={Home} options={{title: "Welcome to TechCommerce!"}}/>
    <stack.Screen name="Product" component={Product}/>
  </stack.Navigator>);
}

const Tab = createBottomTabNavigator();

const TabNavigator = () => {
  return(
    <Tab.Navigator screenOptions={{headerShown: true}}>
      <Tab.Screen name="Trang chủ" component={StackNavigator} options={{tabBarIcon: () => <Icon size={35} source={"home"}/>}} />
      <Tab.Screen name="login" component={Login} options={{tabBarIcon: () => <Icon size={35} source={"account"}/>}} />
      <Tab.Screen name="Đăng kí" component={Register} options={{tabBarIcon: () => <Icon size={35} source={"account-plus"}/>}}/>
    </Tab.Navigator>
  );
}

const App = () => {
  return (<NavigationContainer>
    <TabNavigator/>
  </NavigationContainer>);
}

export default App;