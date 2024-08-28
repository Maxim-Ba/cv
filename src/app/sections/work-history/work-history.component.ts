import { Component, inject, OnInit } from '@angular/core';
import { WorkHistoryService } from '../../services/work-history/work-history.service';
import { Observable, take } from 'rxjs';
import { AsyncPipe, SlicePipe } from '@angular/common';
import { IWorkHistoryItem } from '../../services/work-history/types';
import { TechnologyItemComponent } from '../../widgets/technology-item/technology-item.component';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';
import { SectionWrapperComponent } from '../../shared/ui-kit/section-wrapper/section-wrapper.component';

@Component({
  selector: 'app-work-history',
  standalone: true,
  imports: [
    AsyncPipe,
    SlicePipe,
    SectionWrapperComponent,
    TechnologyItemComponent,
    MarginsDirective,
  ],
  templateUrl: './work-history.component.html',
  styleUrl: './work-history.component.scss',
})
export class WorkHistoryComponent implements OnInit {
  constructor(private workHistoryService: WorkHistoryService) {}

  public works$?: Observable<IWorkHistoryItem[]>;
  public title = 'Места работы';
  ngOnInit(): void {
    this.works$ = this.workHistoryService.getTest();
  }
}
