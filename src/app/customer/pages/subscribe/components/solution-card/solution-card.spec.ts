import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SolutionCard } from './solution-card';

describe('SolutionCard', () => {
  let component: SolutionCard;
  let fixture: ComponentFixture<SolutionCard>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SolutionCard]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SolutionCard);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
