export interface Document {
  id: number;
  name: string;
  folder_id: number;
  created_at: string;
  updated_at: string;
  viewed_at: string;
  images?: ImageProps[] | null;
  folder_name?: string | null;
}

export interface ImageProps {
  id: number | string;
  img_order: number | string;
  document_id: number | string;
  path: string | string;
  timestamp: number | string;
}

export interface Folder {
  id: number;
  name: string;
  timestamp: number;
}
