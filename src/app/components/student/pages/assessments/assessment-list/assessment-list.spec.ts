import { ComponentFixture, TestBed } from '@angular/core/testing';

import { StudentAssessmentList } from './assessment-list';

describe('StudentAssessmentList', () => {
  let component: StudentAssessmentList;
  let fixture: ComponentFixture<StudentAssessmentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [StudentAssessmentList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(StudentAssessmentList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
