import { ComponentFixture, TestBed } from '@angular/core/testing';

import { ReactiveTextAreaComponent } from './reactive-text-area.component';

describe('ReactiveTextAreaComponent', () => {
  let component: ReactiveTextAreaComponent;
  let fixture: ComponentFixture<ReactiveTextAreaComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      declarations: [ ReactiveTextAreaComponent ]
    })
    .compileComponents();

    fixture = TestBed.createComponent(ReactiveTextAreaComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
