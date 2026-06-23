import { ComponentFixture, TestBed } from '@angular/core/testing';

import { AssessmentCheck } from './assessment-check';

describe('AssessmentCheck', () => {
  let component: AssessmentCheck;
  let fixture: ComponentFixture<AssessmentCheck>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [AssessmentCheck]
    })
    .compileComponents();

    fixture = TestBed.createComponent(AssessmentCheck);
    component = fixture.componentInstance;
    await fixture.whenStable();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
