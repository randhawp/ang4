import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { RecepitsComponent } from './recepits.component';

describe('RecepitsComponent', () => {
  let component: RecepitsComponent;
  let fixture: ComponentFixture<RecepitsComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ RecepitsComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RecepitsComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
