import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AccessCodeDialogComponent } from './access-code-dialog.component';

describe('AccessCodeDialogComponent', () => {
  let component: AccessCodeDialogComponent;
  let fixture: ComponentFixture<AccessCodeDialogComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [AccessCodeDialogComponent]
    });
    fixture = TestBed.createComponent(AccessCodeDialogComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
