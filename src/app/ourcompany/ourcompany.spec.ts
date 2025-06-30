import { ComponentFixture, TestBed } from '@angular/core/testing';

import { OurCompany } from './ourcompany';

describe('OurCompany', () => {
  let component: OurCompany;
  let fixture: ComponentFixture<OurCompany>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [OurCompany]
    })
    .compileComponents();

    fixture = TestBed.createComponent(OurCompany);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
