import React, { use, useState } from 'react';
import { AntDesign } from '@expo/vector-icons'; // dùng icon trái tim
import MyStyles from '../../style/MyStyles';
import Styles from './Styles';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { useNavigation } from '@react-navigation/native';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // padding 16 + gap 16

const ProductCard = ({item}) => {
  const [like, setLike] = useState(false)

  const isLike = () => {
    if (like) {
      setLike(false);
    }
    else setLike(true);
  }

  return (
    <View style={styles.card}>
      <Image
                style={[Styles.image]}
                source={
                    item.images && item.images.length > 0 && item.images[0].pathImg
                    ? { uri: item.images[0].pathImg }
                    : require("../../assets/default_product_image.jpg")
                } />
      
      <TouchableOpacity style={styles.heartIcon} onPress={isLike}>
        {like?(
          <AntDesign name={"heart"} size={20} color={"#E55B5B"}/>
        ):(
          <AntDesign name={"hearto"} size={20} color={"#E55B5B"}/>
        )}
      </TouchableOpacity>

      <Text style={styles.name} numberOfLines={2}>{item.name}</Text>
      <Text style={styles.price}>${item.price}</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    overflow: 'hidden',
    paddingBottom: 12,
    position: 'relative',
  },
  image: {
    width: '100%',
    height: CARD_WIDTH * 1.2,
    borderTopLeftRadius: 12,
    borderTopRightRadius: 12,
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
    color: '#222',
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    marginTop: 4,
    marginHorizontal: 10,
    color: '#000',
  },
});


export default ProductCard;