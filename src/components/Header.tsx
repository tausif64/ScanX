/* eslint-disable react-native/no-inline-styles */
import React, { useContext, useState } from 'react';
import { StyleSheet, TouchableOpacity, TouchableWithoutFeedback, View, Dimensions, useColorScheme, Text } from 'react-native';
// import Icon from 'react-native-vector-icons/MaterialIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { ThemedView } from './ThemedView';
import { ThemedText } from './ThemedText';
import { SQLiteContext } from '../context/AppContext';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { RootStackParamList } from '../navigation/navigation';


const HEIGHT = Dimensions.get('screen').height;
const WIDTH = Dimensions.get('screen').width;

const Header = () => {
    const [menuVisible, setMenuVisible] = useState<boolean>(false);
    const theme = useColorScheme();
    const navigation = useNavigation<NavigationProp<RootStackParamList>>();


    const context = useContext(SQLiteContext);

      const handelPress = (option:string) => {
          context!.setSortOption(option);
          setMenuVisible(false);
      };

    return (
        <>
            <ThemedView style={styles.container}>
                <Text style={styles.icon}>ScanX</Text>


                <TouchableOpacity onPress={() => navigation.navigate('Search')} style={styles.iconContainer}>
                    <Ionicons name="search" size={24} color="#000" />
                </TouchableOpacity>
                {/* <TouchableOpacity style={styles.iconContainer}>
                    <Icon name="more-vert" size={24} color="#000" />
                </TouchableOpacity> */}
            </ThemedView>
            {menuVisible && (
                <>
                    <TouchableWithoutFeedback onPress={() => setMenuVisible(false)}>
                            <View style={styles.modalOverlay} />
                        </TouchableWithoutFeedback>
                    <ThemedView style={styles.modalContainer}>
                        <ThemedText style={[styles.modalMenu, {borderColor: theme === 'dark' ? '#fff' : '#000'}]}>Sort</ThemedText>
                        <TouchableOpacity style={styles.pt} onPress={() => handelPress('name_asc')}>
                            <ThemedText>Name (A-Z)</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sortMenu} onPress={() => handelPress('name_desc')}>
                            <ThemedText>Name (Z-A)</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sortMenu} onPress={() => handelPress('date_newest')}>
                            <ThemedText>Date (Newest - Oldest)</ThemedText>
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.sortMenu} onPress={() => handelPress('date_oldest')}>
                            <ThemedText>Date (Oldest - Newest)</ThemedText>
                        </TouchableOpacity>
                    </ThemedView>
                </>
            )}
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        height: 60,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#ffffff',
        paddingHorizontal: 16,
    },
    iconContainer: {
        padding: 8,
    },
    icon: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    modalContainer: {
        position: 'absolute',
        top: 20,
        right: 20,
        width: 220,
        paddingVertical: 15,
        paddingHorizontal: 19,
        borderRadius: 8,
    },
    modalOverlay: {
        flex: 1,
        position: 'absolute',
        top:0,
        left:0,
        height: HEIGHT,
        width: WIDTH,
    },
    modalMenu: {
        borderBottomWidth: 1,
        paddingBottom: 5,
    },
    pt: {
        paddingTop: 12,
        paddingBlock: 5,
    },
    sortMenu: {
        paddingVertical: 5,
    },
});

export default Header;
