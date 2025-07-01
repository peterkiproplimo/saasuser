import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SideBarItem } from './side-bar-item';

describe('SideBarItem', () => {
  let component: SideBarItem;
  let fixture: ComponentFixture<SideBarItem>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SideBarItem]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SideBarItem);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
