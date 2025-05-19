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
    backgroundColor: '#CBE5AE',
    borderRadius: 16,
    padding: 10,
    marginBottom: 16,
    width: '90%',
    height: 150 ,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  image: {
    width: 90,
    height: 110,
    resizeMode: 'center',
    borderRadius: 12,
    backgroundColor: '#ffffff'
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
