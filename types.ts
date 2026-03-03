
export interface Character {
  id: string;
  name: string;
  images: string[]; // Base64 strings
  savedPrompts?: string[]; // Character-specific favorite prompts
  createdAt: number;
}

export interface GeneratedImage {
  id: string;
  originalImages: string[];
  resultImages: string[];
  prompt: string;
  timestamp: number;
}

export enum AppState {
  IDLE = 'IDLE',
  UPLOADING = 'UPLOADING', 
  PROCESSING = 'PROCESSING', 
  SUCCESS = 'SUCCESS',
  ERROR = 'ERROR'
}

export enum AppMode {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO'
}

export interface GeneratedVideo {
  id: string;
  url: string;
  prompt: string;
  timestamp: number;
}
