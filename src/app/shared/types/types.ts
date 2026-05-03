export interface ITag {
  id: number;
  name: string;
  hexColor: string;
}

export interface ITechnologyItem {
  id: number;
  title: string;
  description: string | null;
  logoUrl: string | null;
  tags: ITag[];
}

export interface IWorkHistoryItem {
  id: number;
  name: string;
  about: string;
  logoUrl: string;
  periodStart: string | null;
  periodEnd: string | null;
  whatIDid: string[];
  projects: string[];
  technologies: ITechnologyItem[];
}

export interface IEducationItem {
  id: number;
  name: string | null;
  year: number;
  course: string;
  organization: string;
}

export interface IPageableResponse<T> {
  total: number;
  content: T[];
  page: number;
  size: number;
}
