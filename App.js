import { StatusBar } from 'expo-status-bar';
import { FlatList, StyleSheet, View } from 'react-native';
import { useEffect, useState } from 'react';
import * as SQLite from 'expo-sqlite';
import { Button, Header, Icon, Input, ListItem } from'react-native-elements';

const db = SQLite.openDatabase('shoppinglist.db');

export default function App() {

  const [product, setProduct] = useState('');
  const [amount, setAmount] = useState('');
  const [list, setList] = useState([]);

  // Create a shopping list:
  useEffect(() => {
    db.transaction(text => {
      text.executeSql('create table if not exists shoppinglist (id integer primary key not null, amount text, product text);');
    }, null, updateList);
  }, []);

  // Add products to the shopping list:
  const saveProduct = () => {
    db.transaction(text => {
      text.executeSql('insert into shoppinglist (amount, product) values (?, ?);', [amount, product]);
    }, null, updateList);
    setProduct('');
    setAmount('');
  };

  // Update the shopping list:
  const updateList = () => {
    db.transaction(text => {
      text.executeSql('select * from shoppinglist;', [], (_, { rows }) => setList(rows._array));
    }, null, null);
  };

  // Delete products from the shopping list:
  const deleteProduct = (id) => {
    db.transaction(text => {
      text.executeSql('delete from shoppinglist where id = ?;', [id]);
    }, null, updateList)
  };

  // Render items:
  const renderItem = ({ item }) => (
    <ListItem bottomDivider>
      <ListItem.Content>
        <View style={styles.shoppinglist}>
          <View style={styles.products}>
            <ListItem.Title>{item.product}</ListItem.Title>
            <ListItem.Subtitle>{item.amount}</ListItem.Subtitle>
          </View>
          <ListItem onPress={() => deleteProduct(item.id)}>
            <Icon type="material" name="delete" color='red' />
          </ListItem>
        </View>
      </ListItem.Content>
    </ListItem>);

  return (
    <View style={styles.container}>

      <Header
        centerComponent={{ text: 'SHOPPING LIST', style: { color: '#fff', height: 35, textAlignVertical: 'center' } }} />
      <Input 
        style={styles.input}
        label='PRODUCT'
        placeholder='Product'
        onChangeText={product => setProduct(product)}
        value={product} />
      <Input
        style={styles.input}
        label='AMOUNT'
        placeholder='Amount'
        keyboardType='numeric'
        onChangeText={amount => setAmount(amount)}
        value={amount} />
      <View style={styles.button}>
        <Button onPress={saveProduct} icon={{name: 'save', color: 'white'}} title="Save" />
      </View>

      <FlatList
        style={styles.renderedList}
        data={list}
        keyExtractor={item => item.id.toString()}
        renderItem={renderItem}
       />
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
  },
  input: {
    width: '95%',
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1,
  },
  button: {
    width: 150,
    textAlign: 'center',
    marginTop: 10,
    marginBottom: 20,
  },
  shoppinglist: {
    flexDirection: 'row',
    alignSelf: 'center',
  },
  renderedList: {
    width: '100%',
  },
  products: {
    width: 330,
    paddingTop: 5,
    borderBottomColor: 'lightgrey',
    borderBottomWidth: 1,
  },
});