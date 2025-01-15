import SQLite from 'react-native-sqlite-storage';
import { Document, Folder, Image } from '../interface';

const db = SQLite.openDatabase(
  {name: 'mydatabase.db', location: 'default'},
  () => {},
  error => {
    console.error('Error opening database:', error);
  },
);

// Create tables
db.transaction(tx => {
  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS folders (
      id INTEGER PRIMARY KEY,
      name TEXT NOT NULL UNIQUE,
      timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
  `);

    tx.executeSql(`
    CREATE TABLE IF NOT EXISTS documents (
      id INTEGER PRIMARY KEY,
      folder_id INTEGER NOT NULL,
      name TEXT NOT NULL UNIQUE,
      created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
      viewed_at INTEGER,
      FOREIGN KEY (folder_id) REFERENCES folders (id)
    );
  `);

  tx.executeSql(`
    CREATE TABLE IF NOT EXISTS images (
      id INTEGER PRIMARY KEY,
      document_id INTEGER NOT NULL,
      path TEXT NOT NULL,
      timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (document_id) REFERENCES documents (id)
    );
  `);
});

// Insert folder
const insertFolder = async (folder: {name: string}) => {
  return new Promise(async (resolve, reject) => {
    await db.transaction(tx => {
      tx.executeSql(
        `
        INSERT INTO folders (name)
        VALUES (?)
      `,
        [folder.name],
        (_tx, result) => {
          resolve(result.insertId);
        },
        (_tx, error) => {
          reject(error);
        },
      );
    });
  });
};

// Update folder
const updateFolder = async (id: number, folder: {name: string}) => {
  db.transaction(tx => {
    tx.executeSql(
      `
      UPDATE folders
      SET name = ?
      WHERE id = ?
    `,
      [folder.name, id],
    );
  });
};

const updateViewedAt = async (documentId: any) => {
  db.transaction(tx => {
    tx.executeSql(
      `
      UPDATE documents
      SET viewed_at = CURRENT_TIMESTAMP
      WHERE id = ?
    `,
      [documentId],
    );
  });
};

// Get all folders
const getFolders = async () => {
  const folders: Folder[] = [];

  await db.transaction(tx => {
    tx.executeSql('SELECT * FROM folders', [], (_, results) => {
      const rows = results.rows;
      for (let i = 0; i < rows.length; i++) {
        const row = rows.item(i);
        folders.push(row);
        console.log(row);
      }
    });
  });

  return folders;
};

// Delete folder
const deleteFolder = async (id: number) => {
  await db.transaction(tx => {
    // Delete documents associated with the folder
    tx.executeSql(
      `
      DELETE FROM documents
      WHERE folder_id = ?
    `,
      [id],
    );

    // Delete images associated with the documents
    tx.executeSql(
      `
      DELETE FROM images
      WHERE document_id IN (
        SELECT id
        FROM documents
        WHERE folder_id = ?
      );
    `,
      [id],
    );

    // Delete the folder
    tx.executeSql(
      `
      DELETE FROM folders
      WHERE id = ?
    `,
      [id],
    );
  });
};

// Insert document
const insertDocument = async (document: {name: string; folder_id: number}) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `
        INSERT INTO documents (name, folder_id)
        VALUES (?, ?)
      `,
        [document.name, document.folder_id],
        (_tx, result) => {
          resolve(result.insertId);
        },
        (_tx, error) => {
          reject(error);
        },
      );
    });
  });
};

// Update document
const updateDocument = async (
  id: number,
  document: {name: string; folder_id: number},
) => {
  db.transaction(tx => {
    tx.executeSql(
      `
      UPDATE documents
      SET name = ?, folder_id = ?
      WHERE id = ?
    `,
      [document.name, document.folder_id, id],
    );
  });
};

// Delete document
const deleteDocument = async (id: number) => {
  await db.transaction(tx => {
    // Delete images associated with the document
    tx.executeSql(
      `
      DELETE FROM images
      WHERE document_id = ?
    `,
      [id],
    );

    // Delete the document
    tx.executeSql(
      `
      DELETE FROM documents
      WHERE id = ?
    `,
      [id],
    );
  });
};

// Get all documents
const getDocuments = async () => {
  const query = `
    SELECT *
    FROM documents
  `;

  const documents: Document[] = [];

  await db.transaction(tx => {
    tx.executeSql(query, [], (_tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        documents.push({
          id: row.id,
          name: row.name,
          folder_id: row.folder_id,
          created_at: row.created_at,
          updated_at: row.updated_at,
          viewed_at: row.viewed_at,
        });
      }
    });
  });

  return documents;
};
// Get all documents
const getDocumentsByFolderID = async (id:number) => {
  const query = `
    SELECT *
    FROM documents WHERE folder_id = ? 
  `;

  const documents: Document[] = [];

  await db.transaction(tx => {
    tx.executeSql(query, [id], (_tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        documents.push({
          id: row.id,
          name: row.name,
          folder_id: row.folder_id,
          created_at: row.created_at,
          updated_at: row.updated_at,
          viewed_at: row.viewed_at,
        });
      }
    });
  });

  return documents;
};

// Insert image
const insertImage = async (image: {path: string; document_id: number}) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        `
        INSERT INTO images (path, document_id)
        VALUES (?, ?)
      `,
        [image.path, image.document_id],
        (_tx, result) => {
          resolve(result.insertId);
        },
        (_tx, error) => {
          reject(error);
        },
      );
    });
  });
};

// Update image
const updateImage = async (
  id: number,
  image: {path: string; document_id: number},
) => {
  db.transaction(tx => {
    tx.executeSql(
      `
      UPDATE images
      SET path = ?, document_id = ?
      WHERE id = ?
    `,
      [image.path, image.document_id, id],
    );
  });
};

// Delete image
const deleteImage = async (id: number) => {
  await db.transaction(tx => {
    // Delete the image
    tx.executeSql(
      `
      DELETE FROM images
      WHERE id = ?
    `,
      [id],
    );
  });
};

// Get images by document id
const getImagesByDocumentId = async (document_id: number) => {
  const query = `
    SELECT *
    FROM images
    WHERE document_id = ?
  `;

  const images: Image[] = [];

  await db.transaction(tx => {
    tx.executeSql(query, [document_id], (_tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        images.push({
          id: row.id,
          document_id: row.document_id,
          path: row.path,
          timestamp: row.timestamp,
        });
      }
    });
  });

  return images;
};

export {
  db,
  insertFolder,
  updateFolder,
  deleteFolder,
  getFolders,
  insertDocument,
  updateDocument,
  deleteDocument,
  getDocuments,
  getDocumentsByFolderID,
  insertImage,
  updateImage,
  deleteImage,
  getImagesByDocumentId,
  updateViewedAt,
};
