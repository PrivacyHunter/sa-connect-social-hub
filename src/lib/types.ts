export interface Profile {
  id: string;
  username: string;
  display_name: string;
  bio: string;
  avatar_url: string | null;
  banner_url: string | null;
  created_at: string;
}

export type ConversationType = "dm" | "group" | "channel";

export interface Conversation {
  id: string;
  type: ConversationType;
  name: string | null;
  avatar_url: string | null;
  created_by: string;
  last_message_at: string | null;
  last_message_body: string | null;
  pinned_body: string | null;
  pinned_at: string | null;
  conversation_members: ConversationMember[];
}

export interface ConversationMember {
  user_id: string;
  last_read_at: string | null;
  profiles: Profile;
}

export interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  body: string | null;
  kind: "text" | "image" | "file" | "voice";
  media_url: string | null;
  file_name: string | null;
  duration_seconds: number | null;
  created_at: string;
  profiles: Profile;
}

export interface PostMedia {
  id: string;
  post_id: string;
  url: string;
  position: number;
}

export interface Post {
  id: string;
  author_id: string;
  caption: string;
  created_at: string;
  profiles: Profile;
  post_media: PostMedia[];
  post_likes: { user_id: string }[];
  post_bookmarks: { user_id: string }[];
  comments: { count: number }[];
}

export interface Comment {
  id: string;
  post_id: string;
  author_id: string;
  body: string;
  created_at: string;
  profiles: Profile;
}

export interface Story {
  id: string;
  author_id: string;
  media_url: string;
  caption: string | null;
  created_at: string;
  expires_at: string;
  profiles: Profile;
}

export interface Reel {
  id: string;
  author_id: string;
  video_url: string;
  caption: string;
  music_title: string | null;
  created_at: string;
  profiles: Profile;
  reel_likes: { user_id: string }[];
  reel_comments: { count: number }[];
}

export interface ReelComment {
  id: string;
  reel_id: string;
  author_id: string;
  body: string;
  created_at: string;
  profiles: Profile;
}

export interface Video {
  id: string;
  channel_id: string;
  title: string;
  description: string;
  video_url: string;
  thumbnail_url: string | null;
  duration_seconds: number | null;
  views: number;
  created_at: string;
  profiles: Profile;
  video_likes: { user_id: string; value: number }[];
  video_bookmarks: { user_id: string }[];
}
