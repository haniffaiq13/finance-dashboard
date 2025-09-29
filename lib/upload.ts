import { Attachment } from '@/types';

// File upload adapter - currently uses object URLs for demo
// TODO: Replace with actual API calls when backend is ready
export const uploadFile = async (file: File): Promise<{ url: string }> => {
  // Simulate upload delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // For demo purposes, create object URL
  // In production, this would upload to your backend/storage service
  const url = URL.createObjectURL(file);
  
  return { url };
};

export const createAttachment = async (file: File): Promise<Attachment> => {
  const { url } = await uploadFile(file);
  
  return {
    id: `attachment-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
    name: file.name,
    url,
    mimeType: file.type,
    size: file.size
  };
};

export const validateFileType = (file: File): boolean => {
  const allowedTypes = [
    'image/jpeg',
    'image/jpg', 
    'image/png',
    'application/pdf'
  ];
  
  return allowedTypes.includes(file.type);
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

// Cleanup object URLs to prevent memory leaks
export const cleanupObjectURL = (url: string): void => {
  if (url.startsWith('blob:')) {
    URL.revokeObjectURL(url);
  }
};

// TODO: When integrating with real backend, replace uploadFile with:
/*
export const uploadFile = async (file: File): Promise<{ url: string }> => {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/upload`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${getToken()}`, // from auth store
    },
    body: formData,
  });
  
  if (!response.ok) {
    throw new Error('Upload failed');
  }
  
  const { url } = await response.json();
  return { url };
};
*/