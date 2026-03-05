export interface Project {
  id: string;
  title: string;
  description?: string;
  liveUrl?: string;
  githubUrl?: string;
  tags?: string[];
  createdAt: number;
}
