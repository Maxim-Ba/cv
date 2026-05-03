import { Injectable, signal } from '@angular/core';
import { TagDto } from '../../api/models/dto/tag-dto';

type TTagID = number;

@Injectable({
  providedIn: 'root',
})
export class TechnologiesService {
  title: string = '';
  description: string = '';
  tags: TagDto[] = [];
  _isOpen = signal<boolean>(false);

  public get isOpen() {
    return this._isOpen();
  }
  tagFilter = signal<TTagID[]>([]);
  onClose() {
    this._isOpen.set(false);
  }
  onOpen(title: string, description: string | null, tags: TagDto[]) {
    this.description = description ?? '';
    this.title = title;
    this.tags = tags;
    this._isOpen.set(true);
  }

  filter(tagId: TTagID) {
    this.tagFilter.update((prev) => {
      return prev.includes(tagId)
        ? prev.filter((id) => id !== tagId)
        : [...prev, tagId];
    });
  }
}
