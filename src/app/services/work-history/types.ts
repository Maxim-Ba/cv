import { ITechnologyItem } from '../../shared/types/types';

export interface IWorkHistoryItem {
  name: string;
  about: string;
  startPeriod: Date;
  endPeriod: Date;
  whatIDid: string[];
  previews: string[];
  projects: string[];
  technologies: ITechnologyItem[];
  id: string;
}
