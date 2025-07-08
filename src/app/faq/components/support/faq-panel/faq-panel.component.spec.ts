import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FaqPanelComponent } from './faq-panel.component';

describe('FaqPanelComponent', () => {
  let component: FaqPanelComponent;
  let fixture: ComponentFixture<FaqPanelComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [FaqPanelComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(FaqPanelComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
