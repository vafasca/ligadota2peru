import { ComponentFixture, TestBed } from '@angular/core/testing';

import { FormatRulesComponent } from './format-rules.component';

describe('FormatRulesComponent', () => {
  let component: FormatRulesComponent;
  let fixture: ComponentFixture<FormatRulesComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [FormatRulesComponent]
    });
    fixture = TestBed.createComponent(FormatRulesComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
