/* eslint-disable @typescript-eslint/no-shadow */
import React, { createContext, useState, useEffect } from 'react';
import { db, insertDocument, insertFolder, insertImage, reOrderDocumnetImages, updateDocument } from '../db/db'; // Import your SQLite database functions
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
    scanDocument: (id: number | null) => void;
    fetchDocuments: () => void;
    setSortOption: (sortOption: string) => void;
    reOrderDocImages: (order: number, document_id: number, id: number) => void;
    generatePDF: (images: any, name: string) => Promise<any>;
    shareDocument: (pdfUri: string) => Promise<any>;
    saveDocument: (pdfUri: string, name:string) => Promise<any>;
}

const SQLiteContext = createContext<SQLiteContextProps | null>(null);

const SQLiteProvider = ({ children }: { children: React.ReactNode }) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [folderDocumnet, setFolderDocument] = useState<Document[]>();
    const [img, setImg] = useState<any[]>([]);
    const [sortOption, setSortOption] = useState<string>('date_newest');

    const createFolder = async (folder: Folder) => {
        await insertFolder(folder);
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
        if(!exists){
            await RNFS.mkdir(folderPath);
        }

        // Define the path for the PDF file
        const pdfPath = `${folderPath}/${name}.pdf`;

        await RNFS.writeFile(pdfPath, base64PDF, 'base64');
        // console.log(`PDF saved at: ${pdfPath}`);
        return 'file://' + pdfPath;
    };

    const saveDocument = async (pdfUri: string,name:string) => {
        const path = `${RNFS.DownloadDirectoryPath}/${name}.pdf`;
        await RNFS.writeFile(path, pdfUri, 'base64');
        if (Platform.OS === 'android') {
            ToastAndroid.show('PDF saved successfully!', ToastAndroid.LONG);
        }
        await RNFS.unlink(pdfUri);
    };

    const fetchDocumentsByFolderId = async (id: number) => {
        const query = 'SELECT * FROM documents WHERE folder_id = ?';

        let doc: any = [];

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
        setFolderDocument(doc);
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
        let orderByClause = 'ORDER BY viewed_at DESC';
        switch (sortOption) {
            case 'name_asc':
                orderByClause = 'ORDER BY d.name ASC';
                break;
            case 'name_desc':
                orderByClause = 'ORDER BY d.name DESC';
                break;
            case 'date_newest':
                orderByClause = 'ORDER BY created_at DESC';
                break;
            case 'date_oldest':
                orderByClause = 'ORDER BY created_at ASC';
                break;
            default:
                break;
        }

        await db.transaction(tx => {
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
                        img_order: order,
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
        updateDocument(data);
    };

    const reOrderDocImages = async (order: number, document_id: number, id: number) => {
        await reOrderDocumnetImages(order, document_id, id);
    };

    useEffect(() => {
        fetchDocuments();
        fetchFolders();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [img, sortOption]);


    const value: SQLiteContextProps = {
        folders,
        documents,
        folderDocumnet,
        fetchDocumentsByFolderId,
        scanDocument,
        fetchDocuments,
        updateDocumentData,
        reOrderDocImages,
        createFolder,
        fetchFolders,
        setSortOption,
        generatePDF,
        shareDocument,
        saveDocument,
    };

    return (
        <SQLiteContext.Provider value={value}>
            {children}
        </SQLiteContext.Provider>
    );
};

export { SQLiteProvider, SQLiteContext };
