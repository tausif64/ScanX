import React from 'react';
import { TouchableOpacity, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import MaterialCommunityIcon from 'react-native-vector-icons/MaterialCommunityIcons';


// Define components outside the TabLayout
const HomeIcon = ({ color }: { color: string }) => (
    <View style={styles.iconContainer}>
        <Icon name="home" size={24} color={color} />
    </View>
);

const ScanIcon = ({ color, scanDocument }: { color: string, scanDocument: () => void }) => (
    <TouchableOpacity onPress={() => scanDocument()} style={styles.iconContainer}>
        <MaterialIcon name="document-scanner" size={24} color={color} />
    </TouchableOpacity>
);


const FilesIcon = ({ color }: { color: string }) => (
    <View style={styles.iconContainer}>
        <Icon name="folder" size={24} color={color} />
    </View>
);

const ViewAllIcon = ({ color }: { color: string }) => (
    <View style={styles.iconContainer}>
        <MaterialCommunityIcon name="file-document-multiple-outline" size={24} color={color} />
    </View>
);

const styles = StyleSheet.create({
    iconContainer: {
        alignItems: 'center',
        justifyContent: 'center',
    },
});

export { HomeIcon, ScanIcon, FilesIcon, ViewAllIcon };
