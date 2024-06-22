import React, { useEffect, useState  } from 'react';
import { View, FlatList, StyleSheet, Dimensions, Alert, Image, TouchableOpacity, Text, Platform, 
PermissionsAndroid } from 'react-native';

import * as MediaLibrary from 'expo-media-library';
import { Asset } from 'expo-asset';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

const items = [
  { id: '1', check:'0',imageUri: require('../assets/Selfie1.jpeg'), thumbnailUri: require('../assets/vimage1.png'), videoUrl: require('../assets/Video1.mp4'), title: 'Item 1' },
  { id: '2', check:'0', imageUri: require('../assets/Selfie2.jpeg'), thumbnailUri: require('../assets/vimage2.png'), videoUrl: require('../assets/Video2.mp4'), title: 'Item 2' },
  { id: '3', check:'0', imageUri: require('../assets/Selfie3.jpeg'), thumbnailUri: require('../assets/vimage3.png'), videoUrl: require('../assets/Video3.mp4'), title: 'Item 3' },
];

const App = () => {
 

  const [permissionGranted, setPermissionGranted] = useState(false);


  useEffect(() => {
    if (Platform.OS !== 'web') {
      (async () => {
        const { status } = await MediaLibrary.requestPermissionsAsync();
        setPermissionGranted(status === 'granted');
      })();
    }
  }, []);

  const requestStoragePermission = async () => {
    if (Platform.OS === 'android') {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission Required',
            message: 'This app needs access to your storage to save videos',
          }
        );
        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          console.log('Storage Permission Granted.');
          return true;
        } else {
          Alert.alert('Storage Permission Denied.');
          return false;
        }
      } catch (err) {
        console.warn(err);
        return false;
      }
    }
    console.log(" granted");
    return true; // For iOS, no need for explicit permission request
  };


  const handleDownloadVideo = async (item) => {
    if (Platform.OS === 'web') {
      
        const response = await fetch(item.videoUrl);
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = `${item.videoUrl}`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);

    } else {
      if (!permissionGranted) {
        const granted = await requestStoragePermission();
        if (!granted) return;
      }
        const videoAsset = Asset.fromModule(item.videoUrl);
        await videoAsset.downloadAsync();
        const localUri = videoAsset.localUri || videoAsset.uri;
        console.log('Video downloaded to:', localUri);

        const asset = await MediaLibrary.createAssetAsync(localUri);
        await MediaLibrary.createAlbumAsync('Download', asset, false);
        Alert.alert('Success', 'Video saved to gallery.');
    }
    
  };

  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      {/* JPEG Image */}
      <View style= {styles.imagebox}>
      <Text>image{item.id}</Text>
      <Image source={item.imageUri} style={styles.imagebox} resizeMode="cover" />
      </View>
      {/* <Image source={item.imageUri} style={styles.image} resizeMode="cover" /> */}
      {/* PNG Thumbnail */}
      <View style= {styles.imagebox}>
      <Text>image{item.id}</Text>
      <Image source={item.thumbnailUri} style={styles.imagebox} resizeMode="cover" />
      </View>
      <TouchableOpacity style={styles.button} onPress={() => handleDownloadVideo(item)}>
      <Text style={styles.buttonText}>press</Text>
      </TouchableOpacity>
    </View>
  );

  return (
    <View style={styles.container}>
    <SafeAreaView>
    <Text style= {styles.head}>Flicks</Text>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        horizontal={false} // Change to true for horizontal scrolling
      />
    </SafeAreaView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5F0E6',
  },
  itemContainer: {
    border:1 ,
    
    flexDirection: 'row', // Arrange items horizontally
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
    marginBottom: 10,
  },
  props:{
    width:50,
    height:50,
  },
  image: {
    width: 100,
    height: 100,
    borderRadius: 10,
    marginRight: 10,
  },
  imagebox:{
    height:150,
    marginRight: 20,
    padding:20,
    width:100,
  },
  thumbnail: {
    width: 100,
    height: 100,
    borderRadius: 10,
  },
  head:{
    fontSize:40,
    alignItems:'center',
    padding:30,
    paddingLeft:125,
    justifyContent:'center',
  },
  button: {
    padding: 10,
    marginLeft:30,
    backgroundColor: 'grey',
    
    borderRadius: 5,
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});

export default App;
