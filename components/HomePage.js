import { Dimensions, Image, SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import React, { useEffect, useState } from 'react';
import { Camera } from 'expo-camera';
import * as SQLite from 'expo-sqlite';
import * as Location from 'expo-location';
import { useNavigation } from '@react-navigation/native';
import * as MediaLibrary from 'expo-media-library'; // Import MediaLibrary
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

// Connect to an SQLite database
const db = SQLite.openDatabase('gallery.db');

export default function Home() {
    const [hasPermission, setHasPermission] = useState(null);
    const [type, setType] = useState(Camera.Constants.Type.back);
    const [camera, setCamera] = useState(null);
    const [image, setImage] = useState(null);
    const [pictures, setPictures] = useState([]);

    useEffect(() => {
        // Request camera permissions
        (async () => {
            const { status } = await Camera.requestCameraPermissionsAsync();
            if (status === 'granted') {
                setHasPermission(true);
            } else {
                console.log('Camera permission denied');
            }
        })();

        // Request location permissions
        (async () => {
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Location permission denied');
            }
        })();
    }, []);

    useEffect(() => {
        // Drop the photos table when the component mounts
        db.transaction(
            (tx) => {
                tx.executeSql(
                    'DROP TABLE IF EXISTS photos',
                    [],
                    (_, results) => {
                        console.log('Table deleted successfully');
                    },
                    (_, err) => {
                        console.error('Error deleting table:', err);
                    }
                );
            },
            (err) => {
                console.error('Error in transaction:', err);
            }
        );
    }, []);

    const takePicture = async () => {
        if (camera) {
            const photo = await camera.takePictureAsync();
            const { status } = await Location.requestForegroundPermissionsAsync();
            if (status === 'granted') {
                const location = await Location.getCurrentPositionAsync({});
                const { latitude, longitude } = location.coords;
                const geocode = await Location.reverseGeocodeAsync({ latitude, longitude });
                const city = geocode[0]?.city || 'Unknown';

                db.transaction(
                    (tx) => {
                        tx.executeSql(
                            'CREATE TABLE IF NOT EXISTS photos(id INTEGER PRIMARY KEY AUTOINCREMENT, uri TEXT, city TEXT, latitude REAL, longitude REAL)'
                        );
                    },
                    (err) => {
                        console.error('Error in creating table:', err);
                    },
                    () => {
                        db.transaction(
                            (tx) => {
                                tx.executeSql(
                                    'INSERT INTO photos (uri, city, latitude, longitude) VALUES (?, ?, ?, ?)',
                                    [photo.uri, city, latitude, longitude]
                                );
                            },
                            (err) => {
                                console.error('Error in inserting data:', err);
                            },
                            (_, res) => {
                                console.log('Data inserted successfully');
                                setImage(photo.uri);

                                // Add code to save the captured image to the gallery here
                                saveToGallery(photo.uri);
                            }
                        );
                    }
                );
            } else {
                console.log('Location permission denied');
            }
        }
    };

    // Function to save the image to the gallery
    const saveToGallery = async (imageUri) => {
        const asset = await MediaLibrary.createAssetAsync(imageUri);
        console.log('Image saved to gallery:', asset);
    };

    const navigation = useNavigation();

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.topContainer}>
                <TouchableOpacity>
                    <MaterialCommunityIcons name='flash-off' size={30} color={"#fff"} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <MaterialCommunityIcons name='hdr-off' size={30} color={"#fff"} />
                </TouchableOpacity>
                <TouchableOpacity>
                    <MaterialCommunityIcons name='format-align-justify' size={30} color={"white"} />
                </TouchableOpacity>
            </View>
            <View style={styles.cameraContainer}>
            <Camera
                style={styles.preview}
                ref={(ref) => setCamera(ref)}
                type={Camera.Constants.Type.back}
            >
            </View>
            {image && <Image source={{ uri: image }} style={{ width: 300, height: 300 }} />}
            {pictures.length > 0 && (
                <View style={{ zIndex: 1000, backgroundColor: 'red', width: Dimensions.get('window').width, height: 500 }}>
                    {pictures.map((pic) => (
                        <View key={pic.uri}>
                            <Text>{pic.city}</Text>
                            <Image source={{ uri: pic.uri }} style={{ width: 300, height: 300 }} />
                        </View>
                    ))}
                </View>
            )}
            <View style={styles.bottomContainer}>
                <TouchableOpacity onPress={() => navigation.navigate('Gallery')}>
                    <MaterialCommunityIcons name='image' size={35} color={"#fff"} />
                </TouchableOpacity>
                <TouchableOpacity onPress={() => takePicture()}>
                    <MaterialCommunityIcons name='camera' size={35} color={"#fff"} />
                </TouchableOpacity>
                <TouchableOpacity
                    onPress={() => {
                        setType(
                            type === Camera.Constants.Type.back
                                ? Camera.Constants.Type.front
                                : Camera.Constants.Type.back
                        );
                    }}
                >
                    <MaterialCommunityIcons name='camera-retake-outline' size={35} color={"white"} />
                </TouchableOpacity>
            </View>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#000",
        width: "100%",
        alignItems: 'center',
        justifyContent: 'center',
    },
    cameraContainer: {
        flex: 1,
        alignItems: "center",
        flexDirection: 'row',
    },
    fixedRatio: {
        flex: 1,
        aspectRatio: 1,
    },
    bottomContainer: {
        marginTop: "auto",
        width: "100%",
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
    topContainer: {
        marginTop: 100,
        width: "100%",
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
    },
});
