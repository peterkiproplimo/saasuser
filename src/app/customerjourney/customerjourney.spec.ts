import { ComponentFixture, TestBed } from '@angular/core/testing';

import { customerjourney } from './customerjourney';

describe('customerjourney', () => {
  let component: customerjourney;
  let fixture: ComponentFixture<customerjourney>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [customerjourney]
    })
    .compileComponents();

    fixture = TestBed.createComponent(customerjourney);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
