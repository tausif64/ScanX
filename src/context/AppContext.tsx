import React from 'react';
import { createContext, useState, useEffect } from 'react';
import { db, getDocuments, getDocumentsByFolderID, getFolders, getImagesByDocumentId } from '../db/db'; // Import your SQLite database functions
import { Document, Folder } from '../interface';

interface SQLiteContextProps {
    folders: any[];
    documents: any[];
    images: any[];
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
    // updateViewedAt: (documentId: number) => Promise<any>;
}

const SQLiteContext = createContext<SQLiteContextProps | null>(null);

const SQLiteProvider = ({ children }: { children: React.ReactNode }) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [images, setImages] = useState<any[]>([]);
    useEffect(() => {
        const fetchFolders = async () => {
            const folder:Folder[] = [];
              await db.transaction(tx => {
                tx.executeSql('SELECT * FROM folders', [], (_, results) => {
                  const rows = results.rows;
                  for (let i = 0; i < rows.length; i++) {
                    const row = rows.item(i);
                    folder.push(row);
                  }
                });
              });
            setFolders(folder);
        };

        const fetchDocuments = async () => {
            const document:Document[] = [];
            await db.transaction(tx => {
                tx.executeSql('SELECT * FROM documents', [], (_, results) => {
                    const rows = results.rows;
                    for (let i = 0; i < rows.length; i++) {
                        const row = rows.item(i);
                        document.push(row);
                    }
                });
            });
            setDocuments(document);
        };
        fetchDocuments();
        fetchFolders();
    }, []);

    const fetchDocumentsByFolderId = async (id: number) => {
        const document = await getDocumentsByFolderID(id);
        setDocuments(document);
    };

    const fetchImages = async (id: number) => {
        const image = await getImagesByDocumentId(id);
        setImages(image);
    };


    const value: SQLiteContextProps = {
        folders:folders,
        documents:documents,
        images:images,
        fetchDocumentsByFolderId: fetchDocumentsByFolderId,
        getImagesByDocumentId: fetchImages,
    };

    return (
        <SQLiteContext.Provider value={value}>
            {children}
        </SQLiteContext.Provider>
    );
};

export { SQLiteProvider, SQLiteContext };
