/**
 * Hand-written Supabase schema types — scoped to the Make My Day (`mmd_`) tables
 * that this app touches. Other apps share the same project but live in their own
 * tables, which we deliberately do not type here.
 */

export type Profile = {
  id: string;
  username: string | null;
  display_name: string | null;
  avatar_emoji: string;
  language: string;
  home_lat: number | null;
  home_lng: number | null;
  home_label: string | null;
  xp: number;
  level: number;
  streak_count: number;
  last_completed_date: string | null;
  is_premium: boolean;
  created_at: string;
  updated_at: string;
}

export type Category = {
  id: string;
  name_nl: string;
  name_en: string;
  icon: string;
  color: string;
  osm_filters: string[];
  sort_order: number;
}

export type Activity = {
  id: string;
  category_id: string | null;
  title_nl: string;
  title_en: string;
  description_nl: string | null;
  description_en: string | null;
  emoji: string;
  min_duration: number;
  indoor: boolean;
  tags: string[];
}

export type Challenge = {
  id: string;
  slug: string;
  title_nl: string;
  title_en: string;
  description_nl: string | null;
  description_en: string | null;
  points: number;
  difficulty: 'easy' | 'medium' | 'hard';
  category_id: string | null;
  icon: string;
}

export type Completion = {
  id: string;
  user_id: string;
  title: string;
  category_id: string | null;
  source: string;
  lat: number | null;
  lng: number | null;
  place_name: string | null;
  points: number;
  note: string | null;
  photo_url: string | null;
  completed_at: string;
}

export type PostFeedRow = {
  id: string;
  user_id: string;
  body: string;
  image_url: string | null;
  activity_title: string | null;
  place_name: string | null;
  created_at: string;
  author_name: string;
  author_avatar: string;
  author_level: number | null;
  like_count: number;
  comment_count: number;
  liked_by_me: boolean;
}

export type UserChallenge = {
  id: string;
  user_id: string;
  challenge_id: string;
  completed_at: string;
}

type Identity<T> = T;
type Insertable<T, Optional extends keyof T> = Identity<
  Omit<T, Optional> & Partial<Pick<T, Optional>>
>;

type Rel = [];

export interface Database {
  public: {
    Tables: {
      mmd_profiles: {
        Row: Profile;
        Insert: Insertable<Profile, keyof Profile>;
        Update: Partial<Profile>;
        Relationships: Rel;
      };
      mmd_categories: {
        Row: Category;
        Insert: Category;
        Update: Partial<Category>;
        Relationships: Rel;
      };
      mmd_activities: {
        Row: Activity;
        Insert: Activity;
        Update: Partial<Activity>;
        Relationships: Rel;
      };
      mmd_challenges: {
        Row: Challenge;
        Insert: Challenge;
        Update: Partial<Challenge>;
        Relationships: Rel;
      };
      mmd_completions: {
        Row: Completion;
        Insert: Insertable<Completion, 'id' | 'completed_at'>;
        Update: Partial<Completion>;
        Relationships: Rel;
      };
      mmd_user_challenges: {
        Row: UserChallenge;
        Insert: Insertable<UserChallenge, 'id' | 'completed_at'>;
        Update: Partial<UserChallenge>;
        Relationships: Rel;
      };
      mmd_posts: {
        Row: {
          id: string;
          user_id: string;
          body: string;
          image_url: string | null;
          activity_title: string | null;
          place_name: string | null;
          created_at: string;
        };
        Insert: {
          user_id: string;
          body: string;
          image_url?: string | null;
          activity_title?: string | null;
          place_name?: string | null;
        };
        Update: Partial<{ body: string; image_url: string | null }>;
        Relationships: Rel;
      };
      mmd_post_likes: {
        Row: { post_id: string; user_id: string; created_at: string };
        Insert: { post_id: string; user_id: string };
        Update: Partial<{ post_id: string; user_id: string }>;
        Relationships: Rel;
      };
      mmd_post_comments: {
        Row: {
          id: string;
          post_id: string;
          user_id: string;
          body: string;
          created_at: string;
        };
        Insert: { post_id: string; user_id: string; body: string };
        Update: Partial<{ body: string }>;
        Relationships: Rel;
      };
      mmd_favorites: {
        Row: { user_id: string; activity_id: string; created_at: string };
        Insert: { user_id: string; activity_id: string };
        Update: Partial<{ user_id: string; activity_id: string }>;
        Relationships: Rel;
      };
    };
    Views: {
      mmd_post_feed: { Row: PostFeedRow; Relationships: Rel };
    };
    Functions: {
      mmd_complete_activity: {
        Args: {
          p_title: string;
          p_category_id?: string | null;
          p_source?: string;
          p_lat?: number | null;
          p_lng?: number | null;
          p_place_name?: string | null;
          p_points?: number;
          p_note?: string | null;
        };
        Returns: Profile;
      };
      mmd_complete_challenge: {
        Args: { p_challenge_id: string };
        Returns: Profile;
      };
      mmd_ensure_profile: { Args: Record<string, never>; Returns: Profile };
    };
  };
}
