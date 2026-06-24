import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignEdit } from './assign-edit';

describe('AssignEdit', () => {
  let component: AssignEdit;
  let fixture: ComponentFixture<AssignEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
