/* eslint-disable @typescript-eslint/no-shadow */
import React from 'react';
import { createContext, useState, useEffect } from 'react';
import { db, getImagesByDocumentId, insertDocument, insertImage } from '../db/db'; // Import your SQLite database functions
import { Document, Folder, Image } from '../interface';
import DocumentScanner from 'react-native-document-scanner-plugin';
import compressor from 'react-native-compressor';
import { getFileSize } from '../utils/utils';
import { Alert, PermissionsAndroid, Platform } from 'react-native';

interface SQLiteContextProps {
    folders: Folder[];
    documents: Document[];
    document: Document | any;
    images: Image[];
    fetchDocumentsByFolderId: (id: number) => Promise<any>;
    // insertFolder: (folder: any) => Promise<any>;
    // updateFolder: (folder: any) => Promise<any>;
    // deleteFolder: (folderId: number) => Promise<any>;
    // insertDocument: (document: any) => Promise<any>;
    // updateDocument: (document: any) => Promise<any>;
    // deleteDocument: (documentId: number) => Promise<any>;
    // insertImage: (image: any) => Promise<any>;
    // updateImage: (image: any) => Promise<any>;
    // deleteImage: (imageId: number) => Promise<any>;
    getImagesByDocumentId: (documentId: number) => Promise<any>;
    fetchImages: (documentId: number) => Promise<any>;
    scanDocument: () => void;
    fetchDocuments: () => void;
    // updateViewedAt: (documentId: number) => Promise<any>;
}

const SQLiteContext = createContext<SQLiteContextProps | null>(null);

const SQLiteProvider = ({ children }: { children: React.ReactNode }) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [document, setDocument] = useState<Document>();
    const [images, setImages] = useState<any[]>([]);
    const [img, setImg] = useState<any[]>([]);

    const fetchDocumentsByFolderId = async (id: number) => {
        const query = `
    SELECT *
    FROM documents WHERE folder_id = ? 
  `;

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

    const fetchImages = async (id: number) => {
        const image = await getImagesByDocumentId(id);
        setImages(image);
        return image;
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
            tx.executeSql('SELECT d.*, f.name AS folder_name FROM documents d LEFT JOIN folders f ON d.folder_id = f.id ORDER BY created_at DESC', [], (_, results) => {
                let items: Document[] = [];
                const rows = results.rows;
                for (let i = 0; i < rows.length; i++) {
                    const row = rows.item(i);
                    tx.executeSql('SELECT * FROM images WHERE document_id = ?', [row.id], (_, results) => {
                        let imgs: Image[] = [];
                        const imageRows = results.rows;
                        for (let j = 0; j < imageRows.length; j++) {
                            const imageRow = imageRows.item(j);
                            imgs.push({
                                id: imageRow.id,
                                document_id: imageRow.document_id,
                                path: imageRow.path,
                                timestamp: imageRow.timestamp,
                            });
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

    const scanDocument = async () => {
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
            // Insert the document into the database
            const documentId = await insertDocument(document);
            // console.log(documentId);
            scannedImages.forEach(async (path: string) => {
                const compressedImage = await compressImage(path);
                const image: any = {
                    path: compressedImage,
                    document_id: documentId,
                };
                await insertImage(image);
            });
            setTimeout(() => {
                setImg(scannedImages);
            }, 400);
        }
    };

    useEffect(() => {
        fetchDocuments();
        fetchFolders();
    }, [img]);


    const value: SQLiteContextProps = {
        folders: folders,
        documents: documents,
        document: document,
        images: images,
        fetchDocumentsByFolderId: fetchDocumentsByFolderId,
        getImagesByDocumentId: fetchImages,
        scanDocument,
        fetchImages,
        fetchDocuments,
    };

    return (
        <SQLiteContext.Provider value={value}>
            {children}
        </SQLiteContext.Provider>
    );
};

export { SQLiteProvider, SQLiteContext };
