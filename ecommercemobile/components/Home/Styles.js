import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    // backgroundColor: '#ffffff',
  },
  brandName: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#006b6c',
    textAlign: 'center',
    marginBottom: 16,
  },
  searchBar: {
    borderRadius: 12,
    marginBottom: 16,
    backgroundColor: 'rgb(188, 220, 255)',
    opacity: 0.5,
    borderColor: '#000000',
    borderWidth: 1
  },
  categories: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
  },
  chip: {
    margin: 4,
    backgroundColor: '#fff',
    elevation: 2,
  },
  card: {
    width: 230,
    height: 280,
    borderRadius: 12,
    backgroundColor: '#fff',
    padding: 10,
    marginRight: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 3,
    position: 'relative',
  },
  favoriteButton: {
    position: 'absolute',
    top: 8,
    right: 8,
    zIndex: 1,
  },
  image: {
    width: '100%',
    height: 200,
    borderRadius: 8,
    marginBottom: 8,
    resizeMode: 'cover',
  },
  name: {
    fontSize: 14,
    fontWeight: '500',
    color: '#333',
    marginBottom: 4,
  },
  priceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  price: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#000',
  },
  oldPrice: {
    fontSize: 13,
    color: '#888',
    textDecorationLine: 'line-through',
  },
});
