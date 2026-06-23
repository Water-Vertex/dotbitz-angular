import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAssessmentResult } from './assessment-result';

describe('StudentAssessmentResult', () => {
  let component: StudentAssessmentResult;
  let fixture: ComponentFixture<StudentAssessmentResult>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAssessmentResult]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentAssessmentResult);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
