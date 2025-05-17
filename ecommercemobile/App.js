import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import Home from "./components/Home/Home";
import Product from "./components/Product/Product";
const stack = createNativeStackNavigator();

const StackNavigator = () => {
  return(
  <stack.Navigator>
    <stack.Screen name="Home" component={Home} options={{title: "Welcome to TechCommerce!"}}/>
    <stack.Screen name="Product" component={Product}/>
  </stack.Navigator>);
}

const App = () => {
  return (<NavigationContainer>
    <StackNavigator/>
  </NavigationContainer>);
}

export default App;