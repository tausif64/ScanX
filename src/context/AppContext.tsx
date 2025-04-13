/* eslint-disable @typescript-eslint/no-shadow */
import React, { createContext, useState, useEffect } from 'react';
import { db, deleteDocument, deleteFolder, deleteImage, insertDocument, insertFolder, insertImage, reOrderDocumnetImages, updateDocument, updateImage } from '../db/db';
import { Document, Folder, ImageProps } from '../interface';
import DocumentScanner from 'react-native-document-scanner-plugin';
import compressor from 'react-native-compressor';
import { getFileSize } from '../utils/utils';
import { Alert, PermissionsAndroid, Platform, ToastAndroid } from 'react-native';
import RNFS from 'react-native-fs';
import { PDFDocument, rgb } from 'pdf-lib';
import Share from 'react-native-share';


interface SQLiteContextProps {
    folders: Folder[];
    documents: Document[];
    recentDocuments: Document[];
    folderDocumnet: Document[] | any;
    fetchDocumentsByFolderId: (id: number) => Promise<any>;
    createFolder: (folder: any) => Promise<any>;
    fetchFolders: () => Promise<any>;
    updateDocumentData: (document: {
        id: number;
        name?: string;
        folder_id?: number;
        viewed_at?: string | Date;
    }) => void;
    scanDocument: (id: number | null, folderId: number | null) => any;
    retakeImage: (id: number, document_id: number, old_path: string) => Promise<any>;
    addDocument: (id: number | null, folderId: number | null, imglen: number) => void;
    fetchDocuments: () => void;
    fetchRecentDocuments: () => void;
    reOrderDocImages: (order: number, document_id: number, id: number) => void;
    generatePDF: (images: any, name: string) => Promise<any>;
    shareDocument: (pdfUri: string) => Promise<any>;
    saveDocument: (pdfUri: string, name: string) => Promise<any>;
    updateDocName: (id: number, name: string) => void;
    deleteDocImage: (id: number, path:string) => void;
    deleteDocumentById: (id: number) => void;
    deleteFolderById: (id: number) => void;
}

const SQLiteContext = createContext<SQLiteContextProps | null>(null);

const SQLiteProvider = ({ children }: { children: React.ReactNode }) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [recentDocuments, setRecentDocuments] = useState<Document[]>([]);
    const [folderDocumnet, setFolderDocument] = useState<Document[]>([]);
    const [img, setImg] = useState<any[]>([]);

    const createFolder = async (folder: Folder) => {
        await insertFolder(folder);
        await fetchFolders();
    };
    const shareDocument = async (pdfUri: string) => {

        const shareOptions = {
            title: 'Share PDF',
            url: pdfUri,
            type: 'application/pdf',
        };

        // Share the PDF file
        await Share.open(shareOptions);

    };

    const uint8ArrayToBase64 = (uint8Array: Uint8Array): string => {
        let binaryString = '';
        const len = uint8Array.byteLength;
        for (let i = 0; i < len; i++) {
            binaryString += String.fromCharCode(uint8Array[i]);
        }
        return btoa(binaryString); // Convert binary string to base64
    };

    const generatePDF = async (images: any, name: string) => {

        const pdfDoc = await PDFDocument.create();

        const A4_WIDTH = 595;
        const A4_HEIGHT = 842;

        for (const image of images) {
            const imgBytes = await fetch('file:///' + image.path).then(res => res.arrayBuffer());
            const img = await pdfDoc.embedJpg(imgBytes);

            const page = pdfDoc.addPage([A4_WIDTH, A4_HEIGHT]);

            page.drawRectangle({
                x: 0,
                y: 0,
                width: A4_WIDTH,
                height: A4_HEIGHT,
                color: rgb(1, 1, 1), // White background
            });

            // Calculate the image dimensions to fit the page
            const imgWidth = img.width;
            const imgHeight = img.height;

            // Maintain aspect ratio and center the image
            const scale = Math.min(A4_WIDTH / imgWidth, A4_HEIGHT / imgHeight);
            const scaledWidth = imgWidth * scale;
            const scaledHeight = imgHeight * scale;

            const xOffset = (A4_WIDTH - scaledWidth) / 2;
            const yOffset = (A4_HEIGHT - scaledHeight) / 2;

            // Draw the image on the page
            page.drawImage(img, {
                x: xOffset,
                y: yOffset,
                width: scaledWidth,
                height: scaledHeight,
            });
        }

        const pdfBytes: Uint8Array = await pdfDoc.save();
        const base64PDF = uint8ArrayToBase64(pdfBytes);

        const folderPath = RNFS.DocumentDirectoryPath + '/ScanX';

        const exists = await RNFS.exists(folderPath);
        if (!exists) {
            await RNFS.mkdir(folderPath);
        }

        const pdfPath = `${folderPath}/${name}.pdf`;

        await RNFS.writeFile(pdfPath, base64PDF, 'base64');
        return 'file://' + pdfPath;
    };

    const saveDocument = async (pdfUri: string, name: string) => {

        const path = `${RNFS.DownloadDirectoryPath}/${name}`;
        try {

            const fileExists = await RNFS.exists(path);

            if (fileExists) {
                const timestamp = new Date().getTime().toString().slice(-4);
                const newName = `${name.split('.').slice(0, -1).join('.')}_${timestamp}.${name.split('.').pop()}`;
                const newPath = `${RNFS.DownloadDirectoryPath}/${newName}`;

                await RNFS.moveFile(pdfUri, newPath);
                if (Platform.OS === 'android') {
                    ToastAndroid.show(`${newName} saved successfully!`, ToastAndroid.LONG);
                }
            } else {
                await RNFS.moveFile(pdfUri, path);
                if (Platform.OS === 'android') {
                    ToastAndroid.show('PDF saved successfully!', ToastAndroid.LONG);
                }
            }
        } catch (error) {
            // console.error('Error saving document:', error);
            if (Platform.OS === 'android') {
                ToastAndroid.show('Failed to save PDF!', ToastAndroid.LONG);
            }
        }

    };

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

    const fetchRecentDocuments = async () => {

        db.transaction(tx => {
            tx.executeSql('SELECT d.*, f.name AS folder_name FROM documents d LEFT JOIN folders f ON d.folder_id = f.id ORDER BY d.viewed_at DESC LIMIT 30', [], (_, results) => {
                let items: Document[] = [];
                const rows = results.rows;
                for (let i = 0; i < rows.length; i++) {
                    const row = rows.item(i);
                    tx.executeSql('SELECT * FROM images WHERE document_id = ? ORDER BY img_order ASC', [row.id], (_, results) => {
                        let imgs: ImageProps[] = [];
                        const imageRows = results.rows;
                        for (let j = 0; j < imageRows.length; j++) {
                            const imageRow = imageRows.item(j);
                            imgs.push(imageRow);
                        }

                        items.push({ ...row, images: imgs });
                    });
                }
                setRecentDocuments(items);
            });
        });
    };

    const fetchDocuments = async () => {
        let orderByClause = 'ORDER BY viewed_at DESC, created_at DESC';

        db.transaction(tx => {
            tx.executeSql(`SELECT d.*, f.name AS folder_name FROM documents d LEFT JOIN folders f ON d.folder_id = f.id ${orderByClause}`, [], (_, results) => {
                let items: Document[] = [];
                const rows = results.rows;
                for (let i = 0; i < rows.length; i++) {
                    const row = rows.item(i);
                    tx.executeSql('SELECT * FROM images WHERE document_id = ? ORDER BY img_order ASC', [row.id], (_, results) => {
                        let imgs: ImageProps[] = [];
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
        // console.log(documents);
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

    const scanDocument = async (id: number | null, folderId: number | null) => {
        if (Platform.OS === 'android' && await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA
        ) !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Error', 'User must grant camera permissions to use document scanner.');
            return;
        }

        // start the document scanner
        const { scannedImages } = await DocumentScanner.scanDocument();

        // Create a new document
        const document = {
            name: `ScanX_${new Date().getTime()}`,
            folder_id: folderId ? folderId : 1,
            viewed_at: new Date().toISOString(),
        };

        // get back an array with scanned image file paths
        if (scannedImages && scannedImages.length > 0) {
            const documentId: any = id === null ? await insertDocument(document) : id;
            let order = 1;
            scannedImages.map(async (path) => {
                try {
                    const compressedImage = await compressImage(path);
                    const destPath = `${RNFS.DocumentDirectoryPath}/ScanX_${new Date().getTime()}.jpg`;
                    await RNFS.moveFile(compressedImage, destPath);
                    const image: any = {
                        path: destPath,
                        document_id: documentId,
                        img_order: order,
                    };
                    await insertImage(image);
                    await RNFS.unlink(path);
                    order++;
                } catch (error) {
                    // console.error('Error processing image:', error);
                    if (Platform.OS === 'android') {
                        ToastAndroid.show('Error processing image', ToastAndroid.LONG);
                    }
                }
            });
            setTimeout(() => {
                setImg(scannedImages);
            }, 500);
        }
    };

    const retakeImage = async (id: number, document_id: number, old_path: string) => {
        if (Platform.OS === 'android' && await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA
        ) !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Error', 'User must grant camera permissions to use document scanner.');
            return;
        }

        // start the document scanner
        const { scannedImages } = await DocumentScanner.scanDocument({maxNumDocuments: 1});


        // get back an array with scanned image file paths
        if (scannedImages && scannedImages.length > 0) {
            console.log(scannedImages);
            scannedImages.map(async (path) => {
                    const compressedImage = await compressImage(path);
                    const destPath = `${RNFS.DocumentDirectoryPath}/ScanX_${new Date().getTime()}.jpg`;
                    await RNFS.moveFile(compressedImage, destPath);
                    const image: any = {
                        path: destPath,
                        document_id: document_id,
                    };
                    await updateImage(id, image);
                    await RNFS.unlink(path);
                    await RNFS.unlink(old_path);
            });
            setImg(scannedImages);
            return scannedImages[0];
        }
    };

    const addDocument = async (id: number | null, folderId: number | null, imglen: number) => {
        if (Platform.OS === 'android' && await PermissionsAndroid.request(
            PermissionsAndroid.PERMISSIONS.CAMERA
        ) !== PermissionsAndroid.RESULTS.GRANTED) {
            Alert.alert('Error', 'User must grant camera permissions to use document scanner.');
            return;
        }

        // start the document scanner
        const { scannedImages } = await DocumentScanner.scanDocument();

        // Create a new document
        const document = {
            name: `ScanX_${new Date().getTime()}`,
            folder_id: folderId ? folderId : 1,
        };

        // get back an array with scanned image file paths
        if (scannedImages && scannedImages.length > 0) {
            const documentId: any = id === null ? await insertDocument(document) : id;
            imglen++;
            for (const path of scannedImages) {

                    const compressedImage = await compressImage(path);
                    const destPath = `${RNFS.DocumentDirectoryPath}/ScanX_${new Date().getTime()}.jpg`;
                    await RNFS.moveFile(compressedImage, destPath);
                    const image: any = {
                        path: destPath,
                        document_id: documentId,
                        img_order: imglen,
                    };
                    await insertImage(image);
                    await RNFS.unlink(path);
                    imglen++;
            }
            setImg(scannedImages);
            return scannedImages;
        }
    };

    const updateDocName = (id: number, name: string) => {
        let isDocument = documents.some((item) => item.id === id);
        if (isDocument) {
            const updatedDocuments = documents.map((item) =>
                item.id === id ? { ...item, name } : item
            );
            setDocuments(updatedDocuments);
        }
        let isRecentDocument = recentDocuments.some((item) => item.id === id);
        if (isRecentDocument) {
            const updatedRecentDocuments = recentDocuments.map((item) =>
                item.id === id ? { ...item, name } : item
            );
            setRecentDocuments(updatedRecentDocuments);
        }
    };

    const updateDocumentData = (data: {
        id: number;
        name?: string;
        folder_id?: number | string;
        viewed_at?: string | Date;
    }) => {
        updateDocument(data);
    };

    const reOrderDocImages = async (order: number, document_id: number, id: number) => {
        await reOrderDocumnetImages(order, document_id, id);
    };

    const deleteDocImage = async (id: number, path:string) => {
        await deleteImage(id);
        await RNFS.unlink(path);
    };

    // Get images by document id
    const deleteImagesByDocumentId = async (document_id: number) => {
        const query = `
                SELECT *
                FROM images
                WHERE document_id = ?
            `;


        await db.transaction(tx => {
            tx.executeSql(query, [document_id], (_tx, results) => {
                const imgs: ImageProps[] = [];
                for (let i = 0; i < results.rows.length; i++) {
                    const row = results.rows.item(i);
                    imgs.push(row);
                }
                imgs.map(async (item) => await RNFS.unlink('file:///' + item?.path));
            });
        });
    };

    const deleteDocumentById = async (id: number) => {
        const newDocument = documents.filter((item) => item.id !== id);
        const newRecentDocument = recentDocuments.filter((item) => item.id !== id);
        await deleteImagesByDocumentId(id);
        deleteDocument(id);
        setDocuments(newDocument);
        setRecentDocuments(newRecentDocument);
    };

    const deleteFolderById = async (id: number) => {
        await fetchDocumentsByFolderId(id);
        folderDocumnet.map(async (document) => (await deleteDocumentById(document.id)));
        const newFoleder = folders.filter((item) => item.id !== id);
        await deleteFolder(id);
        setFolders(newFoleder);
    };


    useEffect(() => {
        fetchRecentDocuments();
        fetchDocuments();
        fetchFolders();
    }, [img]);

    const value: SQLiteContextProps = {
        folders,
        documents,
        recentDocuments,
        folderDocumnet,
        fetchDocumentsByFolderId,
        scanDocument,
        retakeImage,
        fetchDocuments,
        fetchRecentDocuments,
        updateDocumentData,
        reOrderDocImages,
        createFolder,
        fetchFolders,
        generatePDF,
        shareDocument,
        saveDocument,
        updateDocName,
        deleteDocImage,
        deleteDocumentById,
        deleteFolderById,
        addDocument,
    };

    return (
        <SQLiteContext.Provider value={value}>
            {children}
        </SQLiteContext.Provider>
    );
};

export { SQLiteProvider, SQLiteContext };
