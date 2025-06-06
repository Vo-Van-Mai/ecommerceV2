// App.js
import { NavigationContainer, useNavigation } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./components/Home/Home";
import Product from "./components/Product/Product";
import { Image, StatusBar, Text, TouchableOpacity, View } from "react-native";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import Login from "./components/User/Login";
// import { Icon } from "react-native-paper";
import Register from "./components/User/Register";
import { MyDispatchContext, MyUserContext } from "./configs/Context";
import { useContext, useEffect, useReducer } from "react";
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
import ConfirmOrder from "./components/Order/ConfirmOrder";
import DeliveringOrder from "./components/Order/DeliveringOrder";
import HistoryOrder from "./components/Order/HistoryOrder";
import CreateShop from "./components/Shop/CreateShop";
import { MySetShopContext, MyShopContext } from "./configs/ShopContext";
import ShopReducer, { initialShopState } from "./Reducer/ShopReducer";
import ShopManagement from "./components/Shop/ShopManagement";
import AdminManagement from "./components/Amin/AdminManagement";
import CreateStaffForm from "./components/Staff/CreateStaffForm";
import Shop from "./components/Shop/Shop";
import LikeProduct from "./components/User/LikeProduct";
import RatingOrder from "./components/Order/RatingOrder";
const Stack = createNativeStackNavigator();
const AuthStack = createNativeStackNavigator();
const ShopStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Drawer = createDrawerNavigator();
const ProfileStack = createNativeStackNavigator();
const AdminStack = createNativeStackNavigator();
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
      <Stack.Screen name="Product" component={Product} options={{headerShown: true}}/>
      <Stack.Screen name="Shop" component={Shop} options={{headerShown: true}}/>
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
      <ShopStack.Screen name="ShopManagement" component={ShopManagement} />
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
      <ProfileStack.Screen name="Chờ lấy hàng" component={ConfirmOrder} options={{headerShown: true}} />
      <ProfileStack.Screen name="Đang giao hàng" component={DeliveringOrder} options={{headerShown: true}} />
      <ProfileStack.Screen name="Đánh giá đơn hàng" component={RatingOrder} options={{headerShown: true}} />
      <ProfileStack.Screen name="Lịch sử đơn hàng" component={HistoryOrder} options={{headerShown: true}} />
    </ProfileStack.Navigator>
  );
};


const AdminStackNavigator = () => {
  return (
    <AdminStack.Navigator screenOptions={{ headerShown: false }}>
      <AdminStack.Screen name="AdminManagement" component={AdminManagement} />
      <AdminStack.Screen name="CreateStaff" component={CreateStaffForm} options={{headerTitle: "Thêm nhân viên"}}/>
    </AdminStack.Navigator>
  );
};



const TabNavigator = () => {
  const user = useContext(MyUserContext);
  const cart = useContext(MyCartContext);

  return (
    <Tab.Navigator screenOptions={{ headerShown: false }}>
      <Tab.Screen name="Trang chủ" component={StackNavigator} options={{ tabBarIcon: () => <Icon size={35} name="home" /> }} />

      {user?.role==="buyer" && (<>
        <Tab.Screen name ="Giỏ hàng" component={Cart} options={{tabBarIcon: () => 
        (<Icon name="shopping-cart" size={28} />), tabBarBadge: cart?.items?.length > 0 ? cart.items.length : null,  }} /> 
        <Tab.Screen name ="Yêu thích" component={LikeProduct} options={{tabBarIcon: () => 
        (<Icon name="heart" size={28} />) }} /> 
      </>)}
      
      {user?.role==="staff" && <Tab.Screen name="Danh sách" component={ListSeller} options={{ tabBarIcon: () => <Icon size={28} name="users" /> }} />}
      
      {user?.role==="admin" && <Tab.Screen name="Danh sách" component={ListSeller} options={{ tabBarIcon: () => <Icon size={28} name="users" /> }} />}
      
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
  const shop = useContext(MyShopContext);
  console.log("shop:", shop);
  console.log("user:", user);
  return (
    <Drawer.Navigator screenOptions={{ headerTitle: () => <HeaderTitle /> }} initialRouteName="Chính">
      <Drawer.Screen name="Chính" component={TabNavigator} />
      
      {user != null && (
      <>
        <Drawer.Screen name="Cập nhật hồ sơ" component={EditProfile} />

        {user?.role === "seller" && user?.is_verified_seller === true && (
          <>
            {!shop?.shop?.user || shop.shop.user !== user.id ? (
              <Drawer.Screen name="Tạo cửa hàng" component={CreateShop} />
            ) : (
              <Drawer.Screen
                name="Quản lý cửa hàng"
                component={ShopStackNavigator}
                options={{ headerShown: true }}
              />
            )}
          </>
        )}
      </>
    )}

    {user?.role==="admin" && <Drawer.Screen name="Quản lý hệ thống" component={AdminStackNavigator} />}


      {user!=null &&<Drawer.Screen name="Đăng xuất" component={() => {
          const setCart = useContext(MySetCartContext);
          const setOrder = useContext(MySetOrderContext);
          const dispatch = useContext(MyDispatchContext);
          const nav = useNavigation();
          const logout = () => {
            dispatch({
                "type": "logout"
            });
            setCart({});
            // nav.navigate("Trang chủ");
            setOrder({
                type: "reset_order"
            })
        };
        useEffect(() => {
          logout();
        }, []);
          return (
            <View>
              <Text>Đăng xuất</Text>
            </View>
          )
        }} />}
    </Drawer.Navigator>
  );
};

const App = () => {
  const [user, dispatch] = useReducer(MyUserReducer, null);
  const [cart, setCart] = useReducer(MyCartReducer, inittialCartState);
  const [order, setOrder] = useReducer(MyOrderReducer, initialOrderState);
  const [shop, setShop] = useReducer(ShopReducer,initialShopState);
  return (
    <PaperProvider>

      <>
        <StatusBar barStyle="dark-content" backgroundColor="white" />
        <MyUserContext.Provider value={user}>
          <MyDispatchContext.Provider value={dispatch}>
            <MyShopContext.Provider value={shop}>
              <MySetShopContext.Provider value={setShop}>
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
              </MySetShopContext.Provider>
            </MyShopContext.Provider>
          </MyDispatchContext.Provider>
        </MyUserContext.Provider>
      </>
    </PaperProvider>
  );
};

export default App;
