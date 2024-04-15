import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { collection, addDoc, getDocs, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { firestore } from '../firebase/Config';

const JokesAndFacts = () => {
  const [joke, setJoke] = useState('');
  const [funFact, setFunFact] = useState('');
  const [favorites, setFavorites] = useState([]);
  const [showFavorites, setShowFavorites] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      const jokesSnapshot = await getDocs(collection(firestore, 'jokes'));
      const jokesData = jokesSnapshot.docs.map(doc => doc.data());
      const randomJokeIndex = Math.floor(Math.random() * jokesData.length);
      setJoke(jokesData[randomJokeIndex]);
      console.log("Fetched jokes", jokesData); // Debugging line
      const factsSnapshot = await getDocs(collection(firestore, 'facts'));
      const factsData = factsSnapshot.docs.map(doc => doc.data());
      const randomFactIndex = Math.floor(Math.random() * factsData.length);
      setFunFact(factsData[randomFactIndex]);
      console.log("Fetched facts", factsData); // Debugging line
    };

    fetchData();

    // Fetch new jokes and facts every 24 hours
    const intervalId = setInterval(fetchData, 24 * 60 * 60 * 1000);

    return () => clearInterval(intervalId); // Cleanup interval on unmount
  }, []);

  useEffect(() => {
    const fetchFavorites = async () => {
      const favoritesSnapshot = await getDocs(collection(firestore, 'favorites'));
      const favoritesData = favoritesSnapshot.docs.map(doc => doc.data().favorites);
      setFavorites(favoritesData[0] || []);
    };

    fetchFavorites();
  }, []);

  const toggleFavorite = async (content) => {
    if (favorites.includes(content)) {
      const updatedFavorites = favorites.filter((item) => item !== content);
      setFavorites(updatedFavorites);
      await deleteFavoriteFromFirestore(content);
    } else {
      const updatedFavorites = [...favorites, content];
      setFavorites(updatedFavorites);
      await addFavoriteToFirestore(content);
    }
  };

  const addFavoriteToFirestore = async (content) => {
    try {
      const favoritesCollection = collection(firestore, 'favorites');
      await setDoc(doc(favoritesCollection, 'userFavorites'), { favorites: [...favorites, content] });
      console.log('Favorite added to Firestore');
    } catch (error) {
      console.error('Error adding favorite to Firestore: ', error);
    }
  };

  const deleteFavoriteFromFirestore = async (content) => {
    try {
      const favoritesCollection = collection(firestore, 'favorites');
      await deleteDoc(doc(favoritesCollection, 'userFavorites'));
      console.log('Favorite deleted from Firestore');
    } catch (error) {
      console.error('Error deleting favorite from Firestore: ', error);
    }
  };

  return (
    <View style={styles.container}>
      {/* Päivän vitsi */}
      <View style={styles.card}>
        <Text style={styles.title}>Päivän Vitsi:</Text>
        <Text style={styles.content}>{joke.joke}</Text>
        <MaterialIcons
          name={favorites.includes(joke.joke) ? "star" : "star-border"}
          size={24}
          color={favorites.includes(joke.joke) ? "gold" : "gold"}
          onPress={() => toggleFavorite(joke.joke)}
        />
      </View>

      {/* Päivän fakta */}
      <View style={styles.card}>
        <Text style={styles.title}>Päivän Fakta:</Text>
        <Text style={styles.content}>{funFact.fact}</Text>
        <MaterialIcons
          name={favorites.includes(funFact.fact) ? "star" : "star-border"}
          size={24}
          color={favorites.includes(funFact.fact) ? "gold" : "gold"}
          onPress={() => toggleFavorite(funFact.fact)}
        />
      </View>

      {/* Suosikit */}
      <TouchableOpacity onPress={() => setShowFavorites(!showFavorites)} style={styles.favoriteList}>
        <Text style={styles.favoriteTitle}>Suosikit:</Text>
        <MaterialIcons name={showFavorites ? "keyboard-arrow-up" : "keyboard-arrow-down"} size={24} color="black" />
      </TouchableOpacity>

      {showFavorites && (
        <ScrollView style={styles.favoriteList}>
          {favorites.map((item, index) => (
            <View key={index} style={styles.favoriteItemContainer}>
              <Text style={styles.favoriteItem}>{item}</Text>
              <MaterialIcons name="clear" size={24} color="red" onPress={() => toggleFavorite(item)} />
            </View>
          ))}
        </ScrollView>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  card: {
    backgroundColor: '#ABD7AA',
    width: '100%',
    padding: 20,
    marginBottom: 20,
    borderRadius: 20,
    elevation: 5,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  content: {
    fontSize: 16,
  },
  favoriteList: {
    marginTop: 10,
    width: '100%',
    maxHeight: 200,
  },
  favoriteTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  favoriteItemContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  favoriteItem: {
    flex: 1,
    fontSize: 16,
    marginRight: 10,
  },
});

export default JokesAndFacts;
