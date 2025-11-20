export interface Source {
  title: string;
  url: string;
  uri: string;
  author: string;
  image: string;
}

export interface ImageData {
  url: string;
  thumbnail: string;
  description: string;
}

export interface SearchResponse {
  response: string;
  followUpQuestions: string[];
  sources: Source[];
  images: ImageData[];
  contextualQuery: string;
}

export interface ConversationMessage {
  user?: string;
  assistant?: string;
}
