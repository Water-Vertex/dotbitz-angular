import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentAttempt } from './assessment-attempt';

describe('AssessmentAttempt', () => {
  let component: AssessmentAttempt;
  let fixture: ComponentFixture<AssessmentAttempt>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentAttempt]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentAttempt);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
