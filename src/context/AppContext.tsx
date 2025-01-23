/* eslint-disable @typescript-eslint/no-shadow */
import React from 'react';
import { createContext, useState, useEffect } from 'react';
import { db, insertDocument, insertImage, updateDocument } from '../db/db'; // Import your SQLite database functions
import { Document, Folder, Image } from '../interface';
import DocumentScanner from 'react-native-document-scanner-plugin';
import compressor from 'react-native-compressor';
import { getFileSize } from '../utils/utils';
import { Alert, PermissionsAndroid, Platform } from 'react-native';
import RNFS from 'react-native-fs';


interface SQLiteContextProps {
    folders: Folder[];
    documents: Document[];
    document: Document | any;
    fetchDocumentsByFolderId: (id: number) => Promise<any>;
    // insertFolder: (folder: any) => Promise<any>;
    // updateFolder: (folder: any) => Promise<any>;
    // deleteFolder: (folderId: number) => Promise<any>;
    // insertDocument: (document: any) => Promise<any>;
    updateDocumentData: (document: {
        id: number;
        name?: string;
        folder_id?: number;
        viewed_at?: string | Date;
    }) => Promise<any>;
    // deleteDocument: (documentId: number) => Promise<any>;
    // insertImage: (image: any) => Promise<any>;
    // updateImage: (image: any) => Promise<any>;
    // deleteImage: (imageId: number) => Promise<any>;
    scanDocument: (id: number | null) => void;
    fetchDocuments: () => void;
    // updateViewedAt: (documentId: number) => Promise<any>;
}

const SQLiteContext = createContext<SQLiteContextProps | null>(null);

const SQLiteProvider = ({ children }: { children: React.ReactNode }) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [document, setDocument] = useState<Document>();
    const [img, setImg] = useState<any[]>([]);

    const fetchDocumentsByFolderId = async (id: number) => {
        const query = 'SELECT * FROM documents WHERE folder_id = ?';

        let doc: Document = {
            id: 0,
            name: '',
            folder_id: 0,
            created_at: '',
            updated_at: '',
            viewed_at: '',
        };

        await db.transaction(tx => {
            tx.executeSql(query, [id], (_tx, results) => {
                for (let i = 0; i < results.rows.length; i++) {
                    const row = results.rows.item(i);
                    doc = {
                        id: row.id,
                        name: row.name,
                        folder_id: row.folder_id,
                        created_at: row.created_at,
                        updated_at: row.updated_at,
                        viewed_at: row.viewed_at,
                    };
                }
            });
        });
        setDocument(doc);
    };

    const fetchFolders = async () => {
        await db.transaction(tx => {
            tx.executeSql('SELECT * FROM folders', [], (_, results) => {
                let folder: Folder[] = [];
                const rows = results.rows;
                for (let i = 0; i < rows.length; i++) {
                    const row = rows.item(i);
                    // console.log(row);
                    folder.push(row);
                }
                setFolders(folder);
            });
        });
    };

    const fetchDocuments = async () => {
        await db.transaction(tx => {
            tx.executeSql('SELECT d.*, f.name AS folder_name FROM documents d LEFT JOIN folders f ON d.folder_id = f.id ORDER BY viewed_at DESC', [], (_, results) => {
                let items: Document[] = [];
                const rows = results.rows;
                for (let i = 0; i < rows.length; i++) {
                    const row = rows.item(i);
                    tx.executeSql('SELECT * FROM images WHERE document_id = ? ORDER BY img_order', [row.id], (_, results) => {
                        let imgs: Image[] = [];
                        const imageRows = results.rows;
                        for (let j = 0; j < imageRows.length; j++) {
                            const imageRow = imageRows.item(j);
                            imgs.push(imageRow);
                        }

                        items.push({ ...row, images: imgs });
                    });
                }
                setDocuments(items);
            });
        });
    };

    const compressImage = async (path: string) => {
        const maxFileSize = 700 * 1024; // 700KB
        const options = {
            quality: 0.7, // quality of the image (0-1)
        };

        try {
            const compressedImagePath = await compressor.Image.compress(path, options);
            const size = await getFileSize(compressedImagePath);
            if (size !== null && size > maxFileSize) {
                // if the compressed image is still larger than the maximum file size,
                // we can try to reduce the quality further
                options.quality = 0.5;
                const compressedImageAgain = await compressor.Image.compress(path, options);
                return compressedImageAgain;
            }
            return compressedImagePath;
        } catch (error) {
            console.error('Error compressing image:', error);
            return path;
        }
    };

    const scanDocument = async (id: number | null) => {
        // prompt user to accept camera permission request if they haven't already
        if (Platform.OS === 'android' && await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA
        ) !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Error', 'User  must grant camera permissions to use document scanner.');
            return;
        }

        // start the document scanner
        const { scannedImages } = await DocumentScanner.scanDocument();

        // Create a new document
        const document = {
            name: `ScanX_${new Date().getTime()}`,
            folder_id: 1,
        };

        // get back an array with scanned image file paths
        if (scannedImages && scannedImages.length > 0) {
            const documentId: any = id === null ? await insertDocument(document) : id;
            let order = 1;
            for (const path of scannedImages) {
                try {
                    const compressedImage = await compressImage(path);
                    const destPath = `${RNFS.DocumentDirectoryPath}/ScanX_${new Date().getTime()}.jpg`;
                    await RNFS.moveFile(compressedImage, destPath);
                    const image: any = {
                        path: destPath,
                        document_id: documentId,
                        order: order,
                    };
                    await insertImage(image);
                    await RNFS.unlink(path);
                    order++;
                } catch (error) {
                    console.error('Error processing image:', error);
                }
            }
            setImg(scannedImages); // Using this to renrender the page
        }
    };

    const updateDocumentData = (data: {
        id: number;
        name?: string;
        folder_id?: number;
        viewed_at?: string | Date;
    }) => {
        return updateDocument(data);
    };

    useEffect(() => {
        fetchDocuments();
        fetchFolders();
    }, [img]);


    const value: SQLiteContextProps = {
        folders: folders,
        documents: documents,
        document: document,
        fetchDocumentsByFolderId: fetchDocumentsByFolderId,
        scanDocument,
        fetchDocuments,
        updateDocumentData,
    };

    return (
        <SQLiteContext.Provider value={value}>
            {children}
        </SQLiteContext.Provider>
    );
};

export { SQLiteProvider, SQLiteContext };
