import { ComponentFixture, TestBed } from '@angular/core/testing';

import { BuscarRivalesComponentComponent } from './buscar-rivales-component.component';

describe('BuscarRivalesComponentComponent', () => {
  let component: BuscarRivalesComponentComponent;
  let fixture: ComponentFixture<BuscarRivalesComponentComponent>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      declarations: [BuscarRivalesComponentComponent]
    });
    fixture = TestBed.createComponent(BuscarRivalesComponentComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
