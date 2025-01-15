/* eslint-disable @typescript-eslint/no-shadow */
import React from 'react';
import { createContext, useState, useEffect } from 'react';
import { db, getImagesByDocumentId } from '../db/db'; // Import your SQLite database functions
import { Document, Folder, Image } from '../interface';

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
    // updateViewedAt: (documentId: number) => Promise<any>;
}

const SQLiteContext = createContext<SQLiteContextProps | null>(null);

const SQLiteProvider = ({ children }: { children: React.ReactNode }) => {
    const [folders, setFolders] = useState<Folder[]>([]);
    const [documents, setDocuments] = useState<Document[]>([]);
    const [document, setDocument] = useState<Document>();
    const [images, setImages] = useState<any[]>([]);
    useEffect(() => {
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
                tx.executeSql('SELECT * FROM documents', [], (_, results) => {
                    let document: Document[] = [];
                    const rows = results.rows;
                    for (let i = 0; i < rows.length; i++) {
                        const row = rows.item(i);
                        document.push(row);
                    }
                    setDocuments(document);
                });
            });
        };
        fetchDocuments();
        fetchFolders();
    }, []);

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
    };


    const value: SQLiteContextProps = {
        folders: folders,
        documents: documents,
        document: document,
        images: images,
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
