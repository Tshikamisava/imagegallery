import { Image, ImageBackground, SafeAreaView, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import React, { useEffect, useState } from 'react'
import * as SQLite from 'expo-sqlite';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons'
import { useNavigation } from '@react-navigation/native';

export default function Gallery() {
    const navigation = useNavigation()

    const [pictures, setPictures] = useState([])
    const db = SQLite.openDatabase('photos.db');

    useEffect(() => {
        getImages()
    }, [])
    const getImages = () => {
        db.transaction(tx => {
            tx.executeSql(
                'SELECT * FROM photos',
                [],
                (_, result) => {
                    const images = result.rows._array;
                    setPictures(images)
                    console.log('Saved images:', images);
                },
                (_, error) => {
                    console.log('Error retrieving images:', error);
                }
            );
        }, (err) => {
            console.log({ err });
        }, (result) => {
            console.log({ result });
        });
    };

    function deleteFun(itemId) {
        console.log(itemId);
        db.transaction((tx) => {
            tx.executeSql('DELETE FROM photos WHERE id = ?', [itemId], (tx, results) => {
                if (results.rowsAffected > 0) {
                    console.log('Item deleted successfully');
                   navigation.navigate('Home')
                } else {
                    console.log('Item not found');
                }
            })
        })
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topContainer}>
                <TouchableOpacity
                    onPress={() => navigation.navigate("Home")}
                >
                    <MaterialCommunityIcons name='keyboard-backspace' size={30} color={"#fff"} />

                </TouchableOpacity>
                <Text style={styles.heading}>Photos</Text>
                <TouchableOpacity>
                    <MaterialCommunityIcons name='dots-vertical' size={30} color={"white"} />
                </TouchableOpacity>
            </View>
            {
                pictures.length > 0 &&
                <ScrollView style={styles.gallery}>
                    {pictures.map((pic, index) => (
                        <View style={styles.scrollCon} key={index}>
                            <ImageBackground source={{ uri: pic.uri }} style={{ width: 300, height: 300, marginBottom: 30 }} >
                                <TouchableOpacity onPress={() => deleteFun(pic.id)}>
                                    <MaterialCommunityIcons name='delete' size={30} color={"white"} style={styles.delete} />
                                </TouchableOpacity>
                                <Text style={styles.city}>{pic.city}</Text>
                            </ImageBackground>

                        </View>

                    ))}
                </ScrollView>
            }
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#000',
        // alignItems: 'center',
        // justifyContent: 'center',
        width: "100%",

    },

    gallery: {
        // flex: 1,
        // width: "100%"
    },

    scrollCon: {
        justifyContent: "center",
        alignItems: "center"
    },

    topContainer: {
        marginTop: 100,
        width: "100%",
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10
    },

    heading: {
        fontSize: 25,
        color: "#fff"
    },

    delete: {
        padding: 5,
        marginLeft: "auto"
    },

    city:{
        marginTop: "auto",
        color: "#fff",
        fontSize: 25
        
    }
})