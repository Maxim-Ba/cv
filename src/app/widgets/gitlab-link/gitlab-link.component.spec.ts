import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GitlabLinkComponent } from './gitlab-link.component';

describe('GitlabLinkComponent', () => {
  let component: GitlabLinkComponent;
  let fixture: ComponentFixture<GitlabLinkComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GitlabLinkComponent]
    })
    .compileComponents();
    
    fixture = TestBed.createComponent(GitlabLinkComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
