import { ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import React, { useEffect, useState } from 'react';
import { ThemedView } from '../components/ThemedView';
import { ThemedText } from '../components/ThemedText';
import Card from '../components/Card';
import { db } from '../db/db';
import { Document, ImageProps } from '../interface';

const FolderDetails = ({ navigation, route }: any) => {
    // console.log(route.params.id)
    const [folderDocumnet, setFolderDocument] = useState<Document[]>([]);
    const fetchDocumentsByFolderId = async (id: number) => {
        const query = 'SELECT d.*, f.name AS folder_name FROM documents d LEFT JOIN folders f ON d.folder_id = f.id WHERE d.folder_id = ? ORDER BY d.created_at DESC';

        await db.transaction(tx => {
            tx.executeSql(query, [id], (_, results) => {
                const rows = results.rows;
                for (let i = 0; i < rows.length; i++) {
                    const row = rows.item(i);
                    // console.log(row);
                    tx.executeSql('SELECT * FROM images WHERE document_id = ? ORDER BY img_order', [row.id], (_tx, result) => {
                        const imageRows = result.rows;
                        let imgs: ImageProps[] = [];
                        for (let j = 0; j < imageRows.length; j++) {
                            const imageRow = imageRows.item(j);
                            imgs.push(imageRow);
                        }
                        setFolderDocument((prev) => [...prev, { ...row, images: imgs }]);
                    });
                }
            });
        });
    };
    useEffect(() => {
            fetchDocumentsByFolderId(route.params.id);
    }, [route.params.id]);
    return (
        <ThemedView style={styles.container}>
            <ScrollView style={styles.container2}>
                <ThemedText style={styles.header}>{route.params.name}</ThemedText>
                {folderDocumnet.map((item: any) => <TouchableOpacity onPress={() => navigation.navigate('Details',
                    { id: item?.id },
                )}
                    key={item?.id}>
                    <Card document={item} />
                </TouchableOpacity>
                )}
            </ScrollView>
        </ThemedView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    container2: {
        paddingHorizontal: 10,
        paddingVertical: 5,
    },
    header: {
        fontSize: 20,
        fontWeight: 'bold',
        marginVertical: 10,
    },
});

export default FolderDetails;
