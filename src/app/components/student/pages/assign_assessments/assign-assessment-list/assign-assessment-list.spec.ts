import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssignAssessmentList } from './assign-assessment-list';

describe('AssignAssessmentList', () => {
  let component: AssignAssessmentList;
  let fixture: ComponentFixture<AssignAssessmentList>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssignAssessmentList]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssignAssessmentList);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
