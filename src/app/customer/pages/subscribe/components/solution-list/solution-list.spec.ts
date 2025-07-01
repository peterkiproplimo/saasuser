import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionList } from './solution-list';

describe('SolutionList', () => {
  let component: SolutionList;
  let fixture: ComponentFixture<SolutionList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolutionList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolutionList);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
