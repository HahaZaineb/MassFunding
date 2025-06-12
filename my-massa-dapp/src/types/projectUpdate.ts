export interface ProjectUpdateData {
  id: string;
  date: string;
  title: string;
  content: string;
  author: string;
  image?: string;
}

export interface ProjectUpdateInput {
  title: string;
  content: string;
  author: string;
  image?: string;
}
