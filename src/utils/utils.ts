import RNFS from 'react-native-fs';

export const getFileSize = async (filePath:string) => {
  try {
    // console.log(filePath)
    const fileInfo = await RNFS.stat(filePath);
    const fileSize = fileInfo.size;
    return fileSize;
  } catch (error) {
    console.error('Error getting file size:', error);
    return 0;
  }
};

export function formatFileSize(size: number): string {
  if (size < 1024) {
    return `${size.toFixed(0)} bytes`;
  } else if (size < 1024 * 1024) {
    return `${(size / 1024).toFixed(0)} KB`;
  } else if (size < 1024 * 1024 * 1024) {
    return `${(size / (1024 * 1024)).toFixed(2)} MB`;
  } else {
    return `${(size / (1024 * 1024 * 1024)).toFixed(2)} GB`;
  }
}

export const shortenText = (text:string, n:number = 25) => {
  let len = text.length;
  return n > len ? text : text.substring(0, n) + '...';
};
