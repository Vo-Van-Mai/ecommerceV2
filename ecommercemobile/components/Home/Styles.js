import { StyleSheet } from "react-native";

export default StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: '#ffffff',
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
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    width: '48%',
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 100,
    height: 100,
    resizeMode: 'contain',
    borderRadius: 12,
    backgroundColor: '#f9f9f9',
  },
  productName: {
    fontSize: 14,
    fontWeight: '500',
    marginTop: 8,
    color: '#222',
  },
  productPrice: {
    fontSize: 14,
    color: '#00a86b',
    fontWeight: 'bold',
  },
});
