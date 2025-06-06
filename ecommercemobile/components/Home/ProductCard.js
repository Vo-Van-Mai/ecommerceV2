import React, { use, useContext, useState } from 'react';
import { AntDesign } from '@expo/vector-icons'; // dùng icon trái tim
import MyStyles from '../../style/MyStyles';
import Styles from './Styles';
import { View, Text, Image, TouchableOpacity, StyleSheet, Dimensions, ActivityIndicator, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { MyUserContext } from '../../configs/Context';
import { authAPI, endpoints } from '../../configs/Apis';

const { width } = Dimensions.get('window');
const CARD_WIDTH = (width - 48) / 2; // padding 16 + gap 16

const ProductCard = ({item}) => {
    console.log("item", item)
  const [like, setLike] = useState(false)
  const [loading, setLoading] = useState(true);
    const user = useContext(MyUserContext)
    const nav = useNavigation()

    const likeProduct = async (productId) => {
      if(user.role==="buyer"){
        const url = `${endpoints['like'](productId)}`;
        const res = await authAPI(user.token).post(url);
        console.log("res", res)
      }
    }


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
          <View style={styles.card}>
              <View style={styles.imageContainer}>
                  {loading && (
                      <View style={styles.loadingContainer}>
                          <ActivityIndicator size="small" color="#18A5A7" />
                      </View>
                  )}
                  <Image
                      style={styles.image}
                      source={
                          item.images && item.images.length > 0 && item.images[0].pathImg
                              ? { uri: item.images[0].pathImg }
                              : require("../../assets/default_product_image.jpg")
                      }
                      onLoadEnd={() => setLoading(false)}
                  />
                  <TouchableOpacity
                      style={styles.heartButton}
                    onPress={() => {
                        if(user?.role==="buyer"){
                            setLike(!like)
                            likeProduct(item.id)
                        }
                        else{
                            Alert.alert("Bạn cần đăng nhập để thực hiện hành động này", "Vui lòng đăng nhập để thực hiện hành động này", [
                                {
                                    text: "Đăng nhập",
                                    onPress: () => nav.navigate("Đăng nhập")
                                },
                                {
                                    text: "Đóng",
                                    style: "cancel"
                                },

                            ])
                        }
                      }}
                  >
                      <Icon
                          name={like ? "heart" : "heart-outline"}
                          size={20}
                          color={like ? "#e91e63" : "#666"}
                      />
                  </TouchableOpacity>
              </View>
              
              <View style={styles.infoContainer}>
                  <Text style={styles.name} numberOfLines={2}>
                      {item.name}
                  </Text>
                  <Text style={styles.price}>
                      {formatCurrency(parseInt(item.price))}
                  </Text>
                  <View style={styles.statsContainer}>
                      <View style={styles.ratingContainer}>
                          <Icon name="star" size={14} color="#FFD700" />
                          <Text style={styles.ratingText}>4.5</Text>
                      </View>
                      <Text style={styles.soldCount}>Đã bán {item.sold}</Text>
                  </View>
              </View>
          </View>
      );
  };
  
  const styles = StyleSheet.create({
      card: {
          backgroundColor: '#fff',
          borderRadius: 12,
          overflow: 'hidden',
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 4,
      },
      imageContainer: {
          position: 'relative',
          aspectRatio: 1,
          backgroundColor: '#f5f5f5',
      },
      loadingContainer: {
          ...StyleSheet.absoluteFillObject,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: '#f5f5f5',
      },
      image: {
          width: '100%',
          height: '100%',
          resizeMode: 'cover',
      },
      heartButton: {
          position: 'absolute',
          top: 8,
          right: 8,
          backgroundColor: '#fff',
          borderRadius: 20,
          padding: 6,
          elevation: 2,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: 2 },
          shadowOpacity: 0.1,
          shadowRadius: 2,
      },
      infoContainer: {
          padding: 12,
      },
      name: {
          fontSize: 14,
          fontWeight: '500',
          color: '#333',
          marginBottom: 4,
          lineHeight: 20,
      },
      price: {
          fontSize: 16,
          fontWeight: 'bold',
          color: '#18A5A7',
          marginBottom: 8,
      },
      statsContainer: {
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'center',
      },
      ratingContainer: {
          flexDirection: 'row',
          alignItems: 'center',
      },
      ratingText: {
          marginLeft: 4,
          fontSize: 12,
          color: '#666',
      },
      soldCount: {
          fontSize: 12,
          color: '#666',
      },
  });

export default ProductCard;