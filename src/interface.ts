export interface Document {
  id: number;
  name: string;
  folder_id: number;
  created_at: string;
  updated_at: string;
  viewed_at: string;
  images?: Image[] | null;
  folder_name?: string | null;
}

export interface Image {
  id: number;
  order: number;
  document_id: number;
  path: string;
  timestamp: number;
}

export interface Folder {
  id: number;
  name: string;
  timestamp: number;
}
