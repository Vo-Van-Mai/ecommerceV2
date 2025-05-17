import { Dimensions, FlatList, Image, RefreshControl, ScrollView, SectionList, StatusBar, StyleSheet, Switch, Text, View, Animated, TextComponent, SafeAreaView, TouchableOpacity } from "react-native";
import { useEffect, useState, useRef } from "react";
import { Button } from "react-native";
import { Chip, ActivityIndicator, TextInput, List, Searchbar } from "react-native-paper";
import { Colors } from "react-native/Libraries/NewAppScreen";
import Apis, { endpoinds } from "../../configs/Apis";
import { useNavigation } from "@react-navigation/native";
import Styles from "./Styles";

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
        let res = await Apis.get(endpoinds['categories']);
        setCategoties(res.data);
    }

    const loadProduct = async () => {
        if (page > 0){
            try{
                setLoading(true)
                let url = `${endpoinds['products']}?page=${page}`;

                if (q) {
                    url = `${url}&name=${q}`;
                }

                if (cateId) {
                    url = `${url}&cate_id=${cateId}`
                }
                    
                let res = await Apis.get(url);
                setProducts([...products, ...res.data.results]);
                if (res.data.next == null)
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

    // useEffect(() => {
    //     setPage(1);
    //     setProducts([]);
    // }, [q, cateId])

    return (
        
        <SafeAreaView style={[Styles.container, Styles.p]} >
            <StatusBar backgroundColor="gray"/>
            <View style={{alignItems: 'center'}}>
                <Text style={[Styles.brandName]}>Welcome to TechCommerce!</Text>
            </View>
            <Searchbar placeholder="Tìm kiếm sản phẩm..." value={q} onChangeText={setQ} style={Styles.searchBar}/>

            <View style={{flexDirection: 'row', flexWrap:"wrap"}}>
                <TouchableOpacity onPress={() => setCateId(null)}>
                    <Chip style={{flexWrap: 'wrap', margin:5}} icon="label">Tất cả</Chip>
                </TouchableOpacity>
                {categories.map(c => <TouchableOpacity key={c.id} onPress={() => setCateId(c.id)}>
                    <Chip style={{flexWrap: 'wrap', margin:5}} icon="label">{c.name}</Chip>
                </TouchableOpacity>)}
            </View>

            <FlatList onEndReached={loadMore} ListFooterComponent={loading && <ActivityIndicator size={30} style={[{margin: 10}]} />} 
            data={products} renderItem={({item}) => <List.Item title={item.name} description={item.price} left={() => <TouchableOpacity onPress={() => nav.navigate("Product", {'productId': item.id})}>
                <Image style={Styles.image}  source={{uri: item.image}} />
            </TouchableOpacity>}/> }   />
        </SafeAreaView>
    );
}

export default Home;
