// App.js
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./components/Home/Home";
import Product from "./components/Product/Product";
import { Image, StatusBar, Text, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Login from "./components/User/Login";
// import { Icon } from "react-native-paper";
import Register from "./components/User/Register";
import { MyDispatchContext, MyUserContext } from "./configs/Context";
import { useContext, useReducer } from "react";
import Profile from "./components/User/Profile";
import MyUserReducer from "./Reducer/MyUserReducer";
import ShopProduct from "./components/Shop/ShopProduct";
import AddProduct from "./components/Shop/AddProduct";
import { createDrawerNavigator } from "@react-navigation/drawer";
import EditProfile from "./components/User/EditProfile";
import Cart from "./components/Cart/Cart";
import MyCartReducer, { inittialCartState } from "./Reducer/MyCartReducer";
import { MyCartContext, MySetCartContext } from "./configs/CartContext";
import MyOrderReducer, { initialOrderState } from "./Reducer/MyOrderReducer";
import { MyOrderContext, MySetOrderContext } from "./configs/OrderContext";
import { Provider as PaperProvider } from 'react-native-paper';
import Order from "./components/Order/Order";
import Icon from 'react-native-vector-icons/FontAwesome';
import ListSeller from "./components/Staff/ListSeller";
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const ShopStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const ProfileStack = createNativeStackNavigator();

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

const ProfileStackNavigator = () => {
  return (
    <ProfileStack.Navigator screenOptions={{ headerShown: false }}>
      <ProfileStack.Screen name="Tôi" component={Profile} options={{headerShown: false}} />
      <ProfileStack.Screen name="Đơn hàng" component={Order} options={{headerShown: true}} />
    </ProfileStack.Navigator>
  );
};



const TabNavigator = () => {
  const user = useContext(MyUserContext);
  const cart = useContext(MyCartContext);

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Trang chủ" component={StackNavigator} options={{ tabBarIcon: () => <Icon size={35} name="home" /> }} />

      {user?.role==="buyer" && <Tab.Screen name ="Giỏ hàng" component={Cart} options={{tabBarIcon: () => 
        (<Icon name="shopping-cart" size={28} />), tabBarBadge: cart?.items?.length > 0 ? cart.items.length : null,  }} /> }
      
      {user?.role==="staff" && <Tab.Screen name="Danh sách" component={ListSeller} options={{ tabBarIcon: () => <Icon size={28} name="users" /> }} />}
      
      {user === null ? (
        <Tab.Screen name="Đăng nhập" component={AuthStackNavigator} options={{ tabBarIcon: () => <Icon size={28} name="user-circle-o" /> }} />
      ) : (
        <Tab.Screen name="Hồ sơ" component={ProfileStackNavigator} options={{ tabBarIcon: () => <Icon size={28} name="user-circle-o" /> , tabBarLabel: "Tôi"}} />
      )}


    </Tab.Navigator>
  );
};

// THÊM DRAWER Ở ĐÂY
const DrawerNavigator = () => {
  const user = useContext(MyUserContext);
  const cart = useContext(MyCartContext);

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
  const [order, setOrder] = useReducer(MyOrderReducer, initialOrderState);
  return (
    <PaperProvider>

      <>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <MyUserContext.Provider value={user}>
          <MyDispatchContext.Provider value={dispatch}>
            <MyCartContext.Provider value={cart}>
              <MySetCartContext.Provider value={setCart}>
                <MyOrderContext.Provider value={order}>
                  <MySetOrderContext.Provider value={setOrder}>
                    <NavigationContainer>
                      <DrawerNavigator />
                    </NavigationContainer>
                  </MySetOrderContext.Provider>
                </MyOrderContext.Provider>
              </MySetCartContext.Provider>
            </MyCartContext.Provider>
          </MyDispatchContext.Provider>
        </MyUserContext.Provider>
      </>
    </PaperProvider>
  );
};

export default App;
