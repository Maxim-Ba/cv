import { HttpClient } from '@angular/common/http';
import { Injectable, signal } from '@angular/core';
import { TAGS } from '../../shared/constants/tags';

type TTagID = string;

@Injectable({
  providedIn: 'root',
})
export class TechnologiesService {
  constructor(private httpClient: HttpClient) {}
  title: string = '';
  description: string = '';
  tagsIDs: string[] = [];
  _isOpen = signal<boolean>(false);

  public get isOpen() {
    return this._isOpen();
  }
  tagFilter = signal<TTagID[]>([]);
  onClose() {
    this._isOpen.set(false);
  }
  onOpen(title: string, description: string, tagsIDs: string[]) {
    this.description = description;
    this.title = title;
    this.tagsIDs = tagsIDs;
    this._isOpen.set(true);
  }

  filter(tagId: TTagID) {
    this.tagFilter.update((prev) => {
      return prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId];
    });
  }

  getTagsByTagNames(tagNames: string[]) {
    return Object.values(TAGS).filter((tag) => tagNames.includes(tag.name));
  }
}
