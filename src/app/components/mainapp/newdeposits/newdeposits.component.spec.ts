import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { NewdepositsComponent } from './newdeposits.component';

describe('NewdepositsComponent', () => {
  let component: NewdepositsComponent;
  let fixture: ComponentFixture<NewdepositsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ NewdepositsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(NewdepositsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
