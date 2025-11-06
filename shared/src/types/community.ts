import { TranslatedText, GeoPoint } from './common';

export enum PostType {
  COMPLETION = 'COMPLETION',
  TIP = 'TIP',
  QUESTION = 'QUESTION',
}

export enum PostVisibility {
  PUBLIC = 'PUBLIC',
  FRIENDS = 'FRIENDS',
  PRIVATE = 'PRIVATE',
}

export enum MediaType {
  PHOTO = 'PHOTO',
  VIDEO = 'VIDEO',
}

export interface PostMedia {
  type: MediaType;
  url: string;
}

export interface PostContent {
  text: string;
  originalLanguage: string;
  translations?: Record<string, string>;
}

export interface CommunityPost {
  id: string;
  userId: string;
  activityId?: string;
  type: PostType;
  content: PostContent;
  media?: PostMedia[];
  rating?: number;
  location?: GeoPoint;
  tags: string[];
  likes: number;
  comments: number;
  created: Date;
  visibility: PostVisibility;
}

export interface CreatePostDto {
  activityId?: string;
  type: PostType;
  text: string;
  media?: PostMedia[];
  rating?: number;
  location?: {
    lat: number;
    lng: number;
  };
  tags?: string[];
  visibility?: PostVisibility;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  text: string;
  originalLanguage: string;
  created: Date;
}

export interface CreateCommentDto {
  postId: string;
  text: string;
}
