export interface User {
  username: string;
  bio?: string;
  verified?: number;
  followersCount?: number;
  profilePicture?: string;
  coverPhoto?: string;
}

export interface Post {
  id: string;
  username: string;
  content: string;
  media?: string;
  profilePicture?: string;
  createdAt: string;
  likes: number;
  verified?: number;
}

export type View = 'home' | 'search' | 'post' | 'profile' | 'auth';
