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
   
}); 