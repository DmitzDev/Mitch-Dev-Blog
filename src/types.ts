export interface Post {
  id: string;
  title: string;
  slug: string;
  content: string;
  excerpt: string;
  authorId: string;
  authorName: string;
  category: string;
  tags: string[];
  coverImage: string;
  publishedAt: number;
  createdAt: number;
  updatedAt: number;
  likes: number;
  views?: number;
  comments?: number;
}

export interface Comment {
  id: string;
  postId: string;
  userId: string;
  userName: string;
  content: string;
  createdAt: number;
}
