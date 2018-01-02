import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ForgotpasswordvalidatecodeComponent } from './forgotpasswordvalidatecode.component';

describe('ForgotpasswordvalidatecodeComponent', () => {
  let component: ForgotpasswordvalidatecodeComponent;
  let fixture: ComponentFixture<ForgotpasswordvalidatecodeComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ ForgotpasswordvalidatecodeComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ForgotpasswordvalidatecodeComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
