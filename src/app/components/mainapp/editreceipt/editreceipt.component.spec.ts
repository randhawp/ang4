import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { EditreceiptComponent } from './editreceipt.component';

describe('EditreceiptComponent', () => {
  let component: EditreceiptComponent;
  let fixture: ComponentFixture<EditreceiptComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ EditreceiptComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(EditreceiptComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
