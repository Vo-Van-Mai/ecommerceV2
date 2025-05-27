import { Dimensions, FlatList, Image, RefreshControl, ScrollView, SectionList, StatusBar, StyleSheet, Switch, Text, View, Animated, TextComponent, SafeAreaView, TouchableOpacity } from "react-native";
import { useEffect, useState, useRef } from "react";
import { Button } from "react-native";
import { Chip, ActivityIndicator, TextInput, List, Searchbar } from "react-native-paper";
import { Colors } from "react-native/Libraries/NewAppScreen";
import Apis, { endpoints  } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import Styles from "./Styles";
import { LinearGradient } from "expo-linear-gradient";
import MyStyles from "../../style/MyStyles";
import { AntDesign } from "@expo/vector-icons";
import ProdcutCard, { ProductCardV2 } from "./ProductCard";
import ProductCard from "./ProductCard";

export const Items = (props) => {
    return <Text> Hello {props.firstName} {props.lastName}! </Text>
}

const Home = () => {

    const [categories, setCategoties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [products, setProducts] = useState([]);
    const [q, setQ] = useState();
    const [cateId, setCateId] = useState();
    const [page, setPage] = useState(1);
    const nav = useNavigation();
    

    const loadCate = async () => {
        let res = await Apis.get(endpoints ['categories']);
        setCategoties(res.data);
        console.log("CATEGORIES:", res.data);
    }

    const loadProduct = async () => {
        if (page > 0){
            try{
                setLoading(true)
                let url = `${endpoints ['products']}?page=${page}`;

                if (q) {
                    url = `${url}&name=${q}`;
                }

                if (cateId) {
                    url = `${url}&cate_id=${cateId}`
                }
                    
                let res = await Apis.get(url);
                setProducts(prevProducts => {
                const newProducts = res.data.results;
                return [
                    ...prevProducts,
                    ...newProducts.filter(p => !prevProducts.some(prev => prev.id === p.id))
                ];
                });
                console.info("Products: ", products)
                if (res.data.next === null)
                    setPage(0);
                console.info(url)
            }
            catch(err){
                console.error(err);
            }
            finally{
                setLoading(false);
                
            }
        }
    }

    const loadMore = () => {
        if (!loading && page > 0)
            setPage(page + 1);
    }

    useEffect(()=>{
        loadCate();
    },[])

    useEffect(() => {
        const timer = setTimeout(() => {
            loadProduct();
        }, 500);
        return () => clearTimeout(timer);
    }, [q, cateId, page])

    useEffect(() => {
        setPage(1);
        setProducts([]);
    }, [q, cateId])

    return (
        <LinearGradient style={[MyStyles.container, MyStyles.p]} colors={["#A8DEE0", "#F9E2AE"]} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            <SafeAreaView >
                    <View style={{alignItems: 'center'}}>
                    {/* <Text style={[MyStyles.brandName]}>Welcome to TechCommerce!</Text> */}
                </View>
                <View>
                    <Searchbar placeholder="Tìm kiếm sản phẩm..." value={q} onChangeText={setQ} style={MyStyles.searchBar}/>
                </View>

                <View style={{flexDirection: 'row', flexWrap:"wrap"}}>
                    <TouchableOpacity key={'all'} onPress={() => setCateId(null)}>
                        <Chip style={[{flexWrap: 'wrap', margin:5}, MyStyles.chip ]} icon="label">Tất cả</Chip>
                    </TouchableOpacity>
                    {categories.map(c => <TouchableOpacity key={c.id} onPress={() => setCateId(c.id)}>
                        <Chip style={{flexWrap: 'wrap', margin:5}} icon="label">{c.name}</Chip>
                    </TouchableOpacity>)}
                </View>
                <FlatList
                // ListHeaderComponent={
                //     <View>
                //     <Text style={{ fontSize: 16, fontWeight: "bold", margin: 5 }}>
                //         Sản phẩm bán chạy
                //     </Text>
                //     <FlatList
                //         horizontal
                //         data={products}
                //         keyExtractor={(item) => item.id.toString()}
                //         renderItem={({ item }) => (
                //         <TouchableOpacity onPress={() => nav.navigate("Product", { productId: item.id })}>
                //             <ProdcutCard item={item} />
                //         </TouchableOpacity>
                //         )}
                //         ListFooterComponent={loading && <ActivityIndicator size={35} style={{ margin: 10 }} />}
                //     />
                //     </View>
                // }
                data={products}
                keyExtractor={(item) => item.id.toString()}
                renderItem={({ item }) => (
                    <TouchableOpacity onPress={() => nav.navigate("Product", { productId: item.id })}>
                    <ProductCard item={item} />
                    </TouchableOpacity>
                )}
                numColumns={2}
                columnWrapperStyle={{ justifyContent: 'space-between' }}
                onEndReached={loadMore}
                ListFooterComponent={loading && <ActivityIndicator size={35} style={{ margin: 10 }} />}
                />

            </SafeAreaView>
        </LinearGradient>
    );
}

export default Home;
