import { Component } from '@angular/core';
import { MarginsDirective } from '../../shared/directive/margins/margins.directive';

@Component({
  selector: 'app-main-info',
  standalone: true,
  imports: [MarginsDirective],
  templateUrl: './main-info.component.html',
  styleUrl: './main-info.component.scss',
})
export class MainInfoComponent {}
