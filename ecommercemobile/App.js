// App.js
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./components/Home/Home";
import Product from "./components/Product/Product";
import { Image, StatusBar, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Login from "./components/User/Login";
import { Icon } from "react-native-paper";
import Register from "./components/User/Register";
import { MyCartContext, MyDispatchContext, MySetCartContext, MyUserContext } from "./configs/Context";
import { useContext, useReducer } from "react";
import Profile from "./components/User/Profile";
import MyUserReducer from "./Reducer/MyUserReducer";
import ShopProduct from "./components/Shop/ShopProduct";
import AddProduct from "./components/Shop/AddProduct";
import { createDrawerNavigator } from "@react-navigation/drawer";
import EditProfile from "./components/User/EditProfile";
import Cart from "./components/Cart/Cart";
import MyCartReducer, { inittialCartState } from "./Reducer/MyCartReducer";

const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const ShopStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();

const HeaderTitle = () => {
  return (
    <View style={{ flexDirection: "row", alignItems: "center", height: 50 }}>
      <Image source={require('./assets/logo.png')} style={{ width: 40, height: 40, margin: 5, borderRadius: 20 }} />
      <Text style={{ fontSize: 15, color: "red" }}>NM-Commerce</Text>
    </View>
  );
};

const StackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="Home" component={Home} />
      <Stack.Screen name="Product" component={Product} />
    </Stack.Navigator>
  );
};

const AuthStackNavigator = () => {
  return (
    <AuthStack.Navigator screenOptions={{headerShown: false}}>
      <AuthStack.Screen name="Login" component={Login} />
      <AuthStack.Screen name="Register" component={Register} />
    </AuthStack.Navigator>
  );
};

const ShopStackNavigator = () => {
  return (
    <ShopStack.Navigator screenOptions={{ headerShown: false }}>
      <ShopStack.Screen name="ShopProduct" component={ShopProduct} />
      <ShopStack.Screen name="AddProduct" component={AddProduct} />
    </ShopStack.Navigator>
  );
};



const TabNavigator = () => {
  const user = useContext(MyUserContext);

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Trang chủ" component={StackNavigator} options={{ tabBarIcon: () => <Icon size={35} source="home" /> }} />

      {user?.role==="buyer" && <Tab.Screen name ="Giỏ hàng" component={Cart} options={{tabBarIcon: () => <Icon source="cart" size={35} /> }} /> }
      {user === null ? (
        <Tab.Screen name="Đăng nhập" component={AuthStackNavigator} options={{ tabBarIcon: () => <Icon size={35} source="account" /> }} />
      ) : (
        <Tab.Screen name="Hồ sơ" component={Profile} options={{ tabBarIcon: () => <Icon size={35} source="account" /> }} />
      )}

    </Tab.Navigator>
  );
};

// THÊM DRAWER Ở ĐÂY
const DrawerNavigator = () => {
  const user = useContext(MyUserContext);

  return (
    <Drawer.Navigator screenOptions={{ headerTitle: () => <HeaderTitle /> }} initialRouteName="Chính">
      <Drawer.Screen name="Chính" component={TabNavigator} />
      
      {user!=null && <>
        <Drawer.Screen name="Cập nhật hồ sơ" component={EditProfile} />
        {user?.role==="seller" && <Drawer.Screen name="Quản lý cửa hàng" component={ShopStackNavigator} />}
      </>}

    </Drawer.Navigator>
  );
};

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  const [cart, setCart] = useReducer(MyCartReducer, inittialCartState);

  return (
    <>
      <StatusBar barStyle="dark-content" backgroundColor="white" />
      <MyUserContext.Provider value={user}>
        <MyDispatchContext.Provider value={dispatch}>
          <MyCartContext value={cart}>
            <MySetCartContext value={setCart}>
              <NavigationContainer>
                <DrawerNavigator />
              </NavigationContainer>
            </MySetCartContext>
          </MyCartContext>
        </MyDispatchContext.Provider>
      </MyUserContext.Provider>
    </>
  );
};

export default App;
