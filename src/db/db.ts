import SQLite from 'react-native-sqlite-storage';
import {Document, Folder, ImageProps} from '../interface';

const db = SQLite.openDatabase(
  {name: 'mydatabase.db', location: 'default'},
  () => {
    // console.log('Connection success!');
  },
  error => {
    console.error('Error opening database:', error);
  },
);

// Create tables
const createTables = () => {
  db.transaction(tx => {
    // Create folders table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS folders (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          name TEXT NOT NULL UNIQUE,
          timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP
        );`,
      [],
    );

    // Create documents table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS documents (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          folder_id INTEGER NOT NULL,
          name TEXT NOT NULL UNIQUE,
          created_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
          updated_at INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
          viewed_at INTEGER,
          FOREIGN KEY (folder_id) REFERENCES folders (id)
        );`,
      [],
    );

    // Create images table
    tx.executeSql(
      `CREATE TABLE IF NOT EXISTS images (
          id INTEGER PRIMARY KEY AUTOINCREMENT,
          img_order INTEGER NOT NULL,
          document_id INTEGER NOT NULL,
          path TEXT NOT NULL,
          timestamp INTEGER NOT NULL DEFAULT CURRENT_TIMESTAMP,
          FOREIGN KEY (document_id) REFERENCES documents (id)
        );`,
      [],
    );
  });
};

// Call the function to create tables
createTables();

// Insert folder
const insertFolder = async (folder: {name: string}) => {
  return new Promise(async (resolve, reject) => {
    await db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO folders (name) VALUES (?)',
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

    // Delete documents associated with the folder
    tx.executeSql(
      `
      DELETE FROM documents
      WHERE folder_id = ?
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
        'INSERT INTO documents (name, folder_id) VALUES (?, ?)',
        [document.name, document.folder_id],
        (_tx, result) => {
          // console.log('Insert successful:', result);
          resolve(result.insertId);
        },
        (_tx, error) => {
          //   console.error('Error inserting event:', error);
          reject(error);
        },
      );
    });
  });
};

// Update document
const updateDocument = async (document: {
  id: number;
  name?: string;
  folder_id?: number;
  viewed_at?: string | Date;
}) => {
  let query: string = 'UPDATE documents SET';
  const params: (string | number | Date)[] = [];

  if (document.name) {
    query += ' name = ?,';
    params.push(document.name);
  }

  if (document.folder_id) {
    query += ' folder_id = ?,';
    params.push(document.folder_id);
  }

  if (document.viewed_at) {
    query += ' viewed_at = ?';
    params.push(document.viewed_at);
  }
  if (params.length > 0) {
    query += ' WHERE id = ?';
    params.push(document.id);

    // Execute the SQL query
    db.transaction(tx => {
      tx.executeSql(query, params);
    });
  }
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
const getDocumentsByFolderID = async (id: number) => {
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

const insertImage = async (image: {
  path: string;
  document_id: number;
  order: number;
}) => {
  return new Promise((resolve, reject) => {
    db.transaction(tx => {
      tx.executeSql(
        'INSERT INTO images (path, document_id, img_order) VALUES (?, ?, ?)',
        [image.path, image.document_id, image.order],
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

  const images: ImageProps[] = [];

  await db.transaction(tx => {
    tx.executeSql(query, [document_id], (_tx, results) => {
      for (let i = 0; i < results.rows.length; i++) {
        const row = results.rows.item(i);
        images.push(row);
      }
    });
  });

  return images;
};

// Reorder image
const reOrderDocumnetImages = async (
  order: number,
  id: number,
  document_id: number,
) => {
  // console.log(order);
  db.transaction(tx => {
    tx.executeSql(
      `
      UPDATE images
      SET img_order = ?
      WHERE id = ? AND document_id = ?
      `,
      [order, document_id, id],
    );
  });
};

const deleteEmptyDocument = async () => {
  await db.transaction(tx => {
    // Delete the image
    tx.executeSql(
      'DELETE FROM documents WHERE id NOT IN (SELECT DISTINCT document_id FROM images);',
      [],
    );
  });
};

deleteEmptyDocument();

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
  reOrderDocumnetImages,
};
