import { User } from '../models/user';

export interface Post {
  id: number;
  user: User;
  date: string;
  content: string;
  link: string;
  parent: number;
  likes: number;
  comments: number;
  image: string;
  videoUrl: string;
  safeVideoUrl;
  reply_set: Post[];
}
