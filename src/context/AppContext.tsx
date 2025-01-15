import React from 'react';
import { createContext, useState, useEffect } from 'react';
import { getDocuments, getDocumentsByFolderID, getFolders, getImagesByDocumentId } from '../db/db'; // Import your SQLite database functions
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
            const folder = await getFolders();
            setFolders(folder);
        };

        const fetchDocuments = async () => {
            const document = await getDocuments();
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
