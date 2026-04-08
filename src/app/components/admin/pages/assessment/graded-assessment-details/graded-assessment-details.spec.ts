import { ComponentFixture, TestBed } from '@angular/core/testing';

import { GradedAssessmentDetails } from './graded-assessment-details';

describe('GradedAssessmentDetails', () => {
  let component: GradedAssessmentDetails;
  let fixture: ComponentFixture<GradedAssessmentDetails>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [GradedAssessmentDetails]
    })
    .compileComponents();

    fixture = TestBed.createComponent(GradedAssessmentDetails);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
