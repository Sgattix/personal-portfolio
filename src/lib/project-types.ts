export type ProjectVersion = {
  id: string;
  title: string;
  description: string;
  date: string;
  features: string[];
};

export type Project = {
  id: string;
  title: string;
  description: string;
  technologies: string[];
  link: string;
  category: string;
  date: string;
  thumbnail: string;
  difficulty: number;
  proudness: number;
  features: string[];
  repository?: string;
  versions?: ProjectVersion[];
};
