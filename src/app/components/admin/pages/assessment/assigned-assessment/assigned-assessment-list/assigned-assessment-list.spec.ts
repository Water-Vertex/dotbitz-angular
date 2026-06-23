import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignedAssessmentList } from './assigned-assessment-list';

describe('AssignedAssessmentList', () => {
  let component: AssignedAssessmentList;
  let fixture: ComponentFixture<AssignedAssessmentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignedAssessmentList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignedAssessmentList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
