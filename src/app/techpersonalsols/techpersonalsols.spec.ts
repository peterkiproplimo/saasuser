import { ComponentFixture, TestBed } from '@angular/core/testing';

import { PersonalSolutionsComponent } from './techpersonalsols';

describe('PersonalSolutionsComponent', () => {
  let component: PersonalSolutionsComponent;
  let fixture: ComponentFixture<PersonalSolutionsComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [PersonalSolutionsComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(PersonalSolutionsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
