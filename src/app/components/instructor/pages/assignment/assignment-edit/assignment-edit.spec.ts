import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignmentEdit } from './assignment-edit';

describe('AssignmentEdit', () => {
  let component: AssignmentEdit;
  let fixture: ComponentFixture<AssignmentEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignmentEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignmentEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
