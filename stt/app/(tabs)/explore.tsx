import React, { useState, useEffect, useCallback} from 'react';
import { FlatList, Text, View, Image, StyleSheet, TouchableOpacity,  Alert} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import AntDesign from '@expo/vector-icons/AntDesign';
import * as SQLite from 'expo-sqlite';

export default function TabTwoScreen() {
    type ItemProps = {
        id: number;
        title: string;
        price: string;
        category: string;
        description: string;
        image: string;
        quantity: number;
    };

    const [data, setData] = useState<ItemProps[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const getCartItems = () => {
        try {
            const db = SQLite.openDatabaseSync('cartDB');
            const cartItems = db.getAllAsync('SELECT * FROM cart');
            console.log('Успешная загрузка данных');
            return cartItems;
        } catch (e) {
            console.error('Ошибка загрузки данных корзины', e);
        }
    };

    const deleteItem = (id) => {
        try {
            const db = SQLite.openDatabaseSync('cartDB');
            db.runSync('DELETE FROM cart WHERE id = ?;', [id]);
            db.closeSync();
            console.log('Удалено из корзины', id);
            fetchData();
        } catch (e) {
            console.error('Ошибка при удалении', e);
        }
    };

    const increaseQuantity = (id) => {
        try {
            const db = SQLite.openDatabaseSync('cartDB');
            db.runSync('UPDATE cart SET quantity = quantity + 1 WHERE id = ?;', [id]);
            db.closeSync();
            fetchData();
        } catch(e) {
            console.error('Ошибка при добавлении', e);
        }
    };

    const decreaseQuantity = async (id) => {
        try {
            const db = SQLite.openDatabaseSync('cartDB');
            const result = db.getFirstSync('SELECT quantity FROM cart WHERE id = ?;', [id]);
            const quantity = result['quantity'];
            if (quantity > 1) {
                db.runSync('UPDATE cart SET quantity = quantity - 1 WHERE id = ?;', [id]);
            } else if (quantity === 1) {
                  db.runSync('DELETE FROM cart WHERE id = ?;', [id]);
            }
            db.closeSync();
            fetchData();
        } catch (e) {
            console.error('Ошибка при уменьшении количества:', e);
        }
    };

    const Item = (item: ItemProps) => (
            <View style={styles.item}>
              <Text style={styles.id}>{item.id}</Text>
              <Text style={styles.category}>{item.category}</Text>
              <Text style={styles.title}>{item.title}</Text>
              <Image style={styles.image} source={{ uri: item.image }} />
              <Text style={styles.price}>{item.price}</Text>
              <Text style={styles.description}>{item.description}</Text>
              <View style={styles.quantityContainer}>
                <TouchableOpacity style={styles.decreaseButton} onPress={() => decreaseQuantity(item.id)}>
                    <Text style={styles.buttonM}>-</Text>
                </TouchableOpacity>
                      <Text style={styles.quantity}>{item.quantity}</Text>
                <TouchableOpacity style={styles.increaseButton} onPress={() => increaseQuantity(item.id)}>
                    <Text style={styles.buttonM}>+</Text>
                  </TouchableOpacity>
                <TouchableOpacity style={styles.buttonOrder} onPress={() => Alert.alert('Заглушка')}>
                    <Text style={styles.buttonText}>Заказать</Text>
                  </TouchableOpacity>
                <TouchableOpacity style={styles.deleteButton} onPress={() => deleteItem(item.id)}>
                    <Text><AntDesign name="delete" size={35} color="black" /></Text>
                </TouchableOpacity>
              </View>
            </View>
          );

    const fetchData = async () => {
        setRefreshing(true);
        try {
            const result = await getCartItems();
            setData(result);
        } catch (error) {
            console.error('Ошибка при загрузке данных fetch Cart:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const renderEmptyComponent = () => (
        <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>Корзина пуста</Text>
        </View>
    );

    useFocusEffect(
        useCallback(() => {
            fetchData();
        }, [])
    );

    useEffect(() => {
        fetchData();
    }, []);

    return (
        <SafeAreaProvider>
            <SafeAreaView style={styles.container}>
            <FlatList
                data={data}
                renderItem={({item}) => <Item id={item.id} category={item.category} title={item.title} image={item.image} price={parseInt(item.price) * parseInt(item.quantity) + '$'} quantity={parseInt(item.quantity) + ' шт.'} description={item.description} />}
                ListHeaderComponent={
                    <View style={styles.header}>
                        <Text style={styles.headerText}>Корзина</Text>
                    </View>
                }
                ListFooterComponent={
                    <View style={styles.footer}>
                        <Text style={styles.footerText}>Лабораторная работа 4. Получение данных из API и сохранение в локальную базу данных.</Text>
                    </View>
                }
                refreshing={refreshing}
                onRefresh={fetchData}
                ListEmptyComponent={renderEmptyComponent}
              />
          </SafeAreaView>
        </SafeAreaProvider>
      )
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'black',
        flexGrow: 1,
    },
    emptyContainer: {
        flex: 1,
        alignItems: 'center',
        backgroundColor: '#9e45d3',
        height: '100%',
        justifyContent: 'center',
        textAlign: 'center',
    },
    emptyText: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#ffffff',
    },
    quantityContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    quantity:{
        fontSize: 18,
        fontWeight: 'bold',
        color: '#9e45d3',
    },
    buttonM:{
        fontSize: 18,
        fontWeight: 'bold',
        color: '#36124b',
        margin: 10,
    },
    item: {
        backgroundColor: '#ffffff',
        borderRadius: 5,
        padding: 16,
        marginVertical: 8,
        marginHorizontal: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 4,
        alignItems: 'center',
    },
    id:{
        fontSize: 8,
        color:'#ffffff',
    },
    category: {
        fontSize: 12,
        color: '#25032A',
        marginBottom: 4,
    },
    title: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#333',
        marginBottom: 8,
    },
    image: {
        width: '70%',
        height: 250,
        borderRadius: 10,
        marginBottom: 8,
    },
    price: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#AF4CA0',
        marginBottom: 8,
    },
    description: {
        fontSize: 15,
        color: '#666',
        lineHeight: 20,
        marginBottom: 16,
    },
    deleteButton: {
        marginLeft: 20,
    },
    buttonOrder: {
        backgroundColor: '#9e45d3',
        paddingVertical: 12,
        paddingHorizontal: 20,
        borderRadius: 5,
        alignItems: 'center',
        marginLeft:50,
    },
    buttonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
    header: {
        color: '#A917A4',
        backgroundColor: 'white',
    },
    footer: {
        padding: 20,
        backgroundColor: 'white',
        alignSelf: 'stretch',
        marginTop: 'auto',

    },
    headerText: {
        fontSize: 20,
        fontWeight: 'bold',
        textAlign: 'center',
    },
    footerText: {
        fontSize: 16,
        textAlign: 'center',
    },
  });
