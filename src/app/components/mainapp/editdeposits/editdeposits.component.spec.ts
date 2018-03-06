import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditdepositsComponent } from './editdeposits.component';

describe('EditdepositsComponent', () => {
  let component: EditdepositsComponent;
  let fixture: ComponentFixture<EditdepositsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditdepositsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditdepositsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
