import React, { useState, useEffect, useCallback} from 'react';
import { FlatList, Text, View, Image, StyleSheet, TouchableOpacity} from 'react-native';
import { useFocusEffect } from '@react-navigation/native';
import {SafeAreaView, SafeAreaProvider} from 'react-native-safe-area-context';
import FontAwesome5 from '@expo/vector-icons/FontAwesome5';
import * as SQLite from 'expo-sqlite';

export default function HomeScreen() {
    type ItemProps = {
        id: number;
        title: string;
        price: string;
        category: string;
        description: string;
        image: string;
      };

    const [data, setData] = useState<ItemProps[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    const initDB = () => {
        try {
            const db = SQLite.openDatabaseSync('cartDB');
            db.execAsync(`
                PRAGMA journal_mode = WAL;
                CREATE TABLE IF NOT EXISTS cart (
                    id INTEGER PRIMARY KEY NOT NULL,
                    category TEXT,
                    title TEXT,
                    image TEXT,
                    price REAL,
                    description TEXT,
                    quantity INTEGER NOT NULL
                  );
            `);
            console.log('Таблица создана');
        } catch (e) {
            console.error('Ошибка в создании таблицы', e);
        }
    };

    const handleAddToCart = (item: ItemProps) => {
        try {
            const db = SQLite.openDatabaseSync('cartDB');
            db.runAsync(`
              INSERT INTO cart (id, category, title, image, price, description, quantity)
              VALUES (?, ?, ?, ?, ?, ?, ?) ON CONFLICT(id) DO UPDATE SET quantity = quantity + 1;`,
              item.id, item.category, item.title, item.image, parseInt(item.price), item.description, 1);
           const temp = db.getEachAsync(`SELECT * FROM cart`)
          console.log('Добавлен в корзину');
        } catch(e) {
          console.log("Ошибка добавления в корзину БД", e);
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
            <View style={styles.button}>
            <TouchableOpacity onPress={() => handleAddToCart(item)}>
                <FontAwesome5 name="shopping-cart" size={24} color="#9e45d3" />
            </TouchableOpacity>
            </View>
        </View>
      );
    const fetchData = async () => {
        setRefreshing(true);
        try {
            const response = await fetch('https://fakestoreapi.com/products');
            const result = await response.json();
            setData(result);
        } catch (error) {
              console.error('Ошибка при загрузке данных:', error);
        } finally {
          setRefreshing(false);
        }
    };
    useFocusEffect(
      useCallback(() => {
          fetchData();
      }, [])
    );
  
    useEffect(() => {
        initDB();
        fetchData();
    }, []);

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container}>
        <FlatList
          data={data}
          renderItem={({item}) => <Item id={item.id} category={item.category} title={item.title} image={item.image} price={item.price + '$'} description={item.description}/>}
          ListHeaderComponent={
            <View style={styles.header}>
                <Text style={styles.headerText}>Магазин</Text>
            </View>
          }
          ListFooterComponent={
            <View style={styles.footer}>
                <Text style={styles.footerText}>Лабораторная работа 4. Получение данных из API и сохранение в локальную базу данных.</Text>
            </View>
          }
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
    fontSize: 14,
    color: '#666',
    lineHeight: 20,
    marginBottom: 16,
  },
  button: {
    backgroundColor: '#ffffff',
    borderRadius: 5,
    paddingVertical: 10,
    alignItems: 'center',
  },
  buttonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  header: {
    color: '#A917A4',
    backgroundColor: '#FFFFFF',
  },
  footer: {
    padding: 20,
    backgroundColor: '#f8f8f8',
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
