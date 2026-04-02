import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignAssessmentEdit } from './assign-assessment-edit';

describe('AssignAssessmentEdit', () => {
  let component: AssignAssessmentEdit;
  let fixture: ComponentFixture<AssignAssessmentEdit>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignAssessmentEdit]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignAssessmentEdit);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
