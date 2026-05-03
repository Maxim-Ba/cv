import { TAGS } from '../constants/tags';

export interface ITechnologyItem {
  title: string;
  id: string;
  description: string;
  tags: (keyof typeof TAGS)[];
  logo: string | null;
}

export interface ITag {
  name: string;
  id: string;
  color: string;
  tooltipTitle?: string;
}
