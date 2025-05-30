import React, { use, useState } from 'react';
import { AntDesign } from '@expo/vector-icons'; // dùng icon trái tim
import MyStyles from '../../style/MyStyles';
import Styles from './Styles';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // padding 16 + gap 16

const ProductCard = ({item}) => {
  const [like, setLike] = useState(false)
  const [loading, setLoading] = useState(true);

  const isLike = () => {
    if (like) {
      setLike(false);
    }
    else setLike(true);
  }
  const formatCurrency = (value) => {
        return new Intl.NumberFormat('vi-VN', {
            style: 'currency',
            currency: 'VND',
        }).format(value);
        };

  return (
    // <LinearGradient style={styles.card}
    // colors={["#18A5A7", "#B6C0C5"]} // 112D60 B6C0C5, 18A5A7 B6C0C5, FDABDD 374A5A
    // start={{ x: 0, y: 0 }}
    // end={{ x: 1, y: 1 }}>
    <View style={styles.card}>
    {loading && <ActivityIndicator style={StyleSheet.absoluteFill} size="small" color="#666" />}
      <Image
        style={[styles.image]}
        source={
            item.images && item.images.length > 0 && item.images[0].pathImg
            ? { uri: item.images[0].pathImg }
            : require("../../assets/default_product_image.jpg")
        } 
        onLoadEnd={() => setLoading(false)}/>
      
      <TouchableOpacity style={styles.heartIcon} onPress={isLike}>
        {like?(
          <AntDesign name={"heart"} size={20} color={"#E55B5B"}/>
        ):(
          <AntDesign name={"hearto"} size={20} color={"#E55B5B"}/>
        )}
      </TouchableOpacity>

      <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.price}>{formatCurrency(item.price)}</Text>
    {/* </LinearGradient> */}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#00203fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    paddingBottom: 12,
    position: 'relative',
    alignItems: "center",
    padding: 5
  },
  image: {
    width: CARD_WIDTH * 0.95,
    height: CARD_WIDTH * 1.2,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
    resizeMode: 'cover',
    borderRadius: 30,    
  },
  // Icon like
  heartIcon: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: '#fff',
    padding: 4,
    borderRadius: 20,
    elevation: 3,
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    marginHorizontal: 10,
    color: '#ADEFD1FF',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
    marginHorizontal: 10,
    color: '#ffffff',
  },
});


export default ProductCard;